import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/image", asyncHandler(requireAuth), upload, asyncHandler(uploadImage));

export default router;
