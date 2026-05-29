import { Router } from "express";
import { createOrder, getOrders } from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { orderValidator } from "../validators/order.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(requireAuth), asyncHandler(getOrders));
router.post("/", asyncHandler(requireAuth), validate(orderValidator), asyncHandler(createOrder));

export default router;
