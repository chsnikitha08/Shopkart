import { Router } from "express";
import { createProduct, getProducts, getProductById } from "../controllers/product.controller.js";

const router = Router();

router.post("/", createProduct); // open for now; admin auth comes later
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
