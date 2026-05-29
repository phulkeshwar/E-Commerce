import mongoose from "mongoose";

export const ORDER_STATUSES = ["Processing", "Paid", "Shipped", "Delivered", "Cancelled", "Returned"];
export const PAYMENT_METHODS = ["cod", "upi", "card", "netbanking"];
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    emoji: { type: String, default: "📦" },
    image: { type: String, default: "" },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    updatedAt: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    payment: {
      method: { type: String, enum: PAYMENT_METHODS, default: "cod" },
      status: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
      razorpayOrderId: { type: String, default: "" },
      razorpayPaymentId: { type: String, default: "" },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: "" },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: "Processing" },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true },
);
orderSchema.index({ userId: 1, createdAt: -1 });


orderSchema.methods.toClient = function toClient() {
  const raw = this.toObject();
  return {
    ...raw,
    id: this.orderNumber,
    userId: this.userId.toString(),
    items: raw.items.map((item) => ({
      ...item,
      productId: item.productId.toString(),
    })),
  };
};

export const Order = mongoose.model("Order", orderSchema);
