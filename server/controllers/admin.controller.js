import { ApiResponse } from "../utils/ApiResponse.js";
import { Coupon } from "../models/Coupon.model.js";
import { ORDER_STATUSES, PAYMENT_STATUSES, Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { Review } from "../models/Review.model.js";
import { User } from "../models/User.model.js";
import { Notification } from "../models/Notification.model.js";
import { Brand } from "../models/Brand.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { slugify } from "../utils/slugify.js";
import { Report } from "../models/Report.model.js";
import { Wishlist } from "../models/Wishlist.model.js";
import { processStockAlerts } from "../utils/stockAlertHelper.js";
import { Settings } from "../models/Settings.model.js";
import { invalidateCatalogCache } from "../utils/cache.js";

export const getDashboard = async (_req, res) => {
  const [revenueResult, orders, productCount, userCount, products, recentOrders, topProducts, reviews] =
    await Promise.all([
      Order.aggregate([{ $group: { _id: null, revenue: { $sum: "$total" } } }]),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Product.find().populate("seller", "name email").sort({ createdAt: -1 }).limit(100),
      Order.find().sort({ createdAt: -1 }).limit(10),
      Product.find().populate("seller", "name email").sort({ rating: -1 }).limit(5),
      Review.find().sort({ createdAt: -1 }).limit(5),
      Coupon.countDocuments(),
    ]);

  res.json(
    new ApiResponse(true, "Dashboard fetched.", {
      stats: {
        revenue: revenueResult[0]?.revenue || 0,
        orders,
        products: productCount,
        users: userCount,
      },
      products: products.map((product) => product.toClient()),
      recentOrders: recentOrders.map((order) => order.toClient()),
      topProducts: topProducts.map((product) => product.toClient()),
      reviews: reviews.map((review) => review.toClient()),
    }),
  );
};

export const updateOrderStatus = async (req, res) => {
  const { status, paymentStatus } = req.body;

  if (status && !ORDER_STATUSES.includes(status)) {
    return res.status(400).json(new ApiResponse(false, "Invalid order status."));
  }

  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
    return res.status(400).json(new ApiResponse(false, "Invalid payment status."));
  }

  const order = await Order.findOne({ orderNumber: req.params.id });

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  if (status) {
    order.status = status;
    order.items.forEach((item) => {
      item.fulfillmentStatus = status;
    });
  }
  if (paymentStatus) {
    order.payment.status = paymentStatus;
  }

  let buyerMessage = "";
  if (status) {
    if (status === "On the Way") {
      buyerMessage = `🚚 Hurray! Your order #${order.orderNumber} is on the way! It's on time. Track details in your dashboard.`;
    } else if (status === "Delivered") {
      buyerMessage = `🥳 Order Delivered! Your organic everyday essentials for order #${order.orderNumber} have arrived safely. Thank you for shopping with us!`;
    } else if (status === "Cancelled") {
      buyerMessage = `⚠️ Order Cancelled. Your order #${order.orderNumber} has been cancelled. Please contact support if you need refund help.`;
    } else if (status === "Returned") {
      buyerMessage = `↩️ Return Processed. The return request for order #${order.orderNumber} has been processed successfully.`;
    } else {
      buyerMessage = `📦 Your order #${order.orderNumber} status has been updated to "${status}".`;
    }
  }

  if (paymentStatus) {
    let paymentFriendly = paymentStatus === "paid" ? "Paid on Delivery" : paymentStatus === "failed" ? "Cancelled" : paymentStatus === "refunded" ? "Returned" : "Pending";
    if (buyerMessage) {
      buyerMessage += ` | Payment Status: ${paymentFriendly}.`;
    } else {
      buyerMessage = `💳 Your order #${order.orderNumber} payment status has been updated to "${paymentFriendly}".`;
    }
  }

  order.statusHistory.push({
    status: status || order.status,
    updatedAt: new Date(),
    note: buyerMessage,
  });

  await order.save();

  // Notify buyer of the status update with a beautiful customized message
  try {
    await Notification.create({
      userId: order.userId,
      title: `🔔 Order Update: ${status || "Payment Update"}`,
      message: buyerMessage,
    });
  } catch (notifErr) {
    console.error("Error creating order status update notification for buyer (admin action):", notifErr);
  }

  res.json(new ApiResponse(true, "Order updated.", { order: order.toClient() }));
};

