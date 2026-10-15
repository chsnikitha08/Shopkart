import { Router } from "express";
import { createProduct, getProducts, getProductById } from "../controllers/product.controller.js";
import protect from "../middlewares/auth.middleware.js";
import requireAdmin from "../middlewares/admin.middleware.js";

const router = Router();

router.post("/", protect, requireAdmin, createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
