/**
 * High-performance Cache Layer
 * Provides in-memory LRU/TTL caching with optional Redis capability.
 */

class MemoryCache {
  constructor(maxEntries = 500) {
    this.store = new Map();
    this.maxEntries = maxEntries;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Move to most recently used
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key, value, ttlSeconds = 60) {
    if (this.store.size >= this.maxEntries) {
      // Evict oldest entry (first key in map)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key) {
    this.store.delete(key);
  }

  flushPattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

export const memoryCache = new MemoryCache();

/**
 * Cache middleware for Express routes.
 * Caches successful JSON responses (status 200) for a given TTL in seconds.
 */
export const cacheResponse = (ttlSeconds = 60, prefix = "cache") => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Skip cache for sellers/admins looking at draft items
    if (req.user && (req.user.role === "admin" || req.user.role === "seller")) {
      return next();
    }

    const cacheKey = `${prefix}:${req.originalUrl || req.url}`;
    const cachedData = memoryCache.get(cacheKey);

    if (cachedData) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cachedData);
    }

    res.setHeader("X-Cache", "MISS");

    // Intercept res.json
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful API responses
      if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success !== false) {
        memoryCache.set(cacheKey, body, ttlSeconds);
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate catalog cache keys (products, categories, brands)
 */
export const invalidateCatalogCache = (pattern = "catalog:*") => {
  memoryCache.flushPattern(pattern);
};
