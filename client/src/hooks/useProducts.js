import { useEffect, useState } from "react";
import { getProductRequest, getProductsRequest } from "../api/products.api";

// ── In-Memory & SessionStorage Cache Layer (Instant 0ms UI Rendering) ─────────
const clientCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

function getClientCache(key) {
  if (clientCache.has(key)) {
    const entry = clientCache.get(key);
    if (Date.now() - entry.time < CACHE_TTL_MS) {
      return entry.data;
    }
  }
  try {
    const raw = sessionStorage.getItem(`gb_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.time < CACHE_TTL_MS) {
        clientCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch {}
  return null;
}

function setClientCache(key, data) {
  const entry = { data, time: Date.now() };
  clientCache.set(key, entry);
  try {
    sessionStorage.setItem(`gb_cache_${key}`, JSON.stringify(entry));
  } catch {}
}

export function useProducts(filters) {
  const queryKey = JSON.stringify(filters || {});
  const cached = getClientCache(`products_${queryKey}`);

  const [state, setState] = useState(() => {
    if (cached) {
      return {
        products: cached.products || [],
        featured: cached.featured || [],
        pagination: cached.pagination || {
          totalItems: cached.products?.length || 0,
          totalPages: 1,
          currentPage: 1,
          limit: 12,
        },
        loading: false,
        error: "",
      };
    }
    return {
      products: [],
      featured: [],
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
      },
      loading: true,
      error: "",
    };
  });

  useEffect(() => {
    let active = true;
    const parsedFilters = JSON.parse(queryKey);
    const cachedData = getClientCache(`products_${queryKey}`);

    // If no cache, show spinner. If cached, keep displaying instantly while revalidating in background.
    if (!cachedData) {
      setState((current) => ({ ...current, loading: true, error: "" }));
    }

    getProductsRequest(parsedFilters)
      .then((data) => {
        if (!active) return;
        setClientCache(`products_${queryKey}`, data);
        setState({
          products: data.products || [],
          featured: data.featured || [],
          pagination: data.pagination || {
            totalItems: data.products?.length || 0,
            totalPages: 1,
            currentPage: 1,
            limit: 12,
          },
          loading: false,
          error: "",
        });
      })
      .catch((error) => {
        if (!active) return;
        if (!cachedData) {
          setState({
            products: [],
            featured: [],
            pagination: {
              totalItems: 0,
              totalPages: 1,
              currentPage: 1,
              limit: 12,
            },
            loading: false,
            error: error.message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [queryKey]);

  return state;
}

export function useProductDetail(id) {
  const cached = getClientCache(`product_${id}`);

  const [state, setState] = useState(() => {
    if (cached) {
      return {
        product: cached.product,
        relatedProducts: cached.relatedProducts || [],
        loading: false,
        error: "",
      };
    }
    return {
      product: null,
      relatedProducts: [],
      loading: true,
      error: "",
    };
  });

  useEffect(() => {
    if (!id) return;
    let active = true;
    const cachedData = getClientCache(`product_${id}`);

    if (!cachedData) {
      setState((current) => ({ ...current, loading: true, error: "" }));
    }

    getProductRequest(id)
      .then((data) => {
        if (!active) return;
        setClientCache(`product_${id}`, data);
        setState({
          product: data.product,
          relatedProducts: data.relatedProducts || [],
          loading: false,
          error: "",
        });
      })
      .catch((error) => {
        if (!active) return;
        if (!cachedData) {
          setState({
            product: null,
            relatedProducts: [],
            loading: false,
            error: error.message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
