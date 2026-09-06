import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/Product.model.js";
import { ORDER_STATUSES, PAYMENT_STATUSES, Order } from "../models/Order.model.js";
import { ProductFAQ } from "../models/ProductFAQ.model.js";
import { Notification } from "../models/Notification.model.js";
import { slugify } from "../utils/slugify.js";
import { Wishlist } from "../models/Wishlist.model.js";
import { Coupon } from "../models/Coupon.model.js";
import { processStockAlerts } from "../utils/stockAlertHelper.js";
import { invalidateCatalogCache } from "../utils/cache.js";

export const getSellerDashboard = async (req, res) => {
  const sellerId = req.user._id;

  // 1. Get all seller products
  const products = await Product.find({ seller: sellerId }).sort({ createdAt: -1 });
  const productIds = products.map((p) => p._id);

  // 2. Get all orders containing any of the seller's products
  const orders = await Order.find({ "items.productId": { $in: productIds } }).sort({ createdAt: -1 });

  // 3. Compute seller specific stats
  let sellerRevenue = 0;
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (productIds.some((pId) => pId.toString() === item.productId.toString())) {
        sellerRevenue += item.price * item.quantity;
      }
    });
  });

  return res.json(
    new ApiResponse(true, "Seller dashboard fetched.", {
      stats: {
        revenue: sellerRevenue,
        products: products.length,
        orders: orders.length,
      },
      products: products.map((product) => product.toClient()),
      recentOrders: orders.map((order) => order.toClient()),
    }),
  );
};

export const getSellerFAQs = async (req, res) => {
  const sellerId = req.user._id;

  // 1. Find all seller product IDs
  const products = await Product.find({ seller: sellerId });
  const productIds = products.map((p) => p._id);

  // 2. Find FAQs for these products
  const faqs = await ProductFAQ.find({ productId: { $in: productIds } }).sort({ createdAt: -1 });

  return res.json(new ApiResponse(true, "Seller FAQs fetched.", { faqs: faqs.map((faq) => faq.toClient()) }));
};

export const createSellerProduct = async (req, res) => {
  const sellerId = req.user._id;

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
    seller: sellerId,
    deliveryFee: req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : 0,
    variants: req.body.variants || [],
    sku: req.body.sku || "",
    barcode: req.body.barcode || "",
    isPublished: req.body.isPublished ?? true,
  });

  invalidateCatalogCache();
  return res.status(201).json(new ApiResponse(true, "Product created.", { product: product.toClient() }));
};

export const updateSellerProduct = async (req, res) => {
  const sellerId = req.user._id;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  // Authorize: Product must belong to the seller, or user is an admin
  if (product.seller?.toString() !== sellerId.toString() && req.user.role !== "admin") {
    return res.status(403).json(new ApiResponse(false, "Not authorized to update this product."));
  }

  const oldPrice = product.price;

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
    processStockAlerts(product._id).catch((err) => console.error("Error triggering stock alerts:", err));
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
      console.error("Error creating price drop notifications (seller update):", notifErr);
    }
  }

  invalidateCatalogCache();
  return res.json(new ApiResponse(true, "Product updated.", { product: product.toClient() }));
};

export const deleteSellerProduct = async (req, res) => {
  const sellerId = req.user._id;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  // Authorize: Product must belong to the seller, or user is an admin
  if (product.seller?.toString() !== sellerId.toString() && req.user.role !== "admin") {
    return res.status(403).json(new ApiResponse(false, "Not authorized to delete this product."));
  }

  await Product.findByIdAndDelete(req.params.id);
  invalidateCatalogCache();
  return res.json(new ApiResponse(true, "Product deleted."));
};

