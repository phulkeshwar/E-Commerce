import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", authRateLimiter, validate(registerValidator), asyncHandler(register));
router.post("/login", authRateLimiter, validate(loginValidator), asyncHandler(login));
router.get("/me", asyncHandler(requireAuth), me);

export default router;
