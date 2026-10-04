import "dotenv/config";
import { connectDB } from "../config/db.js";
import { Product } from "../models/product.model.js";
import { syncAmazonProducts } from "./importFromAmazonApi.js";

const POPULAR_GADGET_ASINS = [
  "B09XS7JWHH", // Sony WH-1000XM5 Noise Cancelling Headphones
  "B09738CV2G", // Elgato Stream Deck Mk.2
  "B0CP27Y56R", // Fire TV Stick 4K
  "B09B8VGCR8", // Echo Dot (5th Gen) Smart speaker with Alexa
  "B0C7Q41C34", // OnePlus Nord Buds 2 TWS
  "B0C741HZZK", // boAt Stone 1800 Bluetooth Speaker
  "B08CXL3YQ8", // Computer Monitor Light Bar with Auto-Dimming
  "B099T8C8YY", // Anker Magnetic Power Bank
  "B09C5R8FGL", // 3-in-1 Wireless Charging Station
  "B07YB32H52", // Keychron Mechanical Keyboard
  "B07Z3K3F33", // Smart Wi-Fi Socket Plug
  "B08X428MD6", // 100W GaN Multi-Port USB-C Desktop Charger
];

async function run() {
  await connectDB();

  console.log("==========================================");
  console.log("STEP 1: HIDING ALL FAKE / SEED PRODUCTS...");
  console.log("==========================================");

  // Set isPublished: false on all mock/seed products and web-apps where source is not 'amazon'
  const hideResult = await Product.updateMany(
    { source: { $ne: "amazon" } },
    { $set: { isPublished: false } }
  );

  console.log(`✅ Successfully hid ${hideResult.modifiedCount} fake/seed products (marked as isPublished: false).`);

  // Ensure all Amazon gadgets are published
  const publishResult = await Product.updateMany(
    { source: "amazon" },
    { $set: { isPublished: true, category: "Gadgets" } }
  );
  console.log(`✅ Ensured ${publishResult.matchedCount} Amazon gadgets are published.`);

  console.log("\n==========================================");
  console.log("STEP 2: IMPORTING REAL AMAZON GADGETS...");
  console.log("==========================================");

  await syncAmazonProducts(POPULAR_GADGET_ASINS);

  // Make sure imported gadgets are featured
  await Product.updateMany(
    { source: "amazon" },
    { $set: { isFeatured: true, isPublished: true } }
  );

  console.log("\n==========================================");
  console.log("STEP 3: SUMMARY OF PUBLISHED STORE PRODUCTS");
  console.log("==========================================");

  const publishedCount = await Product.countDocuments({ isPublished: true });
  const hiddenCount = await Product.countDocuments({ isPublished: false });
  const activeProducts = await Product.find({ isPublished: true })
    .select("name category price rating reviewCount source")
    .sort({ price: -1 })
    .lean();

  console.log(`\n🎉 Total Published Real Products in Store: ${publishedCount}`);
  console.log(`🔒 Total Hidden / Archived Products: ${hiddenCount}\n`);

  console.table(
    activeProducts.map((p) => ({
      Name: p.name.slice(0, 45) + (p.name.length > 45 ? "..." : ""),
      Category: p.category,
      Price: `₹${p.price.toLocaleString("en-IN")}`,
      Rating: `${p.rating} ★`,
      Reviews: p.reviewCount,
      Source: p.source,
    }))
  );

  process.exit(0);
}

run().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
