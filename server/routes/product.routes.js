import { Router } from "express";
import { getProductById, getProducts, notifyMeStock } from "../controllers/product.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cacheResponse } from "../utils/cache.js";

const router = Router();

router.get("/", asyncHandler(optionalAuth), cacheResponse(30, "catalog:products"), asyncHandler(getProducts));
router.get("/:id", asyncHandler(optionalAuth), cacheResponse(60, "catalog:product"), asyncHandler(getProductById));
router.post("/:id/notify-me", asyncHandler(requireAuth), asyncHandler(notifyMeStock));

export default router;
