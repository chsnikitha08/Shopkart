import { Router } from "express";
import {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  getMyOrders,
  getOrderById,
} from "../controllers/order.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = Router();
router.use(protect);

router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.post("/payment-failed", markPaymentFailed);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

export default router;
