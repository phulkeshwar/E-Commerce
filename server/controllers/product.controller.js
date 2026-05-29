import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/Product.model.js";

const buildMongoQuery = (query = {}) => {
  const search = (query.search || "").trim();
  const category = query.category || "All";
  const featured = query.featured === "true";
  const badge = (query.badge || "").trim().toLowerCase();
  const filters = {};

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (category !== "All") {
    filters.category = category;
  }

  if (featured) {
    filters.isFeatured = true;
  }

  if (badge) {
    filters.badge = badge;
  }

  return filters;
};

export const getProducts = async (req, res) => {
  const [products, featured] = await Promise.all([
    Product.find(buildMongoQuery(req.query)).sort({ createdAt: -1 }).limit(100),
    Product.find({ isFeatured: true }).sort({ rating: -1 }).limit(12),
  ]);

  res.json(
    new ApiResponse(true, "Products fetched.", {
      products: products.map((product) => product.toClient()),
      featured: featured.map((product) => product.toClient()),
    }),
  );
};

export const getProductById = async (req, res) => {
  const lookup = req.params.id.match(/^[a-f\d]{24}$/i)
    ? { $or: [{ _id: req.params.id }, { slug: req.params.id }, { legacyId: req.params.id }] }
    : { $or: [{ slug: req.params.id }, { legacyId: req.params.id }] };
  const product = await Product.findOne(lookup);

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .sort({ rating: -1 })
    .limit(4);

  res.json(
    new ApiResponse(true, "Product fetched.", {
      product: product.toClient(),
      relatedProducts: relatedProducts.map((entry) => entry.toClient()),
    }),
  );
};
