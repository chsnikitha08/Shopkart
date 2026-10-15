import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const bad = (res, status, message) => res.status(status).json({ success: false, message });

const loadProduct = async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) {
    bad(res, 400, "Invalid product ID");
    return null;
  }
  const product = await Product.findById(productId).select("_id");
  if (!product) {
    bad(res, 404, "Product not found");
    return null;
  }
  return product;
};

const inWishlist = (user, productId) => user.wishlist.some((id) => id.equals(productId));

// POST /wishlist/:productId
export const addToWishlist = asyncHandler(async (req, res) => {
  const product = await loadProduct(req, res);
  if (!product) return;

  const result = await Customer.updateOne(
    { _id: req.user._id, wishlist: { $ne: product._id } },
    { $push: { wishlist: product._id } }
  );
  if (result.modifiedCount === 0) return bad(res, 409, "Product already in wishlist");

  res.status(201).json({ success: true, message: "Product added to wishlist" });
});

// GET /wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id).populate({
    path: "wishlist",
    select: "name price category image stock",
  });

  const wishlist = customer.wishlist.filter(Boolean);
  res.status(200).json({ success: true, count: wishlist.length, wishlist });
});

// DELETE /wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) return bad(res, 400, "Invalid product ID");

  if (!inWishlist(req.user, productId)) return bad(res, 404, "Product not in wishlist");

  await Customer.updateOne({ _id: req.user._id }, { $pull: { wishlist: productId } });
  res.status(200).json({ success: true, message: "Product removed from wishlist" });
});

// PATCH /wishlist/:productId/toggle   (bonus)
export const toggleWishlist = asyncHandler(async (req, res) => {
  const product = await loadProduct(req, res);
  if (!product) return;

  if (inWishlist(req.user, product._id)) {
    await Customer.updateOne({ _id: req.user._id }, { $pull: { wishlist: product._id } });
    return res.status(200).json({ success: true, saved: false });
  }
  await Customer.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: product._id } });
  res.status(200).json({ success: true, saved: true });
});
