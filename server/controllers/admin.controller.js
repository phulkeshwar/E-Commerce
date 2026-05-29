import { ApiResponse } from "../utils/ApiResponse.js";
import { Coupon } from "../models/Coupon.model.js";
import { ORDER_STATUSES, Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { Review } from "../models/Review.model.js";
import { User } from "../models/User.model.js";
import { slugify } from "../utils/slugify.js";

export const getDashboard = async (_req, res) => {
  const [revenueResult, orders, productCount, userCount, products, recentOrders, topProducts, reviews] =
    await Promise.all([
      Order.aggregate([{ $group: { _id: null, revenue: { $sum: "$total" } } }]),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Product.find().sort({ createdAt: -1 }).limit(100),
      Order.find().sort({ createdAt: -1 }).limit(10),
      Product.find().sort({ rating: -1 }).limit(5),
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
  if (!ORDER_STATUSES.includes(req.body.status)) {
    return res.status(400).json(new ApiResponse(false, "Invalid order status."));
  }

  const order = await Order.findOne({ orderNumber: req.params.id });

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  order.status = req.body.status;
  order.statusHistory.push({
    status: req.body.status,
    updatedAt: new Date(),
    note: "Updated from admin",
  });
  await order.save();

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
  });

  res.status(201).json(new ApiResponse(true, "Product created.", { product: product.toClient() }));
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  Object.assign(product, {
    ...req.body,
    slug: req.body.slug || product.slug,
    price: Number(req.body.price ?? product.price),
    originalPrice:
      req.body.originalPrice === null || req.body.originalPrice === ""
        ? null
        : Number(req.body.originalPrice ?? product.originalPrice),
    stockCount: Number(req.body.stockCount ?? product.stockCount),
  });

  await product.save();
  res.json(new ApiResponse(true, "Product updated.", { product: product.toClient() }));
};
