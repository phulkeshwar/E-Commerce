import fs from "fs";
import path from "path";
import csv from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.model.js";

// Load environment variables with override enabled
dotenv.config({ override: true });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("Error: MONGODB_URI is not set in environment.");
  process.exit(1);
}

const csvFilePath = path.resolve("products.csv");
if (!fs.existsSync(csvFilePath)) {
  console.error(`Error: File not found at ${csvFilePath}`);
  process.exit(1);
}

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

export async function importProducts(disconnect = true) {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Connecting to:", MONGO_URI);
      await mongoose.connect(MONGO_URI);
      console.log("Connected Host:", mongoose.connection.host);
      console.log("Connected DB Name:", mongoose.connection.name);
    }

    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`Parsed CSV. Found ${rows.length} rows. Starting import...`);

    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (const row of rows) {
      const title = (row.title || "").trim();
      const imageUrl = (row.imageUrl || "").trim();
      const affiliateLink = (row.affiliateLink || "").trim();
      const price = Number(row.price) || 0;
      const category = "Software";
      const description = (row.description || "").trim();

      const source = (row.source || "amazon").trim().toLowerCase();

      if (!title || !imageUrl || !affiliateLink) {
        console.warn(`[SKIP] Missing required fields for row: ${JSON.stringify(row)}`);
        failed++;
        continue;
      }

      try {
        // Generate unique slug
        let baseSlug = slugify(title);
        if (!baseSlug) baseSlug = "product";
        let slug = baseSlug;
        let exists = await Product.findOne({ slug, affiliateLink: { $ne: affiliateLink } });
        let counter = 1;
        while (exists) {
          slug = `${baseSlug}-${counter}`;
          exists = await Product.findOne({ slug, affiliateLink: { $ne: affiliateLink } });
          counter++;
        }

        const productData = {
          name: title,
          slug,
          category,
          price,
          description,
          images: [{ url: imageUrl, alt: title }],
          productType: "affiliate",
          source,
          inStock: true,
          isPublished: true,
          stockCount: 999 // Unlimited virtual stock for affiliate items
        };

        const result = await Product.updateOne(
          { affiliateLink },
          {
            $set: productData,
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          inserted++;
          console.log(`[INSERT] "${title}" as new affiliate product`);
        } else if (result.modifiedCount > 0) {
          updated++;
          console.log(`[UPDATE] "${title}" updated details/price`);
        } else {
          console.log(`[UNCHANGED] "${title}" no changes detected`);
        }
      } catch (err) {
        console.error(`[ERROR] Failed to import "${title}":`, err.message);
        failed++;
      }
    }

    console.log(`\nImport Summary:\n- Inserted: ${inserted}\n- Updated: ${updated}\n- Failed/Skipped: ${failed}`);
  } catch (error) {
    console.error("Database connection or parsing error:", error);
  } finally {
    if (disconnect) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB.");
    }
  }
}

if (process.argv[1] && (process.argv[1].endsWith("importAffiliateProducts.js") || process.argv[1].endsWith("importAffiliateProducts"))) {
  importProducts(true);
}