export const createProduct = async (req, res) => {
  const product = await Product.create({
    slug: req.body.slug || slugify(req.body.name),
    name: req.body.name,
    category: req.body.category,
    price: Number(req.body.price),
    originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
    description: req.body.description,
    specifications: req.body.specifications || {},
    images: req.body.images || [],
    emoji: req.body.emoji || "📦",
    badge: req.body.badge || null,
    inStock: req.body.inStock ?? true,
    stockCount: Number(req.body.stockCount || 0),
    rating: 0,
    reviewCount: 0,
    tags: req.body.tags || [],
    isFeatured: Boolean(req.body.isFeatured),
    deliveryFee: req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : 0,
    variants: req.body.variants || [],
    sku: req.body.sku || "",
    barcode: req.body.barcode || "",
    isPublished: req.body.isPublished ?? true,
  });

  invalidateCatalogCache();
  res.status(201).json(new ApiResponse(true, "Product created.", { product: product.toClient() }));
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  const oldPrice = product.price;

  // Only pick mutable fields — never assign _id, __v, seller (populated), etc.
  const { name, category, description, badge, emoji, images, tags, isFeatured, inStock, variants, sku, barcode, isPublished } = req.body;

  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (badge !== undefined) product.badge = badge || null;
  if (emoji !== undefined) product.emoji = emoji;
  if (images !== undefined) product.images = images;
  if (tags !== undefined) product.tags = tags;
  if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
  if (inStock !== undefined) product.inStock = Boolean(inStock);
  if (variants !== undefined) product.variants = variants;
  if (sku !== undefined) product.sku = sku;
  if (barcode !== undefined) product.barcode = barcode;
  if (isPublished !== undefined) product.isPublished = Boolean(isPublished);

  if (req.body.slug) product.slug = req.body.slug;
  product.price = Number(req.body.price ?? product.price);
  product.originalPrice =
    req.body.originalPrice === null || req.body.originalPrice === ""
      ? null
      : Number(req.body.originalPrice ?? product.originalPrice);
  product.stockCount = Number(req.body.stockCount ?? product.stockCount);
  product.deliveryFee = req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : product.deliveryFee;

  const newPrice = product.price;
  await product.save();

  // Trigger stock alerts if product became in-stock or variant stock > 0
  if (product.inStock && (product.stockCount > 0 || (product.variants && product.variants.some(v => v.stockCount > 0)))) {
    processStockAlerts(product._id).catch((err) => console.error("Error triggering stock alerts (admin):", err));
  }

  if (newPrice < oldPrice) {
    try {
      const wishlists = await Wishlist.find({ products: product._id });
      const notifications = wishlists.map((wl) => ({
        userId: wl.userId,
        title: "📉 Price Drop Alert!",
        message: `"${product.name}" is now available at a lower price of ₹${newPrice} (was ₹${oldPrice})!`,
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.error("Error creating price drop notifications (admin update):", notifErr);
    }
  }

  invalidateCatalogCache();
  res.json(new ApiResponse(true, "Product updated.", { product: product.toClient() }));
};

export const getUsers = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 10));
  const skip = (page - 1) * limit;

  const filters = {};
  if (req.query.role) {
    filters.role = req.query.role;
  }
  if (req.query.certificationStatus) {
    filters.certificationStatus = req.query.certificationStatus;
  }

  const [users, totalItems] = await Promise.all([
    User.find(filters).sort({ name: 1 }).skip(skip).limit(limit),
    User.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  res.json(
    new ApiResponse(true, "Users fetched.", {
      users: users.map((u) => u.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  );
};

export const updateUserCreditScore = async (req, res) => {
  const { score } = req.body;
  const scoreNum = Number(score);

  if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 1000) {
    return res.status(400).json(new ApiResponse(false, "Invalid credit score. Must be between 0 and 1000."));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  user.creditScore = scoreNum;
  await user.save();

  res.json(new ApiResponse(true, "Credit score updated.", { user: user.toClient() }));
};

export const updateUserCertification = async (req, res) => {
  const { certificationStatus } = req.body;

  if (!["new", "certified"].includes(certificationStatus)) {
    return res.status(400).json(new ApiResponse(false, "Invalid certification status."));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  user.certificationStatus = certificationStatus;
  await user.save();

  res.json(new ApiResponse(true, "Certification status updated.", { user: user.toClient() }));
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!["user", "seller", "admin"].includes(role)) {
    return res.status(400).json(new ApiResponse(false, "Invalid user role."));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  user.role = role;
  await user.save();

  res.json(new ApiResponse(true, "User role updated.", { user: user.toClient() }));
};

export const sendNotification = async (req, res) => {
  const { userId, title, message, sendEmailCheckbox } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json(new ApiResponse(false, "userId, title, and message are required."));
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  const notification = await Notification.create({
    userId,
    title,
    message,
  });

  let emailSent = false;
  if (sendEmailCheckbox) {
    try {
      emailSent = await sendEmail({
        to: user.email,
        subject: title,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #ea580c; border-bottom: 2px solid #f97316; padding-bottom: 10px;">Message from GaramBazaar Admin</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Hello ${user.name || "User"},</p>
            <div style="background-color: #fcf8f2; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0; font-style: italic; color: #555;">
              ${message.replace(/\n/g, "<br/>")}
            </div>
            <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
              This is a personalized notification sent from the GaramBazaar Administrator Panel. Please do not reply directly to this automated email.
            </p>
          </div>
        `,
      });
    } catch (err) {
      if (req.log) {
        req.log.error(err, "Failed to send admin email notification");
      } else {
        console.error("Email send failed:", err);
      }
    }
  }

  res.json(
    new ApiResponse(true, "Notification sent successfully.", {
      notification: notification.toClient(),
      emailSent,
    })
  );
};

export const broadcastNotification = async (req, res) => {
  const { title, message, sendEmailCheckbox } = req.body;

  if (!title || !message) {
    return res.status(400).json(new ApiResponse(false, "Title and message are required."));
  }

  const users = await User.find({}, "_id name email");

  if (users.length === 0) {
    return res.status(404).json(new ApiResponse(false, "No users found to notify."));
  }

  // Create notifications for all users
  const notificationDocs = users.map((u) => ({
    userId: u._id,
    title,
    message,
  }));
  await Notification.insertMany(notificationDocs);

  let emailsSent = 0;
  if (sendEmailCheckbox) {
    const emailPromises = users
      .filter((u) => u.email)
      .map((u) =>
        sendEmail({
          to: u.email,
          subject: title,
          text: message,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #ea580c; border-bottom: 2px solid #f97316; padding-bottom: 10px;">📢 Announcement from GaramBazaar</h2>
              <p style="font-size: 16px; line-height: 1.5; color: #333;">Hello ${u.name || "User"},</p>
              <div style="background-color: #fcf8f2; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0; font-style: italic; color: #555;">
                ${message.replace(/\n/g, "<br/>")}
              </div>
              <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                This is a broadcast notification sent from the GaramBazaar Administrator Panel. Please do not reply directly to this automated email.
              </p>
            </div>
          `,
        }).catch(() => null)
      );

    const results = await Promise.allSettled(emailPromises);
    emailsSent = results.filter((r) => r.status === "fulfilled" && r.value).length;
  }

  res.json(
    new ApiResponse(true, `Broadcast sent to ${users.length} user(s).`, {
      notificationCount: users.length,
      emailsSent,
    })
  );
};

export const getCouponsAdmin = async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(true, "All coupons fetched.", { coupons }));
};

export const createCouponAdmin = async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, expiresAt, active } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json(new ApiResponse(false, "Code, discount type, and value are required."));
  }

  const exists = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (exists) {
    return res.status(400).json(new ApiResponse(false, "Coupon code already exists."));
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    discountType,
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount || 0),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    active: active ?? true,
  });

  res.status(201).json(new ApiResponse(true, "Coupon created successfully.", { coupon }));
};

