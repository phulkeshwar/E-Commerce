import { Category } from "../models/Category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { invalidateCatalogCache } from "../utils/cache.js";

export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(new ApiResponse(true, "Categories fetched.", categories.map(c => c.toClient())));
};

export const createCategory = async (req, res) => {
  const { name, emoji } = req.body;
  if (!name?.trim()) {
    throw new Error("Category name is required.");
  }
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  
  const existing = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
  if (existing) {
    throw new Error("Category name or slug already exists.");
  }

  const category = await Category.create({ name: name.trim(), emoji: emoji || "📦", slug });
  invalidateCatalogCache();
  res.status(201).json(new ApiResponse(true, "Category created successfully.", category.toClient()));
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, emoji } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new Error("Category not found.");
  }

  if (name && name.trim() !== category.name) {
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await Category.findOne({
      _id: { $ne: id },
      $or: [{ name: name.trim() }, { slug }]
    });
    if (existing) {
      throw new Error("Category name or slug already exists.");
    }
    category.name = name.trim();
    category.slug = slug;
  }

  if (emoji !== undefined) {
    category.emoji = emoji;
  }

  await category.save();
  invalidateCatalogCache();
  res.json(new ApiResponse(true, "Category updated successfully.", category.toClient()));
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    throw new Error("Category not found.");
  }
  
  await Category.deleteOne({ _id: id });
  invalidateCatalogCache();
  res.json(new ApiResponse(true, "Category deleted successfully.", { id }));
};
