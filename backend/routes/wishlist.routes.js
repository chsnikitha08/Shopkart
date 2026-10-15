import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} from "../controllers/wishlist.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = Router();
router.use(protect);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.patch("/:productId/toggle", toggleWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