export const deleteCouponAdmin = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    return res.status(404).json(new ApiResponse(false, "Coupon not found."));
  }
  res.json(new ApiResponse(true, "Coupon deleted successfully."));
};

export const getBrandsAdmin = async (_req, res) => {
  const brands = await Brand.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(true, "All brands fetched.", { brands: brands.map((b) => b.toClient()) }));
};

export const createBrandAdmin = async (req, res) => {
  const { brand, title, copy, offer, accent, image, active } = req.body;

  if (!brand || !title || !copy || !offer || !image) {
    return res.status(400).json(new ApiResponse(false, "Brand, title, copy, offer, and image are required."));
  }

  const brandDoc = await Brand.create({
    brand: brand.trim(),
    title: title.trim(),
    copy: copy.trim(),
    offer: offer.trim(),
    accent: accent ? accent.trim() : "#2f5f4b",
    image: image.trim(),
    active: active ?? true,
  });

  res.status(201).json(new ApiResponse(true, "Brand spotlight created successfully.", { brand: brandDoc.toClient() }));
};

export const deleteBrandAdmin = async (req, res) => {
  const brandDoc = await Brand.findByIdAndDelete(req.params.id);
  if (!brandDoc) {
    return res.status(404).json(new ApiResponse(false, "Brand spotlight not found."));
  }
  res.json(new ApiResponse(true, "Brand spotlight deleted successfully."));
};

