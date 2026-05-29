import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.model.js";
import { slugify } from "../utils/slugify.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const products = JSON.parse(fs.readFileSync(path.join(__dirname, "products.json"), "utf8"));

await connectDB();

const docs = products.map((product) => ({
  ...product,
  legacyId: product.id,
  slug: product.slug || slugify(product.name),
  emoji: product.emoji || "📦",
}));

try {
  await Product.deleteMany({});
  await Product.insertMany(docs);
  console.log(`Seeded ${docs.length} products.`);
} catch (err) {
  console.error("Error seeding products:", err.message || err);
}
process.exit(0);

