import { Router } from "express";
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  verifyUnsubscribeTokenController,
  getSubscribers,
  sendNewsletter,
  toggleSubscriberStatus,
  deleteSubscriber,
  adminAddSubscriber,
} from "../controllers/newsletter.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Public routes
router.post("/subscribe", asyncHandler(subscribeNewsletter));
router.post("/unsubscribe", asyncHandler(unsubscribeNewsletter));
router.get("/verify-token", asyncHandler(verifyUnsubscribeTokenController));

// Admin routes
router.get("/", asyncHandler(requireAuth), isAdmin, asyncHandler(getSubscribers));
router.post("/send", asyncHandler(requireAuth), isAdmin, asyncHandler(sendNewsletter));
router.patch("/:id/status", asyncHandler(requireAuth), isAdmin, asyncHandler(toggleSubscriberStatus));
router.delete("/:id", asyncHandler(requireAuth), isAdmin, asyncHandler(deleteSubscriber));
router.post("/admin-add", asyncHandler(requireAuth), isAdmin, asyncHandler(adminAddSubscriber));

export default router;
