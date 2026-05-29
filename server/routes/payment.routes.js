import { Router } from "express";
import { createPaymentOrder, verifyPayment } from "../controllers/payment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/create-order", asyncHandler(requireAuth), asyncHandler(createPaymentOrder));
router.post("/verify", asyncHandler(requireAuth), asyncHandler(verifyPayment));

export default router;
