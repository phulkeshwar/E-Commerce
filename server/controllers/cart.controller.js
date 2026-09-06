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
      variantName: item.variantName,
      product: item.productId.toClient(),
    }));
};

export const getCart = async (req, res) => {
  res.json(new ApiResponse(true, "Cart fetched.", { items: await buildCartItems(req.user._id) }));
};

export const updateCart = async (req, res) => {
  const rawItems = Array.isArray(req.body.items) ? req.body.items : [];

  const rawProductIds = rawItems.map((item) => item.productId).filter(Boolean);
  const objectIds = [];
  const legacyIds = [];

  for (const id of rawProductIds) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      objectIds.push(id);
    } else {
      legacyIds.push(id);
    }
  }

  let legacyProducts = [];
  if (legacyIds.length > 0) {
    legacyProducts = await Product.find({ legacyId: { $in: legacyIds } });
  }

  const allTargetIds = [
    ...objectIds,
    ...legacyProducts.map((p) => p._id),
  ];

  const products = await Product.find({ _id: { $in: allTargetIds } });
  const productMap = new Map();
  for (const p of products) {
    productMap.set(p._id.toString(), p);
    if (p.legacyId) {
      productMap.set(p.legacyId, p);
    }
  }

  const normalized = [];

  for (const item of rawItems) {
    const rawId = item.productId?.toString();
    const product = productMap.get(rawId);
    const quantity = Math.max(1, Math.min(Number(item.quantity || 1), 99));

    if (!product || !product.inStock) {
      continue;
    }

    if (item.variantName) {
      const variant = product.variants.find((v) => v.name === item.variantName);
      if (!variant || variant.stockCount < quantity) {
        continue;
      }
    } else {
      if (product.stockCount < quantity) {
        continue;
      }
    }

    normalized.push({ productId: product._id, quantity, variantName: item.variantName });
  }

  await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { items: normalized } },
    { upsert: true, returnDocument: "after" },
  );

  res.json(new ApiResponse(true, "Cart updated.", { items: await buildCartItems(req.user._id) }));
};