export const banUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }
  user.isBanned = true;
  await user.save();
  return res.json(new ApiResponse(true, "User has been banned successfully.", { user: user.toClient() }));
};

export const unbanUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }
  user.isBanned = false;
  await user.save();
  return res.json(new ApiResponse(true, "User has been unbanned successfully.", { user: user.toClient() }));
};

export const getReports = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 10));
  const skip = (page - 1) * limit;

  const [reports, totalItems] = await Promise.all([
    Report.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Report.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return res.json(
    new ApiResponse(true, "Reports fetched successfully.", {
      reports: reports.map((r) => r.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  );
};

export const resolveReport = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // e.g. "resolve" or "delete_target"

  const report = await Report.findById(id);
  if (!report) {
    return res.status(404).json(new ApiResponse(false, "Report not found."));
  }

  if (action === "delete_target") {
    try {
      if (report.reportType === "product") {
        await Product.findByIdAndDelete(report.targetId);
      } else if (report.reportType === "review") {
        await Review.findByIdAndDelete(report.targetId);
      } else if (report.reportType === "seller") {
        // Instead of hard-deleting the user, ban them!
        await User.findByIdAndUpdate(report.targetId, { isBanned: true });
      }
    } catch (err) {
      console.error("Failed to delete target of report:", err);
    }
  }

  // Delete the report after resolving
  await Report.findByIdAndDelete(id);

  return res.json(new ApiResponse(true, "Report resolved successfully."));
};

export const getSalesAnalytics = async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const analytics = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        status: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const labels = [];
  const revenueData = [];
  const orderData = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0];
    const match = analytics.find((entry) => entry._id === dateString);

    labels.push(dateString.slice(5)); // MM-DD
    revenueData.push(match ? match.revenue : 0);
    orderData.push(match ? match.orders : 0);
  }

  return res.json(
    new ApiResponse(true, "Sales analytics fetched.", {
      labels,
      revenueData,
      orderData,
    })
  );
};

