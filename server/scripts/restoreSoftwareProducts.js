import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.model.js";
import { Category } from "../models/Category.model.js";
import { invalidateCatalogCache } from "../utils/cache.js";

async function run() {
  await connectDB();

  // Re-publish all software products
  const updateResult = await Product.updateMany(
    {
      $or: [
        { category: "Software" },
        { source: { $in: ["web-app", "chrome-extension"] } }
      ]
    },
    { $set: { isPublished: true, category: "Software" } }
  );
  console.log(`✓ Restored and unhidden ${updateResult.modifiedCount} software products (isPublished = true).`);

  // Ensure Software category exists
  await Category.findOneAndUpdate(
    { slug: "software" },
    { name: "Software", slug: "software", emoji: "⚡" },
    { upsert: true, new: true }
  );
  console.log(`✓ Re-created/ensured "Software" category in Category collection.`);

  invalidateCatalogCache();
  console.log(`✓ Catalog cache invalidated.`);

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
