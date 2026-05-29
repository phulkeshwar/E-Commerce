import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Cart } from "../models/Cart.model.js";
import { Product } from "../models/Product.model.js";

const resolveProductId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return id;
  }

  const product = await Product.findOne({ legacyId: id });
  return product?._id;
};

const buildCartItems = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart) {
    return [];
  }

  return cart.items
    .filter((item) => item.productId)
    .map((item) => ({
      productId: item.productId._id.toString(),
      quantity: item.quantity,
      product: item.productId.toClient(),
    }));
};

export const getCart = async (req, res) => {
  res.json(new ApiResponse(true, "Cart fetched.", { items: await buildCartItems(req.user._id) }));
};

export const updateCart = async (req, res) => {
  const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
  const normalized = [];

  for (const item of rawItems) {
    const productId = await resolveProductId(item.productId);
    const quantity = Math.max(1, Math.min(Number(item.quantity || 1), 99));

    if (!productId) {
      continue;
    }

    const product = await Product.findById(productId);
    if (!product || !product.inStock || product.stockCount < quantity) {
      continue;
    }

    normalized.push({ productId, quantity });
  }

  await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { items: normalized } },
    { upsert: true, new: true },
  );

  res.json(new ApiResponse(true, "Cart updated.", { items: await buildCartItems(req.user._id) }));
};