export const updateSellerOrderStatus = async (req, res) => {
  const sellerId = req.user._id;
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

  // Find all products owned by this seller
  const sellerProducts = await Product.find({ seller: sellerId });
  const sellerProductIds = sellerProducts.map((p) => p._id.toString());

  // Check if at least one item in the order is owned by this seller
  const hasMerchantProduct = order.items.some((item) =>
    sellerProductIds.includes(item.productId.toString())
  );

  // If not owned by this seller, check if the user is an admin
  if (!hasMerchantProduct && req.user.role !== "admin") {
    return res.status(403).json(new ApiResponse(false, "Not authorized to update this order."));
  }

  if (status) {
    order.items.forEach((item) => {
      if (sellerProductIds.includes(item.productId.toString()) || req.user.role === "admin") {
        item.fulfillmentStatus = status;
      }
    });

    const statuses = order.items.map((item) => item.fulfillmentStatus);
    if (statuses.every((s) => s === "Cancelled")) {
      order.status = "Cancelled";
    } else if (statuses.every((s) => s === "Delivered")) {
      order.status = "Delivered";
    } else if (statuses.every((s) => s === "Returned")) {
      order.status = "Returned";
    } else if (statuses.some((s) => s === "Processing")) {
      order.status = "Processing";
    } else if (statuses.some((s) => s === "On the Way")) {
      order.status = "On the Way";
    }
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

  try {
    await Notification.create({
      userId: order.userId,
      title: `🔔 Order Update: ${status || "Payment Update"}`,
      message: buyerMessage,
    });
  } catch (notifErr) {
    console.error("Error creating order status update notification for buyer (seller action):", notifErr);
  }

  return res.json(new ApiResponse(true, "Order status updated.", { order: order.toClient() }));
};

export const getSellerProducts = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 10));
  const skip = (page - 1) * limit;

  const filters = { seller: req.user._id };

  const [products, totalItems] = await Promise.all([
    Product.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return res.json(
    new ApiResponse(true, "Seller products fetched.", {
      products: products.map((p) => p.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  );
};

export const getSellerOrders = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 10));
  const skip = (page - 1) * limit;

  const products = await Product.find({ seller: req.user._id }, "_id");
  const productIds = products.map((p) => p._id);

  const filters = { "items.productId": { $in: productIds } };

  const [orders, totalItems] = await Promise.all([
    Order.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return res.json(
    new ApiResponse(true, "Seller orders fetched.", {
      orders: orders.map((o) => o.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  );
};

export const getSellerSalesAnalytics = async (req, res) => {
  const sellerId = req.user._id;

  const products = await Product.find({ seller: sellerId }, "_id");
  const productIds = products.map((p) => p._id);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await Order.find({
    createdAt: { $gte: thirtyDaysAgo },
    status: { $ne: "Cancelled" },
    "items.productId": { $in: productIds },
  });

  const dailySalesMap = {};

  orders.forEach((order) => {
    const dateString = order.createdAt.toISOString().split("T")[0];
    if (!dailySalesMap[dateString]) {
      dailySalesMap[dateString] = { revenue: 0, orders: 0 };
    }

    let orderRevenueForSeller = 0;
    let containsSellerProduct = false;

    order.items.forEach((item) => {
      if (productIds.some((pId) => pId.toString() === item.productId.toString())) {
        orderRevenueForSeller += item.price * item.quantity;
        containsSellerProduct = true;
      }
    });

    if (containsSellerProduct) {
      dailySalesMap[dateString].revenue += orderRevenueForSeller;
      dailySalesMap[dateString].orders += 1;
    }
  });

  const labels = [];
  const revenueData = [];
  const orderData = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0];
    const match = dailySalesMap[dateString];

    labels.push(dateString.slice(5)); // MM-DD
    revenueData.push(match ? match.revenue : 0);
    orderData.push(match ? match.orders : 0);
  }

  return res.json(
    new ApiResponse(true, "Seller sales analytics fetched.", {
      labels,
      revenueData,
      orderData,
    })
  );
};

export const bulkUploadProducts = async (req, res) => {
  const sellerId = req.user._id;
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json(new ApiResponse(false, "Products array is required."));
  }

  const createdProducts = [];
  for (const item of products) {
    if (!item.name || !item.category || item.price === undefined) {
      return res.status(400).json(new ApiResponse(false, `Product name, category, and price are required for all items.`));
    }
    const product = await Product.create({
      slug: item.slug || slugify(item.name),
      name: item.name,
      category: item.category,
      price: Number(item.price),
      originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
      description: item.description || "",
      specifications: item.specifications || {},
      images: item.images || [],
      emoji: item.emoji || "📦",
      badge: item.badge || null,
      inStock: item.inStock ?? true,
      stockCount: Number(item.stockCount || 0),
      rating: 0,
      reviewCount: 0,
      tags: item.tags || [],
      isFeatured: Boolean(item.isFeatured),
      seller: sellerId,
      deliveryFee: item.deliveryFee !== undefined ? Number(item.deliveryFee) : 0,
      variants: item.variants || [],
    });
    createdProducts.push(product.toClient());
  }

  return res.status(201).json(new ApiResponse(true, `Successfully uploaded ${createdProducts.length} products.`, { products: createdProducts }));
};

export const exportSellerSalesCSV = async (req, res) => {
  const sellerId = req.user._id;

  // 1. Find all products owned by this seller
  const products = await Product.find({ seller: sellerId }, "_id");
  const productIds = products.map((p) => p._id);

  // 2. Find all orders containing any of the seller's products
  const orders = await Order.find({ "items.productId": { $in: productIds } }).populate("userId", "name email").sort({ createdAt: -1 });

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
    "Item Name",
    "Price",
    "Quantity",
    "Item Total",
    "Delivery Fee",
    "Status",
    "Payment Method",
    "Payment Status"
  ];

  let csvContent = headers.join(",") + "\n";

  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (productIds.some((pId) => pId.toString() === item.productId.toString())) {
        const row = [
          o.orderNumber,
          o.createdAt.toISOString(),
          o.userId?.name || o.shippingAddress?.name || "N/A",
          o.userId?.email || "N/A",
          item.name + (item.variantName ? ` (${item.variantName})` : ""),
          item.price,
          item.quantity,
          item.price * item.quantity,
          o.shippingFee,
          o.status,
          o.payment?.method || "cod",
          o.payment?.status || "pending"
        ];
        csvContent += row.map(csvEscape).join(",") + "\n";
      }
    });
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=seller-sales-report.csv");
  return res.status(200).send(csvContent);
};

export const getSellerCoupons = async (req, res) => {
  const sellerId = req.user._id;
  const coupons = await Coupon.find({ sellerId }).sort({ createdAt: -1 });
  return res.json(new ApiResponse(true, "Seller coupons fetched.", { coupons }));
};

export const createSellerCoupon = async (req, res) => {
  const sellerId = req.user._id;
  const { code, discountType, discountValue, minOrderAmount, expiresAt } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json(new ApiResponse(false, "Coupon code and discount value are required."));
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (existing) {
    return res.status(400).json(new ApiResponse(false, "A coupon with this code already exists."));
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    discountType,
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount || 0),
    expiresAt: expiresAt || null,
    sellerId,
  });

  return res.status(201).json(new ApiResponse(true, "Coupon created successfully.", coupon));
};

export const deleteSellerCoupon = async (req, res) => {
  const sellerId = req.user._id;
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json(new ApiResponse(false, "Coupon not found."));
  }

  if (coupon.sellerId?.toString() !== sellerId.toString()) {
    return res.status(403).json(new ApiResponse(false, "Not authorized to delete this coupon."));
  }

  await Coupon.findByIdAndDelete(req.params.id);
  return res.json(new ApiResponse(true, "Coupon deleted successfully."));
};

