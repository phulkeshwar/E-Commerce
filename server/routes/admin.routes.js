import { Router } from "express";
import {
  createProduct,
  getDashboard,
  updateOrderStatus,
  updateProduct,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { productValidator } from "../validators/product.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(asyncHandler(requireAuth), isAdmin);
router.get("/dashboard", asyncHandler(getDashboard));
router.patch("/orders/:id", asyncHandler(updateOrderStatus));
router.post("/products", validate(productValidator), asyncHandler(createProduct));
router.put("/products/:id", validate(productValidator), asyncHandler(updateProduct));

export default router;
