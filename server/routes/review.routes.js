import { Router } from "express";
import { createReview, getReviews } from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { reviewValidator } from "../validators/review.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getReviews));
router.post("/", asyncHandler(requireAuth), validate(reviewValidator), asyncHandler(createReview));

export default router;
