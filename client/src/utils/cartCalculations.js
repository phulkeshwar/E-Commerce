/**
 * Pure cart calculation utilities for client-side order summaries and checkout
 */

export function calculateSubtotal(items = []) {
  return items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);
}

export function calculateItemCount(items = []) {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function calculateShippingFee(subtotal, threshold = 500, defaultFee = 49) {
  if (subtotal <= 0 || subtotal >= threshold) {
    return 0;
  }
  return defaultFee;
}

export function calculateCouponDiscount(subtotal, coupon) {
  if (!coupon || !coupon.discountValue || subtotal <= 0) {
    return 0;
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return 0;
  }

  if (coupon.discountType === "percent") {
    const discount = Math.round((subtotal * coupon.discountValue) / 100);
    return Math.min(discount, subtotal);
  }

  // Fixed discount
  return Math.min(Number(coupon.discountValue) || 0, subtotal);
}

export function calculateCartSummary(items = [], coupon = null, settings = {}) {
  const subtotal = calculateSubtotal(items);
  const itemCount = calculateItemCount(items);
  const freeThreshold = settings.shippingFreeThreshold ?? 500;
  const baseShippingFee = settings.shippingFee ?? 49;
  const shipping = calculateShippingFee(subtotal, freeThreshold, baseShippingFee);
  const discount = calculateCouponDiscount(subtotal, coupon);
  const total = Math.max(0, subtotal + shipping - discount);

  return {
    subtotal,
    itemCount,
    shipping,
    discount,
    total,
    freeDeliveryRemaining: subtotal > 0 && subtotal < freeThreshold ? freeThreshold - subtotal : 0,
  };
}
