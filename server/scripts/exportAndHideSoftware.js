import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.model.js";
import { Category } from "../models/Category.model.js";
import { invalidateCatalogCache } from "../utils/cache.js";

async function run() {
  await connectDB();

  // Find all software products
  const softwareProducts = await Product.find({
    $or: [
      { category: "Software" },
      { source: { $in: ["web-app", "chrome-extension"] } }
    ]
  }).lean();

  console.log(`Found ${softwareProducts.length} software products in DB.`);

  // Write markdown backup
  const mdPath = path.resolve(__dirname, "../../SOFTWARE_PRODUCTS_BACKUP.md");
  
  let md = `# 📦 Software Products Archive (Hidden Catalog)\n\n`;
  md += `> **Archived on:** ${new Date().toISOString()}\n`;
  md += `> **Total Products:** ${softwareProducts.length}\n`;
  md += `> **Status:** Hidden (\`isPublished: false\`)\n\n`;
  md += `This markdown document archives all software tools and digital products from GaramBazaar so they can be reviewed and unhidden at any time.\n\n`;
  
  md += `## 🚀 How to Unhide / Restore These Products\n\n`;
  md += `To unhide all software products and bring them back to the live store:\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Run the restore script from the project root:\n`;
  md += `node server/scripts/restoreSoftwareProducts.js\n`;
  md += `\`\`\`\n\n`;
  md += `Or via MongoDB Shell / Node:\n`;
  md += `\`\`\`javascript\n`;
  md += `await Product.updateMany(\n`;
  md += `  { $or: [{ category: "Software" }, { source: { $in: ["web-app", "chrome-extension"] } }] },\n`;
  md += `  { $set: { isPublished: true, category: "Software" } }\n`;
  md += `);\n`;
  md += `await Category.findOneAndUpdate(\n`;
  md += `  { slug: "software" },\n`;
  md += `  { name: "Software", slug: "software", emoji: "⚡" },\n`;
  md += `  { upsert: true }\n`;
  md += `);\n`;
  md += `\`\`\`\n\n`;

  md += `## 📋 Overview Table\n\n`;
  md += `| # | Product Name | Type | Price | Original Price | Direct / App Link |\n`;
  md += `|---|---|---|---|---|---|\n`;

  softwareProducts.forEach((p, idx) => {
    const link = p.affiliateLink || p.downloadUrl || p.sellerNotes || "-";
    md += `| ${idx + 1} | **${p.name}** | \`${p.source || "web-app"}\` | ₹${p.price} | ₹${p.originalPrice || p.price} | [Launch App](${link}) |\n`;
  });

  md += `\n---\n\n## 🔍 Detailed Product Specifications\n\n`;

  softwareProducts.forEach((p, idx) => {
    const link = p.affiliateLink || p.downloadUrl || p.sellerNotes || "";
    const imgUrl = p.images?.[0]?.url || p.images?.[0] || "";
    md += `### ${idx + 1}. ${p.name}\n\n`;
    md += `- **Slug:** \`${p.slug}\`\n`;
    md += `- **Category:** \`${p.category}\`\n`;
    md += `- **Product Type:** \`${p.source || "web-app"}\`\n`;
    md += `- **Price:** ₹${p.price} *(MRP: ₹${p.originalPrice || p.price})*\n`;
    md += `- **App / Access URL:** [${link}](${link})\n`;
    if (imgUrl) {
      md += `- **Preview Image:** ![${p.name}](${imgUrl})\n`;
    }
    md += `- **Description:** ${p.description || "N/A"}\n`;
    if (p.tags && p.tags.length > 0) {
      md += `- **Tags:** ${p.tags.join(", ")}\n`;
    }
    md += `\n`;
  });

  md += `\n---\n\n## 💾 Full Raw Data (JSON Backup)\n\n`;
  md += `\`\`\`json\n`;
  md += JSON.stringify(softwareProducts, null, 2);
  md += `\n\`\`\`\n`;

  fs.writeFileSync(mdPath, md, "utf8");
  console.log(`✓ Backup markdown created at: ${mdPath}`);

  // Now hide all software products in DB
  const updateResult = await Product.updateMany(
    {
      $or: [
        { category: "Software" },
        { source: { $in: ["web-app", "chrome-extension"] } }
      ]
    },
    { $set: { isPublished: false } }
  );
  console.log(`✓ Hidden ${updateResult.modifiedCount} software products (set isPublished = false).`);

  // Remove or hide "Software" category in Category collection
  const catDelete = await Category.deleteOne({
    $or: [{ name: "Software" }, { slug: "software" }]
  });
  console.log(`✓ Removed "Software" category from DB categories (deleted: ${catDelete.deletedCount}).`);

  // Invalidate cache
  invalidateCatalogCache();
  console.log(`✓ Catalog cache invalidated.`);

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