export const getPendingReviews = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 10));
  const skip = (page - 1) * limit;

  const [reviews, totalItems] = await Promise.all([
    Review.find({ isApproved: false })
      .populate("userId", "name email")
      .populate("productId", "name emoji")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ isApproved: false }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  res.json(
    new ApiResponse(true, "Pending reviews fetched.", {
      reviews: reviews.map((r) => {
        const client = r.toClient();
        return {
          ...client,
          user: r.userId ? { name: r.userId.name, email: r.userId.email } : null,
          product: r.productId ? { name: r.productId.name, emoji: r.productId.emoji } : null,
        };
      }),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  );
};

export const approveReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json(new ApiResponse(false, "Review not found."));
  }

  review.isApproved = true;
  await review.save();

  // Recalculate product rating and count
  const product = await Product.findById(review.productId);
  if (product) {
    const stats = await Review.aggregate([
      { $match: { productId: product._id, isApproved: true } },
      {
        $group: {
          _id: null,
          reviewCount: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    product.reviewCount = stats[0]?.reviewCount || 0;
    product.rating = stats[0]?.averageRating || 0;
    await product.save();
  }

  res.json(new ApiResponse(true, "Review approved and published.", { review: review.toClient() }));
};

export const rejectReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json(new ApiResponse(false, "Review not found."));
  }

  await Review.deleteOne({ _id: req.params.id });
  res.json(new ApiResponse(true, "Review rejected and deleted."));
};

export const exportAdminSalesCSV = async (req, res) => {
  const orders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 });

  const csvEscape = (val) => {
    if (val === null || val === undefined) return "";
    let str = String(val);
    if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    "Order Number",
    "Date",
    "Customer Name",
    "Customer Email",
    "Subtotal",
    "Discount",
    "Shipping Fee",
    "Total",
    "Status",
    "Payment Method",
    "Payment Status",
    "Delivery Slot",
    "Estimated Delivery Date"
  ];

  let csvContent = headers.join(",") + "\n";

  orders.forEach((o) => {
    const row = [
      o.orderNumber,
      o.createdAt.toISOString(),
      o.userId?.name || o.shippingAddress?.name || "N/A",
      o.userId?.email || "N/A",
      o.subtotal,
      o.discount,
      o.shippingFee,
      o.total,
      o.status,
      o.payment?.method || "cod",
      o.payment?.status || "pending",
      o.deliverySlot || "",
      o.estimatedDeliveryDate ? o.estimatedDeliveryDate.toISOString().split("T")[0] : ""
    ];
    csvContent += row.map(csvEscape).join(",") + "\n";
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=admin-sales-report.csv");
  return res.status(200).send(csvContent);
};

export const getGeoAnalytics = async (req, res) => {
  const geoStats = await Order.aggregate([
    {
      $group: {
        _id: {
          state: { $ifNull: ["$shippingAddress.state", "Unknown"] },
          city: { $ifNull: ["$shippingAddress.city", "Unknown"] }
        },
        salesCount: { $sum: 1 },
        revenue: { $sum: "$total" }
      }
    },
    {
      $project: {
        _id: 0,
        state: "$_id.state",
        city: "$_id.city",
        salesCount: 1,
        revenue: 1
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  return res.json(
    new ApiResponse(true, "Geographic analytics fetched.", { geoStats })
  );
};

export const deleteProductAdmin = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }
  return res.json(new ApiResponse(true, "Product deleted successfully."));
};

export const getSettingsAdmin = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return res.json(new ApiResponse(true, "Settings retrieved.", { settings: settings.toClient() }));
};

export const updateSettingsAdmin = async (req, res) => {
  const { shippingFee, shippingFreeThreshold, homepageBanners } = req.body;
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  if (shippingFee !== undefined) settings.shippingFee = Number(shippingFee);
  if (shippingFreeThreshold !== undefined) settings.shippingFreeThreshold = Number(shippingFreeThreshold);
  if (homepageBanners !== undefined) settings.homepageBanners = homepageBanners;

  await settings.save();
  return res.json(new ApiResponse(true, "Settings updated successfully.", { settings: settings.toClient() }));
};

