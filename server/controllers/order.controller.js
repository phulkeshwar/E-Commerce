import crypto from "crypto";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Cart } from "../models/Cart.model.js";
import { Coupon } from "../models/Coupon.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import { Notification } from "../models/Notification.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Settings } from "../models/Settings.model.js";

const SHIPPING_FREE_THRESHOLD = Number(process.env.SHIPPING_FREE_THRESHOLD || 500);
const SHIPPING_FEE = Number(process.env.SHIPPING_FEE || 49);

const resolveProductId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return id;
  }

  const product = await Product.findOne({ legacyId: id });
  return product?._id;
};

const calculateDiscount = async (couponCode, orderItems) => {
  if (!couponCode) {
    return { discount: 0, couponCode: "" };
  }

  const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), active: true });
  const expired = coupon?.expiresAt && coupon.expiresAt.getTime() < Date.now();

  if (!coupon || expired) {
    return { discount: 0, couponCode: "" };
  }

  // Calculate subtotal of items that are eligible for this coupon
  let eligibleSubtotal = 0;
  if (coupon.sellerId) {
    // Seller-specific coupon: only sum subtotal of products from this seller
    orderItems.forEach((item) => {
      if (item.product.seller?.toString() === coupon.sellerId.toString()) {
        eligibleSubtotal += item.subtotal;
      }
    });
  } else {
    // Platform-wide coupon: all products are eligible
    eligibleSubtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Check minOrderAmount against eligible subtotal
  if (eligibleSubtotal < coupon.minOrderAmount || eligibleSubtotal === 0) {
    return { discount: 0, couponCode: "" };
  }

  const discount =
    coupon.discountType === "percent"
      ? Math.round((eligibleSubtotal * coupon.discountValue) / 100)
      : coupon.discountValue;

  return {
    discount: Math.min(discount, eligibleSubtotal),
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
    if (!product) {
      throw new Error("One or more products were not found.");
    }

    let price;
    let variantName = item.variantName;

    if (variantName) {
      const variant = product.variants.find((v) => v.name === variantName);
      if (!variant || variant.stockCount < quantity) {
        throw new Error(`Product "${product.name}" (${variantName}) is out of stock or unavailable in the requested quantity.`);
      }
      price = variant.price;
    } else {
      if (!product.inStock || product.stockCount < quantity) {
        throw new Error(`Product "${product.name}" is out of stock or unavailable in the requested quantity.`);
      }
      price = product.price;
    }

    // Apply Quantity Discounts
    const qDiscounts = product.quantityDiscounts || [];
    let applicableDiscountPercent = 0;
    for (const qd of qDiscounts) {
      if (quantity >= qd.quantity && qd.discountPercent > applicableDiscountPercent) {
        applicableDiscountPercent = qd.discountPercent;
      }
    }
    const originalPrice = price;
    if (applicableDiscountPercent > 0) {
      price = Math.round(price * (1 - applicableDiscountPercent / 100));
    }

    items.push({
      product,
      quantity,
      variantName,
      price,
      originalPrice,
      subtotal: price * quantity,
    });
  }

  return items;
};

