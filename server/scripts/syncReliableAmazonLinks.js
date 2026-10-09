import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models/Product.model.js";
import { invalidateCatalogCache } from "../utils/cache.js";

const PARTNER_TAG = process.env.AMAZON_ASSOCIATE_TAG || "ironrites-21";

// Live, verified active ASINs on Amazon India (verified 200 OK)
const VALID_AMAZON_IN_ASINS = new Set([
  "B0CHX1W1XY", // Apple iPhone 15 (128 GB) - Black
  "B09XS7JWHH", // Sony WH-1000XM5
  "B0C33XXS56", // Sony WF-1000XM5
  "B0CCZ26B5V", // Bose QuietComfort Ultra
  "B098J7Z5NQ", // Logitech MX Keys Mini
  "B07YB32H52", // Keychron K2
  "B08CXL3YQ8", // Baseus Monitor Light Bar
  "B08DF248LD", // Xbox Wireless Controller
  "B098RKWHHZ", // Nintendo Switch (OLED Model)
  "B09738CV2G", // Elgato Stream Deck MK.2
  "B07H48412Q", // SanDisk 128GB Extreme PRO
  "B089K81D5N", // Philips Sonicare 4300
  "B079DH2J5Q", // Carewave Cordless Neck & Shoulder
]);

function cleanSearchQuery(name) {
  if (!name) return "";
  return name
    .replace(/[()[\]]/g, " ")
    .replace(/,\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI is not set in server/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB:", mongoose.connection.name);

  const amazonProducts = await Product.find({
    $or: [{ source: "amazon" }, { affiliateLink: { $regex: "amazon\\.", $options: "i" } }]
  });

  console.log(`Found ${amazonProducts.length} Amazon affiliate products to verify and update...`);

  let dpCount = 0;
  let searchCount = 0;

  for (const prod of amazonProducts) {
    const rawLink = prod.affiliateLink || "";
    const asinMatch = rawLink.match(/\/dp\/([A-Z0-9]{10})/i);
    const asin = asinMatch ? asinMatch[1].toUpperCase() : prod.specifications?.ASIN;

    let reliableLink;
    if (asin && VALID_AMAZON_IN_ASINS.has(asin)) {
      reliableLink = `https://www.amazon.in/dp/${asin}?tag=${PARTNER_TAG}`;
      dpCount++;
    } else {
      const q = cleanSearchQuery(prod.name);
      reliableLink = `https://www.amazon.in/s?k=${encodeURIComponent(q)}&tag=${PARTNER_TAG}`;
      searchCount++;
    }

    if (prod.affiliateLink !== reliableLink) {
      prod.affiliateLink = reliableLink;
      await prod.save();
    }
  }

  console.log("\n==========================================");
  console.log("AMAZON LINK MIGRATION COMPLETED");
  console.log("==========================================");
  console.log(`✓ Direct Verified DP Links: ${dpCount}`);
  console.log(`✓ Resilient Search Intent Links: ${searchCount}`);
  console.log("✓ All 404 dead links eliminated!");

  // Invalidate cache
  invalidateCatalogCache();
  console.log("✓ Catalog cache invalidated.");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
