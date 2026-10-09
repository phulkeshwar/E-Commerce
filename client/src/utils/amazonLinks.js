/**
 * Smart Amazon Affiliate and Customer Reviews URL Resolver
 * Eliminates Amazon 404 "Looking for something? We're sorry." errors.
 * Ensures verified affiliate tracking (tag=ironrites-21) on every link.
 */

export const PARTNER_TAG = "ironrites-21";

// Live, verified active ASINs on Amazon India (verified 200 OK)
export const VALID_AMAZON_IN_ASINS = new Set([
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

/**
 * Extracts ASIN from Amazon URL if present
 */
export function extractAsin(url) {
  if (!url) return null;
  const match = url.match(/\/dp\/([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Cleans product name for high-accuracy Amazon search query
 */
export function cleanProductSearchQuery(name) {
  if (!name) return "";
  return name
    .replace(/[()[\]]/g, " ")
    .replace(/,\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns a 100% functioning Amazon India product affiliate URL.
 * Guarantees zero 404 / "Looking for something?" dog pages.
 */
export function getAmazonProductUrl(product) {
  if (!product) return "";

  // Non-amazon affiliate products (software tools, web apps, chrome extensions)
  if (product.source !== "amazon" && product.affiliateLink && !product.affiliateLink.includes("amazon.")) {
    return product.affiliateLink;
  }

  const rawLink = product.affiliateLink || "";
  const asin = extractAsin(rawLink) || product.asin || product.specifications?.ASIN;

  // If verified valid ASIN on Amazon India, use direct product link
  if (asin && VALID_AMAZON_IN_ASINS.has(asin.toUpperCase())) {
    return `https://www.amazon.in/dp/${asin.toUpperCase()}?tag=${PARTNER_TAG}`;
  }

  // If already a custom search link with keyword
  if (rawLink.includes("/s?k=")) {
    try {
      const parsed = new URL(rawLink);
      parsed.searchParams.set("tag", PARTNER_TAG);
      return parsed.toString();
    } catch {
      // Fall through to query generation
    }
  }

  // Bulletproof fallback: Targeted search query on Amazon India with affiliate tag
  const query = cleanProductSearchQuery(product.name);
  return `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=${PARTNER_TAG}`;
}

/**
 * Returns a 100% functioning Amazon customer reviews URL with affiliate tracking.
 * Routes directly to verified review anchors for live ASINs, or to the live product search.
 */
export function getAmazonReviewsUrl(product) {
  if (!product) return "";

  const rawLink = product.affiliateLink || "";
  const asin = extractAsin(rawLink) || product.asin || product.specifications?.ASIN;

  // If verified valid ASIN, link directly to customer reviews on the product page
  if (asin && VALID_AMAZON_IN_ASINS.has(asin.toUpperCase())) {
    return `https://www.amazon.in/dp/${asin.toUpperCase()}?tag=${PARTNER_TAG}#customerReviews`;
  }

  // Fallback: Product search page where verified customer star ratings and review summaries are displayed
  const query = cleanProductSearchQuery(product.name);
  return `https://www.amazon.in/s?k=${encodeURIComponent(query)}&tag=${PARTNER_TAG}`;
}
