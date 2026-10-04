import { Category } from "../models/Category.model.js";

export const seedCategories = async () => {
  try {
    const defaultCategories = [
      { name: "Pantry", emoji: "🥫", slug: "pantry" },
      { name: "Beverages", emoji: "🥤", slug: "beverages" },
      { name: "Home", emoji: "🏠", slug: "home" },
      { name: "Personal Care", emoji: "🧴", slug: "personal-care" },
      { name: "Health", emoji: "🩺", slug: "health" },
      { name: "Software", emoji: "💻", slug: "software" },
      { name: "Gadgets", emoji: "⚡", slug: "gadgets" },
    ];
    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
      }
    }
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
};
