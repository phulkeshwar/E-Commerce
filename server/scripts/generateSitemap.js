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

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
    }
  });
}

export async function generateSitemapXml() {
  await connectDB();

  const baseUrl = "https://garambazaar.vercel.app";
  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${baseUrl}/shop`, priority: "0.9", changefreq: "daily" },
    { loc: `${baseUrl}/vs-competitors`, priority: "0.8", changefreq: "weekly" },
    { loc: `${baseUrl}/contact`, priority: "0.6", changefreq: "monthly" },
    { loc: `${baseUrl}/info/about-us`, priority: "0.7", changefreq: "monthly" },
    { loc: `${baseUrl}/info/shipping-policy`, priority: "0.5", changefreq: "monthly" },
    { loc: `${baseUrl}/info/easy-returns`, priority: "0.5", changefreq: "monthly" },
    { loc: `${baseUrl}/info/privacy-policy`, priority: "0.4", changefreq: "monthly" },
    { loc: `${baseUrl}/info/terms-of-service`, priority: "0.4", changefreq: "monthly" },
    { loc: `${baseUrl}/info/faq`, priority: "0.6", changefreq: "weekly" },
  ];

  // Fetch categories
  const categories = await Category.find().sort({ name: 1 }).lean();
  const categoryPages = categories.map((c) => ({
    loc: `${baseUrl}/shop?category=${encodeURIComponent(c.name)}`,
    priority: "0.8",
    changefreq: "daily",
  }));

  // Fetch published products
  const products = await Product.find({ isPublished: true })
    .select("slug updatedAt createdAt name")
    .lean();

  const productPages = products.map((p) => {
    const lastModDate = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : today;
    return {
      loc: `${baseUrl}/products/${p.slug}`,
      lastmod: lastModDate,
      priority: "0.8",
      changefreq: "weekly",
    };
  });

  const allUrls = [...staticPages, ...categoryPages, ...productPages];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const page of allUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(page.loc)}</loc>\n`;
    xml += `    <lastmod>${page.lastmod || today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq || "weekly"}</changefreq>\n`;
    xml += `    <priority>${page.priority || "0.7"}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  return { xml, count: allUrls.length, productCount: products.length };
}

async function run() {
  const { xml, count, productCount } = await generateSitemapXml();
  const outputPath = path.resolve(__dirname, "../../client/public/sitemap.xml");

  fs.writeFileSync(outputPath, xml, "utf8");
  console.log(`✓ Generated sitemap with ${count} total URLs (${productCount} products) at: ${outputPath}`);
  process.exit(0);
}

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith("generateSitemap.js")) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
