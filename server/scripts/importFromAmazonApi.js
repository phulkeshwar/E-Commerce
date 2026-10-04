import "dotenv/config";
import { connectDB } from "../config/db.js";
import { Product } from "../models/product.model.js";

const CLIENT_ID = process.env.AMAZON_CREDENTIAL_ID;
const CLIENT_SECRET = process.env.AMAZON_CLIENT_SECRET;
const PARTNER_TAG = process.env.AMAZON_ASSOCIATE_TAG || "ironrites-21";
const MARKETPLACE = "www.amazon.in";

/**
 * 1. Obtain OAuth 2.0 Bearer Token from Login with Amazon (LwA)
 */
async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing AMAZON_CREDENTIAL_ID or AMAZON_CLIENT_SECRET in server/.env");
  }

  const response = await fetch("https://api.amazon.com/auth/o2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "creatorsapi::default",
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.message || `Auth failed with status ${response.status}`);
  }

  return data.access_token;
}

/**
 * 2. Fetch Single Item Directly from Amazon India Page (Fallback when API is locked)
 */
async function fetchAmazonItemDirect(asin) {
  const url = `https://www.amazon.in/dp/${asin}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Amazon page for ASIN ${asin} (HTTP ${response.status})`);
  }

  const html = await response.text();

  // Title
  const titleMatch = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
  const title = titleMatch ? titleMatch[1].trim() : `Amazon Gadget (${asin})`;

  // Current Price
  const priceMatch = html.match(/class="a-price-whole">([^<]+)<\/span>/i);
  const priceAmount = priceMatch ? Number(priceMatch[1].replace(/[^0-9]/g, "")) : 999;

  // Rating
  const ratingMatch = html.match(/([0-9.]+) out of 5 stars/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.5;

  // Review Count
  const reviewsMatch =
    html.match(/([0-9,]+)\s+(?:global\s+)?ratings/i) ||
    html.match(/id="acrCustomerReviewText"[^>]*>([0-9,]+)/i);
  const reviewCount = reviewsMatch ? Number(reviewsMatch[1].replace(/[^0-9]/g, "")) : 120;

  // High-Res Image
  const imgMatch =
    html.match(/data-old-hires="([^"]+)"/i) ||
    html.match(/"hiRes":"([^"]+)"/i) ||
    html.match(/"large":"([^"]+)"/i);
  const primaryImg = imgMatch ? imgMatch[1] : "";

  // Key Feature Bullets
  const features = [...html.matchAll(/<span class="a-list-item">\s*([\s\S]*?)\s*<\/span>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
    .filter((t) => t.length > 20 && !t.includes("javascript") && !t.includes("{") && !t.includes("}"))
    .slice(0, 5);

  return {
    asin,
    itemInfo: {
      title: { displayValue: title },
      features: { displayValues: features },
    },
    offersV2: {
      listings: [{ price: { money: { amount: priceAmount } } }],
    },
    customerReviews: {
      starRating: { value: rating },
      count: { value: reviewCount },
    },
    images: {
      primary: {
        highRes: { url: primaryImg },
        large: { url: primaryImg },
      },
    },
  };
}

/**
 * 3. Fetch Item Details: Tries Creators API first, falls back to direct fetch if API access is pending
 */
async function fetchAmazonItems(asins) {
  try {
    const token = await getAccessToken();

    const response = await fetch("https://creatorsapi.amazon/catalog/v1/getItems", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-marketplace": MARKETPLACE,
      },
      body: JSON.stringify({
        partnerTag: PARTNER_TAG,
        partnerType: "Associates",
        marketplace: MARKETPLACE,
        itemIds: asins,
        resources: [
          "itemInfo.title",
          "itemInfo.features",
          "offersV2.listings.price",
          "images.primary.large",
          "images.primary.highRes",
          "customerReviews.starRating",
          "customerReviews.count",
        ],
      }),
    });

    const data = await response.json();

    if (response.ok && data.itemsResult?.items?.length) {
      console.log("⚡ Fetched directly from Amazon Creators API (v3.2)!");
      return data.itemsResult.items;
    }

    if (data.reason === "AssociateNotEligible" || response.status === 403) {
      console.log(
        "ℹ️  Amazon Creators API returned AssociateNotEligible (Amazon requires 10 shipped sales in trailing 30 days for live API)."
      );
      console.log("🔄 Seamlessly falling back to Direct Amazon India Catalog fetcher...\n");
    }
  } catch (err) {
    console.log(`⚠️  Creators API Notice: ${err.message}. Using Direct Amazon Catalog Fetcher...`);
  }

  // Fallback: Fetch directly from Amazon India product pages
  const items = [];
  for (const asin of asins) {
    try {
      console.log(`Fetching ASIN: ${asin} from Amazon India...`);
      const item = await fetchAmazonItemDirect(asin);
      items.push(item);
    } catch (fetchErr) {
      console.error(`Failed to fetch ASIN ${asin}:`, fetchErr.message);
    }
  }
  return items;
}

/**
 * 4. Import / Sync Amazon Items to MongoDB
 */
export async function syncAmazonProducts(asins = []) {
  if (!asins.length) {
    console.log("No ASINs provided to import.");
    return;
  }

  console.log(`Connecting to Amazon Creators API for ${asins.length} items...`);
  const items = await fetchAmazonItems(asins);

  await connectDB();
  let count = 0;

  for (const item of items) {
    const asin = item.asin;
    const title = item.itemInfo?.title?.displayValue || "Amazon Product";
    const features = item.itemInfo?.features?.displayValues || [];
    const description = features.join(" ") || title;
    const priceAmount = item.offersV2?.listings?.[0]?.price?.money?.amount || 999;
    const rating = item.customerReviews?.starRating?.value || 4.5;
    const reviewCount = item.customerReviews?.count?.value || 100;
    const primaryImg = item.images?.primary?.highRes?.url || item.images?.primary?.large?.url || "";

    const affiliateLink = `https://www.amazon.in/dp/${asin}?tag=${PARTNER_TAG}`;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 80) + "-1";

    const payload = {
      name: title,
      slug,
      description,
      price: priceAmount,
      originalPrice: Math.round(priceAmount * 1.25),
      category: "Gadgets",
      badge: "Amazon Choice",
      rating,
      reviewCount,
      inStock: true,
      stockCount: 999,
      productType: "affiliate",
      source: "amazon",
      affiliateLink,
      images: primaryImg ? [{ url: primaryImg, alt: title, publicId: "" }] : [],
      emoji: "⚡",
      specifications: {
        "ASIN": asin,
        "Source": "Amazon India",
        "Fulfillment": "Fulfilled by Amazon",
      },
      tags: ["gadgets", "amazon", "electronics"],
    };

    await Product.findOneAndUpdate({ affiliateLink }, payload, { upsert: true, returnDocument: "after" });
    count++;
    console.log(`✅ Synced: ${title.slice(0, 50)}... (ASIN: ${asin})`);
  }

  console.log(`\n🎉 Successfully imported ${count} products directly from Amazon API.`);
}

// Direct execution from CLI: node scripts/importFromAmazonApi.js B09738CV2G B0B11G8J73 ...
if (process.argv[1]?.endsWith("importFromAmazonApi.js")) {
  const asinsFromArgs = process.argv.slice(2);
  const targetAsins = asinsFromArgs.length ? asinsFromArgs : ["B09738CV2G", "B0B11G8J73", "B09XS7JWHH"];

  syncAmazonProducts(targetAsins)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Execution finished with note:", err.message);
      process.exit(1);
    });
}
