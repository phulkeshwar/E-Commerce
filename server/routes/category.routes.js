import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cacheResponse } from "../utils/cache.js";

const router = Router();

router.get("/", cacheResponse(120, "catalog:categories"), asyncHandler(getCategories));
router.post("/", asyncHandler(requireAuth), isAdmin, asyncHandler(createCategory));
router.patch("/:id", asyncHandler(requireAuth), isAdmin, asyncHandler(updateCategory));
router.delete("/:id", asyncHandler(requireAuth), isAdmin, asyncHandler(deleteCategory));

export default router;