export const getOrders = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 10));
  const skip = (page - 1) * limit;

  const filters = { userId: req.user._id };

  const [orders, totalItems] = await Promise.all([
    Order.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  res.json(
    new ApiResponse(true, "Orders fetched.", {
      orders: orders.map((order) => order.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  );
};

export const createOrder = async (req, res) => {
  const orderItems = await buildOrderItems(req.body.items);
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Retrieve shipping settings dynamically from Settings collection
  let activeShippingFee = Number(process.env.SHIPPING_FEE || 49);
  let activeFreeThreshold = Number(process.env.SHIPPING_FREE_THRESHOLD || 500);
  try {
    const settings = await Settings.findOne();
    if (settings) {
      activeShippingFee = settings.shippingFee ?? activeShippingFee;
      activeFreeThreshold = settings.shippingFreeThreshold ?? activeFreeThreshold;
    }
  } catch (err) {
    console.error("Failed to load settings in createOrder:", err);
  }

  let shippingFee = orderItems.reduce((sum, item) => sum + (item.product.deliveryFee || 0) * item.quantity, 0);
  if (shippingFee === 0 && subtotal < activeFreeThreshold) {
    shippingFee = activeShippingFee;
  } else if (subtotal >= activeFreeThreshold) {
    shippingFee = 0;
  }

  const { discount, couponCode } = await calculateDiscount(req.body.couponCode, orderItems);

  // Loyalty Discount Calculation
  const loyaltyPoints = req.user?.loyaltyPoints || 0;
  let loyaltyDiscountPercent = 0;
  if (loyaltyPoints > 1500) {
    loyaltyDiscountPercent = 10;
  } else if (loyaltyPoints > 500) {
    loyaltyDiscountPercent = 5;
  }
  const loyaltyDiscount = Math.round((subtotal * loyaltyDiscountPercent) / 100);

  const total = Math.max(subtotal + shippingFee - discount - loyaltyDiscount, 0);
  const paymentMethod = req.body.paymentMethod || "cod";

  // Prevent order number collisions with unique check loop
  let orderNumber;
  let isUnique = false;
  while (!isUnique) {
    orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const existing = await Order.findOne({ orderNumber });
    if (!existing) {
      isUnique = true;
    }
  }

  const guestAccessToken = !req.user ? crypto.randomBytes(32).toString("hex") : undefined;

  // Database Transaction Wrapper with Standalone Fallback
  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      // Create the order document inside transaction
      const ordersCreated = await Order.create(
        [
          {
            orderNumber,
            userId: req.user?._id || undefined,
            guestAccessToken,
            items: orderItems.map(({ product, quantity, variantName, price }) => ({
              productId: product._id,
              name: product.name,
              price,
              quantity,
              emoji: product.emoji,
              image: product.images?.[0]?.url || "",
              variantName,
            })),
            shippingAddress: req.body.shippingAddress,
            payment: {
              method: paymentMethod,
              status: "pending",
            },
            subtotal,
            shippingFee,
            discount,
            couponCode,
            loyaltyDiscount,
            specialInstructions: req.body.specialInstructions || "",
            total,
            status: "Processing",
            statusHistory: [{ status: "Processing", note: "Order created" }],
            deliverySlot: req.body.deliverySlot || "",
            estimatedDeliveryDate: req.body.estimatedDeliveryDate ? new Date(req.body.estimatedDeliveryDate) : undefined,
          },
        ],
        { session }
      );
      order = ordersCreated[0];

      // Decrement stock levels atomically inside transaction with stock availability check
      for (const item of orderItems) {
        let updateResult;
        if (item.variantName) {
          updateResult = await Product.updateOne(
            { 
              _id: item.product._id, 
              "variants.name": item.variantName,
              "variants.stockCount": { $gte: item.quantity }
            },
            { $inc: { "variants.$.stockCount": -item.quantity } },
            { session }
          );
        } else {
          updateResult = await Product.updateOne(
            { 
              _id: item.product._id,
              stockCount: { $gte: item.quantity },
              inStock: true
            },
            {
              $inc: { stockCount: -item.quantity }
            },
            { session }
          );
        }

        if (updateResult.matchedCount === 0) {
          throw new Error(`Product "${item.product.name}" was just sold out or does not have enough stock.`);
        }

        // Sync inStock flag if product stock hits zero
        await Product.updateOne(
          { _id: item.product._id, stockCount: { $lte: 0 } },
          { $set: { inStock: false } },
          { session }
        );
      }

      // Clear cart inside transaction
      if (req.user) {
        await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } }, { session });
      }
    });
  } catch (txError) {
    // Check if error is related to transactions or standalone MongoDB not supported
    const errString = `${txError.message || ""} ${txError.codeName || ""} ${txError.originalError?.message || ""} ${txError.errorResponse?.errmsg || ""}`;
    const isUnsupported =
      errString.includes("ReplicaSetNoPrimary") ||
      errString.includes("retryable writes") ||
      errString.includes("Transaction numbers") ||
      errString.includes("transaction") ||
      errString.includes("IllegalOperation") ||
      txError.code === 20 ||
      txError.originalError?.code === 20;

    if (isUnsupported) {
      console.warn("Transactions not supported. Falling back to non-transactional order creation.");

      // Fallback: Non-transactional execution
      order = await Order.create({
        orderNumber,
        userId: req.user?._id || undefined,
        guestAccessToken,
        items: orderItems.map(({ product, quantity, variantName, price }) => ({
          productId: product._id,
          name: product.name,
          price,
          quantity,
          emoji: product.emoji,
          image: product.images?.[0]?.url || "",
          variantName,
        })),
        shippingAddress: req.body.shippingAddress,
        payment: {
          method: paymentMethod,
          status: "pending",
        },
        subtotal,
        shippingFee,
        discount,
        couponCode,
        loyaltyDiscount,
        specialInstructions: req.body.specialInstructions || "",
        total,
        status: "Processing",
        statusHistory: [{ status: "Processing", note: "Order created" }],
        deliverySlot: req.body.deliverySlot || "",
        estimatedDeliveryDate: req.body.estimatedDeliveryDate ? new Date(req.body.estimatedDeliveryDate) : undefined,
      });

      for (const item of orderItems) {
        let updateResult;
        if (item.variantName) {
          updateResult = await Product.updateOne(
            { 
              _id: item.product._id, 
              "variants.name": item.variantName,
              "variants.stockCount": { $gte: item.quantity }
            },
            { $inc: { "variants.$.stockCount": -item.quantity } }
          );
        } else {
          updateResult = await Product.updateOne(
            { 
              _id: item.product._id,
              stockCount: { $gte: item.quantity },
              inStock: true
            },
            {
              $inc: { stockCount: -item.quantity }
            }
          );
        }

        if (updateResult.matchedCount === 0) {
          // If stock decrement fails in non-transactional mode, delete created order to avoid orphan order
          await Order.deleteOne({ _id: order._id });
          return res.status(400).json(new ApiResponse(false, `Product "${item.product.name}" was just sold out or does not have enough stock.`));
        }

        await Product.updateOne(
          { _id: item.product._id, stockCount: { $lte: 0 } },
          { $set: { inStock: false } }
        );
      }

      if (req.user) {
        await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } }, { upsert: true });
      }
    } else {
      throw txError;
    }
  } finally {
    session.endSession();
  }

  // Check if it's the user's first order
  const isFirstOrder = req.user ? (await Order.countDocuments({ userId: req.user._id })) === 1 : false;
  if (isFirstOrder && req.user.referredBy) {
    const referrer = await User.findById(req.user.referredBy);
    if (referrer) {
      // Create coupon for referee
      const refereeCouponCode = `REF-WELCOME-15-${req.user._id.toString().slice(-6)}`.toUpperCase();
      try {
        await Coupon.create({
          code: refereeCouponCode,
          discountType: "percent",
          discountValue: 15,
          minOrderAmount: 100,
          active: true,
        });
        await Notification.create({
          userId: req.user._id,
          title: "🎁 Referral Welcome Reward",
          message: `Thank you for placing your first order! As a referred user, here is your 15% discount coupon: ${refereeCouponCode}`,
        });
      } catch (err) {
        console.error("Failed to create referee referral coupon:", err);
      }

      // Create coupon for referrer
      const referrerCouponCode = `REF-WELCOME-15-${referrer._id.toString().slice(-6)}`.toUpperCase();
      try {
        await Coupon.create({
          code: referrerCouponCode,
          discountType: "percent",
          discountValue: 15,
          minOrderAmount: 100,
          active: true,
        });
        await Notification.create({
          userId: referrer._id,
          title: "🎁 Referral Reward Credited!",
          message: `Your friend ${req.user.name || req.user.email} placed their first order! Here is your 15% discount coupon: ${referrerCouponCode}`,
        });
      } catch (err) {
        console.error("Failed to create referrer referral coupon:", err);
      }
    }
  }

  // Credit loyalty points
  if (req.user) {
    const pointsEarned = Math.floor(total / 100);
    if (pointsEarned > 0) {
      await User.updateOne({ _id: req.user._id }, { $inc: { loyaltyPoints: pointsEarned } });
      const updatedUser = await User.findById(req.user._id);
      let newMembership = "Silver";
      if (updatedUser.loyaltyPoints > 1500) {
        newMembership = "Platinum";
      } else if (updatedUser.loyaltyPoints > 500) {
        newMembership = "Gold";
      }
      if (updatedUser.membership !== newMembership) {
        updatedUser.membership = newMembership;
        await updatedUser.save();

        await Notification.create({
          userId: req.user._id,
          title: "🎉 Membership Upgraded!",
          message: `Congratulations! You have been upgraded to ${newMembership} status. Enjoy additional perks and checkout discounts.`,
        });
      }
    }
  }

  // Decrement stock levels
  for (const item of orderItems) {
    if (item.variantName) {
      await Product.updateOne(
        { _id: item.product._id, "variants.name": item.variantName },
        {
          $inc: { "variants.$.stockCount": -item.quantity },
        }
      );
    } else {
      await Product.updateOne(
        { _id: item.product._id },
        {
          $inc: { stockCount: -item.quantity },
          $set: { inStock: item.product.stockCount - item.quantity > 0 },
        },
      );
    }

    // Trigger low stock check
    try {
      const refreshedProduct = await Product.findById(item.product._id);
      let isLow = false;
      let remaining = 0;

      if (item.variantName) {
        const matchingVariant = refreshedProduct.variants.find((v) => v.name === item.variantName);
        if (matchingVariant && matchingVariant.stockCount < 5) {
          isLow = true;
          remaining = matchingVariant.stockCount;
        }
      } else {
        if (refreshedProduct.stockCount < 5) {
          isLow = true;
          remaining = refreshedProduct.stockCount;
        }
      }

      if (isLow && refreshedProduct.seller) {
        await Notification.create({
          userId: refreshedProduct.seller,
          title: "⚠️ Low Stock Warning",
          message: `Your product "${refreshedProduct.name}" ${item.variantName ? `(${item.variantName}) ` : ""}is running low. Only ${remaining} units remaining. Please replenish stock!`,
        });
      }
    } catch (err) {
      console.error("Error triggering low stock warning notification:", err);
    }
  }

  if (req.user) {
    await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } }, { upsert: true });
  }

  // Notify product sellers of the new order purchase
  try {
    const notifications = [];
    const customerName = req.user ? (req.user.name || req.user.email) : (order.shippingAddress?.name || "Guest Buyer");
    for (const item of orderItems) {
      if (item.product.seller) {
        notifications.push({
          userId: item.product.seller,
          title: "📦 New Store Order Placed",
          message: `Hurray! Customer ${customerName} has purchased your product "${item.product.name}"${item.variantName ? ` (${item.variantName})` : ""} (Qty: ${item.quantity}). Order Ref: ${order.orderNumber}. Prepare the item for shipment!`,
        });
      }
    }
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (notifErr) {
    console.error("Error creating notifications for sellers on order placement:", notifErr);
  }

  const emailTo = req.user?.email || order.shippingAddress?.email || "";
  if (emailTo) {
    try {
      await sendEmail({
        to: emailTo,
        subject: `Order ${order.orderNumber} confirmed`,
        text: `Your GaramBazaar order ${order.orderNumber} has been placed.`,
      });
    } catch (emailError) {
      console.error("Gracefully caught mail sending failure:", emailError.message);
    }
  }

  res.status(201).json(new ApiResponse(true, "Order placed.", {
    order: order.toClient(),
    ...(guestAccessToken ? { guestAccessToken } : {}),
  }));
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ orderNumber: id }).select("+guestAccessToken");

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  let isAuthorized = false;
  const isAdmin = req.user?.role === "admin";

  if (isAdmin) {
    isAuthorized = true;
  } else if (order.userId) {
    if (req.user && order.userId.toString() === req.user._id.toString()) {
      isAuthorized = true;
    }
  } else {
    // Guest order: strictly require matching guest access token
    const providedToken = req.headers["x-guest-token"] || req.query.guestToken || req.body?.guestToken;
    if (providedToken && order.guestAccessToken && providedToken === order.guestAccessToken) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return res.status(403).json(new ApiResponse(false, "Unauthorized to cancel this order. Valid authorization or guest access token required."));
  }

  if (order.status !== "Processing") {
    return res.status(400).json(new ApiResponse(false, `Cannot cancel order in "${order.status}" status.`));
  }

  // Restore stock counts
  for (const item of order.items) {
    if (item.variantName) {
      await Product.updateOne(
        { _id: item.productId, "variants.name": item.variantName },
        { $inc: { "variants.$.stockCount": item.quantity } }
      );
    } else {
      await Product.updateOne(
        { _id: item.productId },
        {
          $inc: { stockCount: item.quantity },
          $set: { inStock: true },
        }
      );
    }
  }

  order.status = "Cancelled";
  order.statusHistory.push({ status: "Cancelled", note: `Cancelled by ${isAdmin ? "administrator" : "buyer"}` });
  await order.save();

  // Notify sellers
  try {
    const notifications = [];
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product && product.seller) {
        notifications.push({
          userId: product.seller,
          title: "❌ Order Cancelled",
          message: `Order ${order.orderNumber} containing "${item.name}"${item.variantName ? ` (${item.variantName})` : ""} was cancelled by the ${isAdmin ? "administrator" : "buyer"}.`,
        });
      }
    }
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error("Failed to notify sellers on cancellation:", err);
  }

  return res.json(new ApiResponse(true, "Order cancelled successfully.", { order: order.toClient() }));
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const lookup = id.match(/^[a-f\d]{24}$/i) ? { $or: [{ _id: id }, { orderNumber: id }] } : { orderNumber: id };
  const order = await Order.findOne(lookup).select("+guestAccessToken");

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  let isAuthorized = false;
  const isAdmin = req.user?.role === "admin";

  if (isAdmin) {
    isAuthorized = true;
  } else if (order.userId) {
    if (req.user && order.userId.toString() === req.user._id.toString()) {
      isAuthorized = true;
    } else if (req.user?.role === "seller") {
      const products = await Product.find({ seller: req.user._id });
      const productIds = products.map((p) => p._id.toString());
      isAuthorized = order.items.some((item) => productIds.includes(item.productId.toString()));
    }
  } else {
    // Guest order: strictly require matching guest access token
    const providedToken = req.headers["x-guest-token"] || req.query.guestToken || req.body?.guestToken;
    if (providedToken && order.guestAccessToken && providedToken === order.guestAccessToken) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return res.status(403).json(new ApiResponse(false, "Unauthorized to view this order. Valid authorization or guest access token required."));
  }

  return res.json(new ApiResponse(true, "Order fetched successfully.", { order: order.toClient() }));
};
