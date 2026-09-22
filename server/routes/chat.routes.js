import { Router } from "express";
import { handleChat, getChatHistory, clearChatHistory } from "../controllers/chat.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(optionalAuth), asyncHandler(handleChat));
router.get("/history", asyncHandler(optionalAuth), asyncHandler(getChatHistory));
router.delete("/history", asyncHandler(optionalAuth), asyncHandler(clearChatHistory));

export default router;
