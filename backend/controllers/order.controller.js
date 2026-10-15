import crypto from "crypto";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import { getRazorpay, isRazorpayConfigured } from "../config/razorpay.js";
import validateShipping from "../utils/validateShipping.js";
import asyncHandler from "../utils/asyncHandler.js";

const bad = (res, status, message) => res.status(status).json({ success: false, message });

class StockReservationError extends Error {}

const reserveInventory = async (items) => {
  const reserved = [];
  for (const item of items) {
    const result = await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
    if (result.modifiedCount !== 1) {
      await restoreInventory(reserved);
      const product = await Product.findById(item.product).select("name").lean();
      throw new StockReservationError(
        product ? `Insufficient stock for ${product.name}.` : "A product in your cart is no longer available."
      );
    }
    reserved.push(item);
  }
};

const restoreInventory = async (items) => {
  if (!items.length) return;
  await Product.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: item.quantity } },
      },
    }))
  );
};

// Atomically release an unpaid reservation once, even if cancellation and payment
// callbacks arrive at nearly the same time.
const failPendingOrder = async (orderId, userId) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, user: userId, paymentStatus: "PENDING", inventoryReserved: true },
    { $set: { paymentStatus: "FAILED", inventoryReserved: false } },
    { new: true }
  );
  if (order) await restoreInventory(order.items);
  return order;
};

// POST /orders/create-payment-order
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { value: shippingAddress, error } = validateShipping(req.body?.shippingAddress);
  if (error) return bad(res, 400, error);

  if (!isRazorpayConfigured()) {
    return bad(res, 503, "Payment gateway is not configured on the server");
  }

  const customer = await Customer.findById(req.user._id).populate("cart.product");
  if (!customer.cart.length) return bad(res, 400, "Your cart is empty");

  const items = [];
  let totalAmount = 0;

  for (const cartItem of customer.cart) {
    const product = cartItem.product;
    if (!product) {
      return bad(res, 400, "A product in your cart is no longer available. Please review your cart.");
    }
    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      image: product.image,
    });
    totalAmount += product.price * cartItem.quantity;
  }

  try {
    await reserveInventory(items);
  } catch (err) {
    if (err instanceof StockReservationError) return bad(res, 400, err.message);
    throw err;
  }

  let order;
  try {
    order = await Order.create({
      user: customer._id,
      items,
      shippingAddress,
      totalAmount,
      inventoryReserved: true,
    });
  } catch (err) {
    await restoreInventory(items);
    throw err;
  }

  let razorpayOrder;
  try {
    razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err?.error || err);
    await failPendingOrder(order._id, customer._id);
    return bad(res, 502, "Unable to start payment. Please try again.");
  }

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.status(201).json({
    success: true,
    shopKartOrderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// POST /orders/verify-payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body || {};

  if (!mongoose.isValidObjectId(shopKartOrderId)) return bad(res, 400, "Invalid order ID");
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return bad(res, 400, "Payment details are required");
  }

  const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
  if (!order) return bad(res, 404, "Order not found");

  if (order.paymentStatus === "PAID") {
    return res.status(200).json({ success: true, message: "Payment already verified", order });
  }

  if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
    return bad(res, 400, "Payment does not match this order");
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(String(razorpay_signature));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return bad(res, 400, "Invalid payment signature");
  }

  const paidOrder = await Order.findOneAndUpdate(
    {
      _id: order._id,
      user: req.user._id,
      paymentStatus: "PENDING",
      inventoryReserved: true,
    },
    {
      $set: {
        paymentStatus: "PAID",
        status: "PLACED",
        razorpayPaymentId: razorpay_payment_id,
        inventoryReserved: false,
      },
    },
    { new: true }
  );
  if (!paidOrder) {
    return bad(res, 409, "This payment attempt is no longer active. Please contact support if you were charged.");
  }

  await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });

  res.status(200).json({ success: true, message: "Payment verified. Order placed.", order: paidOrder });
});

// POST /orders/payment-failed   body: { shopKartOrderId }
export const markPaymentFailed = asyncHandler(async (req, res) => {
  const { shopKartOrderId } = req.body || {};
  if (!mongoose.isValidObjectId(shopKartOrderId)) return bad(res, 400, "Invalid order ID");

  await failPendingOrder(shopKartOrderId, req.user._id);
  res.status(200).json({ success: true, message: "Payment marked as failed" });
});

// GET /orders  (paid orders of the current user, newest first)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id, paymentStatus: "PAID" })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({ success: true, count: orders.length, orders });
});

// GET /orders/:id  (must be owned by the current user)
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return bad(res, 400, "Invalid order ID");

  const order = await Order.findOne({ _id: id, user: req.user._id }).lean();
  if (!order) return bad(res, 404, "Order not found");

  res.status(200).json({ success: true, order });
});
