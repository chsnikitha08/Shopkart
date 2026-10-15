import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const bad = (res, status, message) => res.status(status).json({ success: false, message });

const loadCart = async (userId) => {
  const customer = await Customer.findById(userId).populate({
    path: "cart.product",
    select: "name price category image stock",
  });
  return customer.cart
    .filter((item) => item.product)
    .map((item) => ({ product: item.product, quantity: item.quantity }));
};

const findItem = (user, productId) => user.cart.find((i) => i.product.equals(productId));

// POST /cart/:productId  -> add 1 (or +1 if already in cart)
export const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) return bad(res, 400, "Invalid product ID");

  const product = await Product.findById(productId);
  if (!product) return bad(res, 404, "Product not found");

  const existing = findItem(req.user, productId);
  const newQuantity = (existing ? existing.quantity : 0) + 1;

  if (newQuantity > product.stock) {
    return bad(
      res,
      400,
      product.stock === 0
        ? `${product.name} is out of stock`
        : `Only ${product.stock} unit(s) of ${product.name} available`
    );
  }

  if (existing) {
    await Customer.updateOne(
      { _id: req.user._id, "cart.product": product._id },
      { $set: { "cart.$.quantity": newQuantity } }
    );
  } else {
    await Customer.updateOne(
      { _id: req.user._id, "cart.product": { $ne: product._id } },
      { $push: { cart: { product: product._id, quantity: 1 } } }
    );
  }

  res.status(200).json({ success: true, message: "Cart updated", cart: await loadCart(req.user._id) });
});

// GET /cart
export const getCart = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, cart: await loadCart(req.user._id) });
});

// PATCH /cart/:productId   body: { quantity }
export const updateQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body || {};

  if (!mongoose.isValidObjectId(productId)) return bad(res, 400, "Invalid product ID");
  if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
    return bad(res, 400, "Quantity must be a whole number");
  }
  if (quantity < 1) return bad(res, 400, "Quantity must be at least 1");

  const product = await Product.findById(productId);
  if (!product) return bad(res, 404, "Product not found");
  if (!findItem(req.user, productId)) return bad(res, 404, "Product not in cart");

  if (quantity > product.stock) {
    return bad(res, 400, `Only ${product.stock} unit(s) of ${product.name} available`);
  }

  await Customer.updateOne(
    { _id: req.user._id, "cart.product": product._id },
    { $set: { "cart.$.quantity": quantity } }
  );

  res.status(200).json({ success: true, message: "Quantity updated", cart: await loadCart(req.user._id) });
});

// DELETE /cart/:productId
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) return bad(res, 400, "Invalid product ID");
  if (!findItem(req.user, productId)) return bad(res, 404, "Product not in cart");

  await Customer.updateOne({ _id: req.user._id }, { $pull: { cart: { product: productId } } });

  res.status(200).json({ success: true, message: "Item removed", cart: await loadCart(req.user._id) });
});
