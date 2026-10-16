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
  const cart = await Cart.findOne({ userId })
    .populate("items.productId")
    .populate("savedForLater.productId");

  if (!cart) {
    return { items: [], savedForLater: [] };
  }

  const mapItem = (item) => {
    if (!item.productId) return null;
    const prod = item.productId.toClient ? item.productId.toClient() : item.productId;
    let price = prod.price;
    let originalPrice = prod.originalPrice;
    if (item.variantName && prod.variants) {
      const variant = prod.variants.find((v) => v.name === item.variantName);
      if (variant) {
        price = variant.price;
        originalPrice = variant.originalPrice;
      }
    }
    return {
      productId: prod.id || prod._id.toString(),
      quantity: item.quantity,
      variantName: item.variantName,
      product: {
        ...prod,
        price,
        originalPrice,
      },
    };
  };

  return {
    items: cart.items.map(mapItem).filter(Boolean),
    savedForLater: (cart.savedForLater || []).map(mapItem).filter(Boolean),
  };
};

export const getCart = async (req, res) => {
  const cartData = await buildCartItems(req.user._id);
  res.json(new ApiResponse(true, "Cart fetched.", cartData));
};

export const updateCart = async (req, res) => {
  const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
  const rawSaved = Array.isArray(req.body.savedForLater) ? req.body.savedForLater : null;

  const rawProductIds = [
    ...rawItems.map((item) => item.productId).filter(Boolean),
    ...(rawSaved ? rawSaved.map((item) => item.productId).filter(Boolean) : []),
  ];

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

  const normalizedItems = [];
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

    normalizedItems.push({ productId: product._id, quantity, variantName: item.variantName });
  }

  const updateFields = { items: normalizedItems };

  if (rawSaved !== null) {
    const normalizedSaved = [];
    for (const item of rawSaved) {
      const rawId = item.productId?.toString();
      const product = productMap.get(rawId);
      const quantity = Math.max(1, Math.min(Number(item.quantity || 1), 99));
      if (!product) continue;
      normalizedSaved.push({ productId: product._id, quantity, variantName: item.variantName });
    }
    updateFields.savedForLater = normalizedSaved;
  }

  await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updateFields },
    { upsert: true, returnDocument: "after" },
  );

  const cartData = await buildCartItems(req.user._id);
  res.json(new ApiResponse(true, "Cart updated.", cartData));
};
