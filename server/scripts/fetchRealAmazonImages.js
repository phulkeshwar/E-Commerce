import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import { AMAZON_SALE_PRODUCTS } from "../data/amazonSaleData.js";
import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.model.js";
import { invalidateCatalogCache } from "../utils/cache.js";

async function isUrlValid(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "HEAD", timeout: 4000 });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}

async function findAmazonImage(productName) {
  const cleanName = productName.replace(/\(.*?\)/g, "").trim();
  const queries = [
    `${cleanName} amazon`,
    `${productName} amazon`,
    `${cleanName} product`,
  ];

  for (const query of queries) {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9"
        },
        timeout: 6000
      });
      const text = await res.text();
      const murlMatches = [...text.matchAll(/&quot;murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g)].map(m => m[1]);
      
      // Prioritize amazon CDN
      const amazonImages = murlMatches.filter(u => u.includes("media-amazon.com/images/I/"));
      for (const imgUrl of amazonImages) {
        if (await isUrlValid(imgUrl)) {
          return imgUrl;
        }
      }

      // If no media-amazon, check other product images
      for (const imgUrl of murlMatches.slice(0, 5)) {
        if (await isUrlValid(imgUrl)) {
          return imgUrl;
        }
      }
    } catch (e) {
      // Continue to next query
    }
  }
  return null;
}

async function run() {
  console.log("==========================================");
  console.log("FETCHING REAL AMAZON PRODUCT IMAGES (160 ITEMS)");
  console.log("==========================================\n");

  const updatedProducts = [...AMAZON_SALE_PRODUCTS];
  let fixedCount = 0;
  let alreadyWorking = 0;
  let failedCount = 0;

  for (let i = 0; i < updatedProducts.length; i++) {
    const p = updatedProducts[i];
    process.stdout.write(`[${i + 1}/${updatedProducts.length}] Checking: ${p.name.substring(0, 35)}... `);

    const valid = await isUrlValid(p.imageUrl);
    if (valid) {
      alreadyWorking++;
      console.log("✓ OK (already valid)");
      continue;
    }

    // Needs real image
    const realImg = await findAmazonImage(p.name);
    if (realImg) {
      p.imageUrl = realImg;
      fixedCount++;
      console.log(`✓ FIXED -> ${realImg.substring(0, 50)}...`);
    } else {
      failedCount++;
      console.log("✗ FAILED to find real image");
    }

    // Small delay to be polite
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\n==========================================");
  console.log(`SUMMARY: Already Working: ${alreadyWorking}, Fixed: ${fixedCount}, Failed: ${failedCount}`);
  console.log("==========================================\n");

  // Write updated products back to amazonSaleData.js
  const dataFilePath = path.join(__dirname, "../data/amazonSaleData.js");
  const fileContent = fs.readFileSync(dataFilePath, "utf8");
  
  // Re-write the export array
  const beforeArray = fileContent.substring(0, fileContent.indexOf("export const AMAZON_SALE_PRODUCTS = ["));
  const newArrayCode = `export const AMAZON_SALE_PRODUCTS = ${JSON.stringify(updatedProducts, null, 2)};\n`;
  fs.writeFileSync(dataFilePath, beforeArray + newArrayCode, "utf8");
  console.log("✓ Saved updated real images to server/data/amazonSaleData.js");

  // Now update MongoDB Atlas
  console.log("\nConnecting to MongoDB to update live store catalog...");
  await connectDB();

  let dbUpdated = 0;
  for (const item of updatedProducts) {
    const affiliateLink = `https://www.amazon.in/dp/${item.asin}?tag=ironrites-21`;
    await Product.updateOne(
      { $or: [{ affiliateLink }, { name: item.name }] },
      {
        $set: {
          images: [{ url: item.imageUrl, alt: item.name, publicId: "" }],
          emoji: "", // Clear emojis!
        }
      }
    );
    dbUpdated++;
  }
  console.log(`✓ Updated ${dbUpdated} products in MongoDB with real images and cleared emojis.`);

  invalidateCatalogCache();
  console.log("✓ Catalog caches invalidated.");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
