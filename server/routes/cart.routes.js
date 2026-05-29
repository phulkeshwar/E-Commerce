import { Router } from "express";
import { getCart, updateCart } from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(requireAuth), asyncHandler(getCart));
router.put("/", asyncHandler(requireAuth), asyncHandler(updateCart));

export default router;
