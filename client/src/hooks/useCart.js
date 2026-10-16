import { useEffect, useMemo, useState, useRef } from "react";
import { getCartRequest, updateCartRequest } from "../api/cart.api";
import {
  getStoredCart,
  setStoredCart,
  getStoredSavedForLater,
  setStoredSavedForLater,
} from "../store/cartStore";

export function useCart(token) {
  const [items, setItems] = useState(() => getStoredCart());
  const [savedForLater, setSavedForLater] = useState(() => getStoredSavedForLater());
  const [loading, setLoading] = useState(false);

  const itemsRef = useRef(items);
  const savedRef = useRef(savedForLater);
  itemsRef.current = items;
  savedRef.current = savedForLater;

  useEffect(() => {
    setStoredCart(items);
  }, [items]);

  useEffect(() => {
    setStoredSavedForLater(savedForLater);
  }, [savedForLater]);

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    getCartRequest()
      .then((data) => {
        const parseItemList = (list) =>
          (list || [])
            .filter((item) => item.product)
            .map((item) => {
              const prod = item.product;
              let price = prod.price;
              let originalPrice = prod.originalPrice;
              if (item.variantName && prod.variants) {
                const variant = prod.variants.find((v) => v.name === item.variantName);
                if (variant) {
                  price = variant.price;
                  originalPrice = variant.originalPrice;
                }
              }
              return {
                ...prod,
                id: prod.id || prod._id,
                price,
                originalPrice,
                variantName: item.variantName,
                quantity: item.quantity,
              };
            });

        const nextItems = parseItemList(data.items);
        if (nextItems.length > 0 || (data.items && data.items.length === 0)) {
          setItems(nextItems);
        }

        const nextSaved = parseItemList(data.savedForLater);
        if (nextSaved.length > 0 || (data.savedForLater && data.savedForLater.length === 0)) {
          setSavedForLater(nextSaved);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const syncCart = async (nextItems = itemsRef.current, nextSaved = savedRef.current) => {
    if (!token) {
      return;
    }

    await updateCartRequest({
      items: nextItems.map((item) => ({
        productId: item.id || item._id,
        quantity: item.quantity,
        variantName: item.variantName,
      })),
      savedForLater: nextSaved.map((item) => ({
        productId: item.id || item._id,
        quantity: item.quantity,
        variantName: item.variantName,
      })),
    });
  };

  const updateItems = (updater) => {
    setItems((current) => {
      const nextItems = typeof updater === "function" ? updater(current) : updater;
      syncCart(nextItems, savedRef.current).catch(() => {});
      return nextItems;
    });
  };

  const addToCart = (product) => {
    updateItems((current) => {
      const pId = product.id || product._id;
      const existing = current.find(
        (item) => (item.id || item._id) === pId && item.variantName === product.variantName,
      );
      if (existing) {
        return current.map((item) =>
          (item.id || item._id) === pId && item.variantName === product.variantName
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { ...product, id: pId, quantity: 1 }];
    });
  };

  const bulkAddToCart = (products) => {
    updateItems((current) => {
      let next = [...current];
      products.forEach((p) => {
        const pId = p.id || p._id;
        const existingIdx = next.findIndex(
          (item) => (item.id || item._id) === pId && item.variantName === p.variantName,
        );
        if (existingIdx > -1) {
          next[existingIdx] = {
            ...next[existingIdx],
            quantity: next[existingIdx].quantity + (p.quantity || 1),
          };
        } else {
          next.push({ ...p, id: pId, quantity: p.quantity || 1 });
        }
      });
      return next;
    });
  };

  const updateQuantity = (productId, quantity, variantName) => {
    updateItems((current) =>
      current.map((item) =>
        (item.id || item._id) === productId && item.variantName === variantName
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );
  };

  const removeFromCart = (productId, variantName) => {
    updateItems((current) =>
      current.filter((item) => !((item.id || item._id) === productId && item.variantName === variantName)),
    );
  };

  const clearCart = () => updateItems([]);

  // ── Save for Later Actions ──────────────────────────────
  const saveForLater = (productId, variantName) => {
    const itemToSave = itemsRef.current.find(
      (item) => (item.id || item._id) === productId && item.variantName === variantName,
    );
    if (!itemToSave) return;

    const nextItems = itemsRef.current.filter(
      (item) => !((item.id || item._id) === productId && item.variantName === variantName),
    );

    const existingIdx = savedRef.current.findIndex(
      (item) => (item.id || item._id) === productId && item.variantName === variantName,
    );

    let nextSaved;
    if (existingIdx > -1) {
      nextSaved = savedRef.current.map((item, idx) =>
        idx === existingIdx ? { ...item, quantity: item.quantity + (itemToSave.quantity || 1) } : item,
      );
    } else {
      nextSaved = [{ ...itemToSave }, ...savedRef.current];
    }

    setItems(nextItems);
    setSavedForLater(nextSaved);
    syncCart(nextItems, nextSaved).catch(() => {});
  };

  const moveToCart = (productId, variantName) => {
    const itemToMove = savedRef.current.find(
      (item) => (item.id || item._id) === productId && item.variantName === variantName,
    );
    if (!itemToMove) return;

    const nextSaved = savedRef.current.filter(
      (item) => !((item.id || item._id) === productId && item.variantName === variantName),
    );

    const existingIdx = itemsRef.current.findIndex(
      (item) => (item.id || item._id) === productId && item.variantName === variantName,
    );

    let nextItems;
    if (existingIdx > -1) {
      nextItems = itemsRef.current.map((item, idx) =>
        idx === existingIdx ? { ...item, quantity: item.quantity + (itemToMove.quantity || 1) } : item,
      );
    } else {
      nextItems = [...itemsRef.current, { ...itemToMove, quantity: itemToMove.quantity || 1 }];
    }

    setSavedForLater(nextSaved);
    setItems(nextItems);
    syncCart(nextItems, nextSaved).catch(() => {});
  };

  const removeFromSavedForLater = (productId, variantName) => {
    const nextSaved = savedRef.current.filter(
      (item) => !((item.id || item._id) === productId && item.variantName === variantName),
    );
    setSavedForLater(nextSaved);
    syncCart(itemsRef.current, nextSaved).catch(() => {});
  };

  const clearSavedForLater = () => {
    setSavedForLater([]);
    syncCart(itemsRef.current, []).catch(() => {});
  };

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      subtotal,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      savedCount: savedForLater.length,
    };
  }, [items, savedForLater]);

  return {
    items,
    savedForLater,
    loading,
    addToCart,
    bulkAddToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    saveForLater,
    moveToCart,
    removeFromSavedForLater,
    clearSavedForLater,
    summary,
  };
}
