import { useEffect } from "react";

function setMetaTag(selector, attrName, attrValue, content) {
  if (!content) return null;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

export function useDocumentMetadata({
  title,
  description,
  keywords,
  image,
  type = "website",
  url,
  price,
  currency = "INR",
  schema,
  noindex = false,
}) {
  useEffect(() => {
    const siteName = "GaramBazaar";
    const fullTitle = title
      ? `${title} | ${siteName}`
      : `${siteName} | India's Finest Everyday Essentials & Tech`;

    // 1. Title
    document.title = fullTitle;

    // 2. Meta description & keywords
    if (description) {
      setMetaTag('meta[name="description"]', "name", "description", description);
    }
    if (keywords) {
      setMetaTag('meta[name="keywords"]', "name", "keywords", keywords);
    }

    // 3. Robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!metaRobots) {
        metaRobots = document.createElement("meta");
        metaRobots.setAttribute("name", "robots");
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute("content", "noindex, nofollow");
    } else if (metaRobots) {
      metaRobots.setAttribute("content", "index, follow");
    }

    // 4. Canonical & Canonical URL
    const canonicalId = "canonical-link";
    let canonicalLink = document.getElementById(canonicalId);
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      canonicalLink.setAttribute("id", canonicalId);
      document.head.appendChild(canonicalLink);
    }
    const currentCanonicalUrl = url || (window.location.origin + window.location.pathname);
    canonicalLink.setAttribute("href", currentCanonicalUrl);

    // 5. OpenGraph
    setMetaTag('meta[property="og:title"]', "property", "og:title", title || fullTitle);
    if (description) {
      setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    }
    setMetaTag('meta[property="og:type"]', "property", "og:type", type);
    setMetaTag('meta[property="og:url"]', "property", "og:url", currentCanonicalUrl);
    setMetaTag('meta[property="og:site_name"]', "property", "og:site_name", siteName);

    if (image) {
      setMetaTag('meta[property="og:image"]', "property", "og:image", image);
    }
    if (price) {
      setMetaTag('meta[property="product:price:amount"]', "property", "product:price:amount", String(price));
      setMetaTag('meta[property="product:price:currency"]', "property", "product:price:currency", currency);
    }

    // 6. Twitter Card
    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title || fullTitle);
    if (description) {
      setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    }
    if (image) {
      setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", image);
    }

    // 7. Structured Data (JSON-LD)
    const schemaId = "ld-schema-json";
    let schemaScript = document.getElementById(schemaId);

    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement("script");
        schemaScript.setAttribute("type", "application/ld+json");
        schemaScript.setAttribute("id", schemaId);
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    return () => {
      const activeScript = document.getElementById(schemaId);
      if (activeScript) {
        activeScript.remove();
      }
    };
  }, [title, description, keywords, image, type, url, price, currency, schema, noindex]);
}
