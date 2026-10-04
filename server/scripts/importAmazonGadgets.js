import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { importProducts } from "./importAffiliateProducts.js";

// Load environment variables
dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if a custom tag was passed in CLI args: --tag=myassociatetag-21
const args = process.argv.slice(2);
let customTag = null;
let customFile = "gadgets.csv";

for (const arg of args) {
  if (arg.startsWith("--tag=")) {
    customTag = arg.split("=")[1].trim();
  } else if (!arg.startsWith("--")) {
    customFile = arg;
  }
}

if (customTag) {
  process.env.AMAZON_ASSOCIATE_TAG = customTag;
  console.log(`[Amazon Importer] Using override Associate Tag from CLI: ${customTag}`);
} else if (process.env.AMAZON_ASSOCIATE_TAG) {
  console.log(`[Amazon Importer] Using Associate Tag from .env: ${process.env.AMAZON_ASSOCIATE_TAG}`);
} else {
  console.warn(`[Amazon Importer] Warning: No AMAZON_ASSOCIATE_TAG set in .env or --tag flag.`);
  console.warn(`To earn commissions, make sure your affiliateLinks contain your Associate Tag (e.g. ?tag=yourtag-21)`);
}

const targetPath = path.isAbsolute(customFile)
  ? customFile
  : path.resolve(__dirname, "..", customFile);

console.log(`\n======================================================`);
console.log(`🚀 Starting Amazon Bulk Gadget Importer`);
console.log(`📁 Source file: ${targetPath}`);
console.log(`======================================================\n`);

importProducts(true, targetPath)
  .then((stats) => {
    console.log(`\n🎉 Amazon Gadget import finished!`);
    console.log(`- Added: ${stats?.inserted || 0}`);
    console.log(`- Updated: ${stats?.updated || 0}`);
    console.log(`- Skipped: ${stats?.failed || 0}\n`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal error during Amazon Gadget import:", err);
    process.exit(1);
  });
