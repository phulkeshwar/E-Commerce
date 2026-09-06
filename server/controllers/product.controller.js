import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/Product.model.js";
import { StockAlert } from "../models/StockAlert.model.js";

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

const buildMongoQuery = (req) => {
  const query = req.query || {};
  const search = (query.search || "").trim();
  const category = query.category || "All";
  const featured = query.featured === "true";
  const badge = (query.badge || "").trim().toLowerCase();
  const seller = query.seller || "";
  const filters = {};

  if (search) {
    filters.$text = { $search: search };
  }

  if (category === "Software") {
    filters.productType = "affiliate";
  } else if (category !== "All") {
    filters.productType = "organic";
    filters.category = category;
  }

  if (featured) {
    filters.isFeatured = true;
  }

  if (badge) {
    filters.badge = badge;
  }

  if (seller) {
    filters.seller = seller;
  }

  const priceMin = parseFloat(query.priceMin);
  const priceMax = parseFloat(query.priceMax);
  if (!isNaN(priceMin) || !isNaN(priceMax)) {
    filters.price = {};
    if (!isNaN(priceMin)) {
      filters.price.$gte = priceMin;
    }
    if (!isNaN(priceMax)) {
      filters.price.$lte = priceMax;
    }
  }

  // Draft vs Published logic
  if (!req.user || req.user.role === "user") {
    filters.isPublished = true;
  } else if (req.user.role === "seller") {
    if (filters.$text) {
      // If doing a text search, we need to combine it with $or for published vs owner
      filters.$and = [
        { $text: { $search: search } },
        {
          $or: [
            { isPublished: true },
            { seller: req.user._id }
          ]
        }
      ];
      delete filters.$text; // Remove top-level $text search
    } else {
      filters.$or = [
        { isPublished: true },
        { seller: req.user._id }
      ];
    }
  }

  return filters;
};

export const getProducts = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 12));
  const skip = (page - 1) * limit;

  const mongoQuery = buildMongoQuery(req);

  const sortParam = req.query.sort || "relevance";
  let sortOption = { createdAt: -1 };
  if (sortParam === "price-asc") {
    sortOption = { price: 1 };
  } else if (sortParam === "price-desc") {
    sortOption = { price: -1 };
  } else if (sortParam === "rating") {
    sortOption = { rating: -1 };
  } else if (sortParam === "newest") {
    sortOption = { createdAt: -1 };
  } else if (sortParam === "relevance" && req.query.search) {
    sortOption = { score: { $meta: "textScore" } };
  }

  const queryProj = sortParam === "relevance" && req.query.search
    ? { score: { $meta: "textScore" } }
    : {};

  const featuredQuery = { isFeatured: true, isPublished: true };
  if (mongoQuery.productType) {
    featuredQuery.productType = mongoQuery.productType;
  }

  const [products, totalItems, featured] = await Promise.all([
    Product.find(mongoQuery, queryProj).sort(sortOption).skip(skip).limit(limit),
    Product.countDocuments(mongoQuery),
    Product.find(featuredQuery).sort({ rating: -1 }).limit(12),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  if (process.env.NODE_ENV !== "development") {
    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=120, stale-while-revalidate=59");
  } else {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  }
  res.json(
    new ApiResponse(true, "Products fetched.", {
      products: products.map((product) => product.toClient()),
      featured: featured.map((product) => product.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    }),
  );
};

export const getProductById = async (req, res) => {
  const lookup = req.params.id.match(/^[a-f\d]{24}$/i)
    ? { $or: [{ _id: req.params.id }, { slug: req.params.id }, { legacyId: req.params.id }] }
    : { $or: [{ slug: req.params.id }, { legacyId: req.params.id }] };
  const product = await Product.findOne(lookup).populate("seller", "name certificationStatus creditScore");

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  // Draft check
  if (!product.isPublished) {
    const isOwner = req.user && product.seller && req.user._id.toString() === product.seller._id.toString();
    const isAdmin = req.user && req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(404).json(new ApiResponse(false, "Product not found."));
    }
  }

  const relatedProducts = await Product.find({
    category: product.category,
    isPublished: true,
    _id: { $ne: product._id },
  })
    .sort({ rating: -1 })
    .limit(4);

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=59");
  res.json(
    new ApiResponse(true, "Product fetched.", {
      product: product.toClient(),
      relatedProducts: relatedProducts.map((entry) => entry.toClient()),
    }),
  );
};

export const notifyMeStock = async (req, res) => {
  const { id } = req.params;
  const { variantName } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  const existingAlert = await StockAlert.findOne({
    productId: product._id,
    userId: req.user._id,
    variantName: variantName || "",
    notified: false,
  });

  if (existingAlert) {
    return res.json(new ApiResponse(true, "You are already registered for a notification when this item is back in stock."));
  }

  await StockAlert.create({
    productId: product._id,
    userId: req.user._id,
    variantName: variantName || "",
  });

  return res.status(201).json(new ApiResponse(true, "You will be notified when this item is back in stock!"));
};
