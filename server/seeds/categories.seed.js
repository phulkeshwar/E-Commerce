import { Category } from "../models/Category.model.js";

export const seedCategories = async () => {
  try {
    const defaultCategories = [
      { name: "Mobiles & Tablets", emoji: "📱", slug: "mobiles-tablets" },
      { name: "Audio & Headphones", emoji: "🎧", slug: "audio-headphones" },
      { name: "Laptops & PC Accessories", emoji: "💻", slug: "laptops-computing" },
      { name: "Smart Home & TV", emoji: "📺", slug: "smart-home-tv" },
      { name: "Wearables & Watches", emoji: "⌚", slug: "wearables-watches" },
      { name: "Gaming Gear", emoji: "🎮", slug: "gaming-gear" },
      { name: "Cameras & Creator Tech", emoji: "📸", slug: "cameras-creator-tech" },
      { name: "Home & Kitchen", emoji: "🍳", slug: "home-kitchen" },
      { name: "Personal Care & Tech", emoji: "🪒", slug: "personal-care-tech" },
      { name: "Desk Setup & Office", emoji: "🪑", slug: "desk-setup-office" },
      { name: "Pantry", emoji: "🥫", slug: "pantry" },
      { name: "Beverages", emoji: "🥤", slug: "beverages" },
      { name: "Home", emoji: "🏠", slug: "home" },
      { name: "Personal Care", emoji: "🧴", slug: "personal-care" },
      { name: "Health", emoji: "🩺", slug: "health" },
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
