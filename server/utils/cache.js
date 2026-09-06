/**
 * Enterprise Distributed Cache Layer
 * Provides Redis caching with seamless fallback to In-Memory LRU/TTL caching.
 */
import dotenv from "dotenv";
dotenv.config();
import Redis from "ioredis";

class MemoryCache {
  constructor(maxEntries = 1000) {
    this.store = new Map();
    this.maxEntries = maxEntries;
  }

  async get(key) {
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

  async set(key, value, ttlSeconds = 60) {
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

  async del(key) {
    this.store.delete(key);
  }

  async flushPattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  async clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

export const memoryCache = new MemoryCache();

// Redis Client initialization with graceful error handling and retry suppression in non-prod
let redisClient = null;
let isRedisAvailable = false;

const initRedis = () => {
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT || 6379;

  if (redisUrl || redisHost) {
    try {
      redisClient = redisUrl
        ? new Redis(redisUrl, {
            enableReadyCheck: true,
            maxRetriesPerRequest: 1,
            retryStrategy(times) {
              if (times > 3) return null; // Stop retrying if Redis is not running
              return Math.min(times * 100, 1000);
            },
          })
        : new Redis({
            host: redisHost,
            port: Number(redisPort),
            password: process.env.REDIS_PASSWORD || undefined,
            enableReadyCheck: true,
            maxRetriesPerRequest: 1,
            retryStrategy(times) {
              if (times > 3) return null;
              return Math.min(times * 100, 1000);
            },
          });

      redisClient.on("connect", () => {
        isRedisAvailable = true;
        // console.log("[Cache] Redis connected successfully.");
      });

      redisClient.on("error", () => {
        isRedisAvailable = false;
      });

      redisClient.on("close", () => {
        isRedisAvailable = false;
      });
    } catch {
      isRedisAvailable = false;
    }
  }
};

initRedis();

/**
 * Universal Cache Getter (Redis with Memory Fallback)
 */
export const getCache = async (key) => {
  if (isRedisAvailable && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return memoryCache.get(key);
    }
  }
  return memoryCache.get(key);
};

/**
 * Universal Cache Setter (Redis with Memory Fallback)
 */
export const setCache = async (key, value, ttlSeconds = 60) => {
  if (isRedisAvailable && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return;
    } catch {
      // Fallback
    }
  }
  await memoryCache.set(key, value, ttlSeconds);
};

/**
 * Universal Cache Invalidator by Pattern
 */
export const flushCachePattern = async (pattern) => {
  if (isRedisAvailable && redisClient) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys && keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {
      // Fallback
    }
  }
  await memoryCache.flushPattern(pattern);
};

/**
 * Express Middleware for Caching Responses
 */
export const cacheResponse = (ttlSeconds = 60, prefix = "cache") => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Skip cache for sellers/admins looking at live data/draft items
    if (req.user && (req.user.role === "admin" || req.user.role === "seller")) {
      return next();
    }

    const cacheKey = `${prefix}:${req.originalUrl || req.url}`;
    try {
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        res.setHeader("X-Cache", "HIT");
        return res.json(cachedData);
      }
    } catch {
      // Ignore cache retrieval errors and proceed to database
    }

    res.setHeader("X-Cache", "MISS");

    // Intercept res.json
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success !== false) {
        setCache(cacheKey, body, ttlSeconds).catch(() => {});
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
  flushCachePattern(pattern).catch(() => {});
};

export { redisClient, isRedisAvailable };
