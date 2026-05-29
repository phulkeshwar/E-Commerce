import crypto from "crypto";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getRazorpay } from "../config/razorpay.js";
import { Order } from "../models/Order.model.js";

export const createPaymentOrder = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.body.orderId, userId: req.user._id });

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  if (order.payment.method === "cod") {
    return res.status(400).json(new ApiResponse(false, "COD orders do not need online payment."));
  }

  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100),
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      orderNumber: order.orderNumber,
      userId: req.user._id.toString(),
    },
  });

  order.payment.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json(
    new ApiResponse(true, "Payment order created.", {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    }),
  );
};

export const verifyPayment = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const order = await Order.findOne({ orderNumber: orderId, userId: req.user._id });

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (!signature || expectedSignature !== signature) {
    order.payment.status = "failed";
    await order.save();
    return res.status(400).json(new ApiResponse(false, "Payment verification failed."));
  }

  order.payment.status = "paid";
  order.payment.razorpayOrderId = razorpayOrderId;
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.status = "Paid";
  order.statusHistory.push({ status: "Paid", note: "Payment verified" });
  await order.save();

  res.json(new ApiResponse(true, "Payment verified.", { verified: true, order: order.toClient() }));
};
