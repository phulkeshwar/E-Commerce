import { Router } from "express";
import { getCoupons } from "../controllers/coupon.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getCoupons));

export default router;
