import { Router } from "express";
import { createProduct, getProducts, getProductById } from "../controllers/product.controller.js";

const router = Router();

// Lab 03 keeps product creation open. The frontend exposes this to signed-in users.
router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
