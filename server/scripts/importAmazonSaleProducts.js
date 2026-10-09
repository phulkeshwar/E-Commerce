import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models/Product.model.js";
import { Category } from "../models/Category.model.js";
import { AMAZON_SALE_GROUPS, AMAZON_SALE_PRODUCTS } from "../data/amazonSaleData.js";
import { importProducts } from "./importAffiliateProducts.js";
import { invalidateCatalogCache } from "../utils/cache.js";

const PARTNER_TAG = process.env.AMAZON_ASSOCIATE_TAG || "ironrites-21";

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI is not set in server/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB:", mongoose.connection.name);

  console.log("\n==========================================");
  console.log("STEP 1: SYNCING STORE CATEGORIES / GROUPS");
  console.log("==========================================");

  for (const group of AMAZON_SALE_GROUPS) {
    await Category.findOneAndUpdate(
      { name: group.name },
      { $set: { emoji: group.emoji, slug: group.slug } },
      { upsert: true, new: true }
    );
    console.log(`✓ Category synced: ${group.emoji} ${group.name}`);
  }

  console.log("\n==========================================");
  console.log("STEP 2: IMPORTING 31 SOFTWARE DIGITAL TOOLS");
  console.log("==========================================");

  // Import products.csv with category: "Software"
  await importProducts(false, "products.csv");

  // Ensure all web-apps and chrome-extensions are marked as Software & published
  const softwareUpdate = await Product.updateMany(
    { source: { $in: ["web-app", "chrome-extension"] } },
    { $set: { category: "Software", isPublished: true, emoji: "⚡" } }
  );
  console.log(`✓ Ensured ${softwareUpdate.modifiedCount} software tools have category="Software" and isPublished=true`);

  console.log("\n==========================================");
  console.log(`STEP 3: IMPORTING ${AMAZON_SALE_PRODUCTS.length} AMAZON SALE PRODUCTS...`);
  console.log("==========================================");

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of AMAZON_SALE_PRODUCTS) {
    const affiliateLink = `https://www.amazon.in/dp/${item.asin}?tag=${PARTNER_TAG}`;
    const baseSlug = slugify(item.name).slice(0, 70);
    const slug = `${baseSlug}-${item.asin.toLowerCase()}`;

    const payload = {
      name: item.name,
      slug,
      category: item.category,
      price: item.price,
      originalPrice: item.originalPrice,
      badge: item.badge,
      rating: item.rating,
      reviewCount: item.reviewCount,
      emoji: item.emoji,
      description: item.description,
      images: [
        {
          url: item.imageUrl,
          alt: item.name,
          publicId: "",
        },
      ],
      specifications: {
        ...item.specifications,
        "ASIN": item.asin,
        "Deal Tag": "Great Indian Festival 2026",
        "Source": "Amazon India",
      },
      tags: item.tags || [item.category.toLowerCase(), "amazon", "festival sale"],
      productType: "affiliate",
      source: "amazon",
      affiliateLink,
      inStock: true,
      stockCount: 999,
      isPublished: true,
      isFeatured: true,
    };

    const res = await Product.updateOne(
      { affiliateLink },
      { $set: payload, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    if (res.upsertedCount > 0) {
      insertedCount++;
    } else {
      updatedCount++;
    }
  }

  console.log(`\n🎉 Amazon Sale Import Finished: ${insertedCount} newly inserted, ${updatedCount} updated.`);

  console.log("\n==========================================");
  console.log("STEP 4: INVALIDATING CATALOG CACHES");
  console.log("==========================================");
  invalidateCatalogCache();
  console.log("✓ Catalog caches invalidated.");

  console.log("\n==========================================");
  console.log("STEP 5: SUMMARY OF LIVE STORE CATALOG");
  console.log("==========================================");

  const totalPublished = await Product.countDocuments({ isPublished: true });
  const categoryCounts = await Product.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  console.log(`Total Live Published Products: ${totalPublished}\n`);
  console.table(categoryCounts.map((c) => ({ Category: c._id, "Live Products": c.count })));

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

run().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
