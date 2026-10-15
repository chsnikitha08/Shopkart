import mongoose from "mongoose";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const isBlank = (v) => typeof v !== "string" || v.trim() === "";
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isMissing = (v) => v === undefined || v === null || v === "";

const SORTS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

// POST /products
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, image, stock } = req.body || {};

  if ([name, description, category, image].some(isBlank) || isMissing(price) || isMissing(stock)) {
    return res
      .status(400)
      .json({ success: false, message: "All product fields are required" });
  }

  const p = Number(price);
  const s = Number(stock);
  if (!Number.isFinite(p) || p <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Price must be greater than 0" });
  }
  if (!Number.isInteger(s) || s < 0) {
    return res
      .status(400)
      .json({ success: false, message: "Stock must be a whole number, 0 or more" });
  }

  const product = await Product.create({ name, description, price: p, category, image, stock: s });
  res.status(201).json({ success: true, product });
});

// GET /products?search=&category=&sort=
export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, sort } = req.query;
  const filter = {};

  if (typeof search === "string" && search.trim()) {
    filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
  }
  if (typeof category === "string" && category.trim() && category !== "All") {
    filter.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: "i" };
  }

  const products = await Product.find(filter)
    .select("name price category image stock")
    .sort(SORTS[sort] || { createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, count: products.length, products });
});

// GET /products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const product = await Product.findById(id).lean();
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.status(200).json({ success: true, product });
});
