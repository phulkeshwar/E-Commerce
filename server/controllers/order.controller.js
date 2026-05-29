import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Cart } from "../models/Cart.model.js";
import { Coupon } from "../models/Coupon.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { sendEmail } from "../utils/sendEmail.js";

const SHIPPING_FREE_THRESHOLD = Number(process.env.SHIPPING_FREE_THRESHOLD || 500);
const SHIPPING_FEE = Number(process.env.SHIPPING_FEE || 49);

const resolveProductId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return id;
  }

  const product = await Product.findOne({ legacyId: id });
  return product?._id;
};

const calculateDiscount = async (couponCode, subtotal) => {
  if (!couponCode) {
    return { discount: 0, couponCode: "" };
  }

  const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), active: true });
  const expired = coupon?.expiresAt && coupon.expiresAt.getTime() < Date.now();

  if (!coupon || expired || subtotal < coupon.minOrderAmount) {
    return { discount: 0, couponCode: "" };
  }

  const discount =
    coupon.discountType === "percent"
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue;

  return {
    discount: Math.min(discount, subtotal),
    couponCode: coupon.code,
  };
};

const buildOrderItems = async (rawItems) => {
  const items = [];

  for (const item of rawItems) {
    const productId = await resolveProductId(item.productId);
    const quantity = Math.max(1, Math.min(Number(item.quantity || 1), 99));

    if (!productId) {
      throw new Error("One or more products were not found.");
    }

    const product = await Product.findById(productId);

    if (!product || !product.inStock || product.stockCount < quantity) {
      throw new Error(`${product?.name || "Product"} is unavailable in the requested quantity.`);
    }

    items.push({
      product,
      quantity,
      subtotal: product.price * quantity,
    });
  }

  return items;
};

export const getOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(new ApiResponse(true, "Orders fetched.", { orders: orders.map((order) => order.toClient()) }));
};

export const createOrder = async (req, res) => {
  const orderItems = await buildOrderItems(req.body.items);
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  const { discount, couponCode } = await calculateDiscount(req.body.couponCode, subtotal);
  const total = Math.max(subtotal + shippingFee - discount, 0);
  const paymentMethod = req.body.paymentMethod || "cod";
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const order = await Order.create({
    orderNumber,
    userId: req.user._id,
    items: orderItems.map(({ product, quantity }) => ({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      emoji: product.emoji,
      image: product.images?.[0]?.url || "",
    })),
    shippingAddress: req.body.shippingAddress,
    payment: {
      method: paymentMethod,
      status: paymentMethod === "cod" ? "pending" : "pending",
    },
    subtotal,
    shippingFee,
    discount,
    couponCode,
    total,
    status: "Processing",
    statusHistory: [{ status: "Processing", note: "Order created" }],
  });

  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product._id },
      {
        $inc: { stockCount: -item.quantity },
        $set: { inStock: item.product.stockCount - item.quantity > 0 },
      },
    );
  }

  await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } }, { upsert: true });

  await sendEmail({
    to: req.user.email,
    subject: `Order ${order.orderNumber} confirmed`,
    text: `Your GramBazaar order ${order.orderNumber} has been placed.`,
  });

  res.status(201).json(new ApiResponse(true, "Order placed.", { order: order.toClient() }));
};
