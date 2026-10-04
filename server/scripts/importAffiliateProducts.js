import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.model.js";

// Load environment variables with override enabled
dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("Error: MONGODB_URI is not set in environment.");
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

function formatAffiliateUrl(rawUrl, defaultTag = process.env.AMAZON_ASSOCIATE_TAG) {
  if (!rawUrl) return "";
  let url = rawUrl.trim();
  const isAmazon = /amazon\.(in|com|co\.uk|de|ca|com\.au)/i.test(url) || /amzn\.to/i.test(url);
  if (isAmazon && defaultTag) {
    try {
      const parsed = new URL(url);
      if (!parsed.searchParams.has("tag")) {
        parsed.searchParams.set("tag", defaultTag.trim());
        url = parsed.toString();
      }
    } catch {
      // Return original URL if parsing fails (e.g., raw redirect string)
    }
  }
  return url;
}

export async function importProducts(disconnect = true, customFilePath = null) {
  let resolvedFilePath = customFilePath;

  if (!resolvedFilePath) {
    const cliArg = process.argv[2];
    if (cliArg && !cliArg.startsWith("--")) {
      resolvedFilePath = cliArg;
    } else {
      resolvedFilePath = "products.csv";
    }
  }

  // Resolve file path safely
  let targetPath = path.isAbsolute(resolvedFilePath)
    ? resolvedFilePath
    : path.resolve(process.cwd(), resolvedFilePath);

  if (!fs.existsSync(targetPath)) {
    // Try resolving relative to server root
    const serverRootPath = path.resolve(__dirname, "..", resolvedFilePath);
    if (fs.existsSync(serverRootPath)) {
      targetPath = serverRootPath;
    } else {
      console.error(`Error: File not found at ${targetPath} or ${serverRootPath}`);
      return { inserted: 0, updated: 0, failed: 1 };
    }
  }

  console.log(`[CSV Import] Reading file: ${targetPath}`);

  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(MONGO_URI);
      console.log("Connected to MongoDB:", mongoose.connection.name);
    }

    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(targetPath)
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
      const title = (row.title || row.name || "").trim();
      const imageUrl = (row.imageUrl || row.image || "").trim();
      const rawLink = (row.affiliateLink || row.link || row.url || "").trim();
      const affiliateLink = formatAffiliateUrl(rawLink, row.tag || process.env.AMAZON_ASSOCIATE_TAG);
      const price = Number(row.price) || 0;
      const originalPrice = row.originalPrice ? Number(row.originalPrice) : null;
      const category = (row.category || "Gadgets").trim();
      const description = (row.description || "").trim();
      const source = (row.source || (affiliateLink.includes("amazon") ? "amazon" : "web-app")).trim().toLowerCase();
      const badge = (row.badge || (source === "amazon" ? "Amazon Choice" : "")).trim() || null;
      const rating = row.rating ? Number(row.rating) : 4.6;
      const reviewCount = row.reviewCount ? Number(row.reviewCount) : Math.floor(Math.random() * 200) + 40;
      const emoji = row.emoji || (category.toLowerCase() === "gadgets" ? "⚡" : "📦");
      const tags = row.tags
        ? (Array.isArray(row.tags) ? row.tags : row.tags.split(";").map((t) => t.trim()))
        : [category.toLowerCase(), source, "gadgets"];

      if (!title || !imageUrl || !affiliateLink) {
        console.warn(`[SKIP] Missing required fields (title, imageUrl, or affiliateLink):`, row);
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
          originalPrice,
          badge,
          rating,
          reviewCount,
          emoji,
          tags,
          description,
          images: [{ url: imageUrl, alt: title }],
          productType: "affiliate",
          source,
          inStock: true,
          isPublished: true,
          stockCount: 999, // Unlimited virtual stock for affiliate items
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
          console.log(`[INSERT] "${title}" (${category}) as new affiliate product`);
        } else if (result.modifiedCount > 0) {
          updated++;
          console.log(`[UPDATE] "${title}" updated details/pricing`);
        } else {
          console.log(`[UNCHANGED] "${title}"`);
        }
      } catch (err) {
        console.error(`[ERROR] Failed to import "${title}":`, err.message);
        failed++;
      }
    }

    console.log(`\nImport Summary for ${path.basename(targetPath)}:\n- Inserted: ${inserted}\n- Updated: ${updated}\n- Failed/Skipped: ${failed}`);
    return { inserted, updated, failed };
  } catch (error) {
    console.error("Database connection or parsing error:", error);
    return { inserted: 0, updated: 0, failed: 1 };
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
