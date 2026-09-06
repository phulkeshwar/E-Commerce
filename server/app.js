import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import compression from "compression";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import faqRoutes from "./routes/faq.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import returnRoutes from "./routes/return.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import sellerPublicRoutes from "./routes/sellerPublic.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import supportRoutes from "./routes/support.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import messageRoutes from "./routes/message.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import affiliateRoutes from "./routes/affiliate.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

const app = express();
// Force restart nodemon again to ensure reload
app.use(compression());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://garambazaar.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://localhost:5178",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS origin denied: ${origin}`));
      }
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(cookieParser());
app.use(
  express.json({
    limit: "2mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(apiRateLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "GaramBazaar API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/sellers", sellerPublicRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorHandler);

export default app;
