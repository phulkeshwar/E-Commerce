import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateSubtotal,
  calculateItemCount,
  calculateShippingFee,
  calculateCouponDiscount,
  calculateCartSummary,
} from "../utils/cartCalculations.js";
import { calculateDiscount } from "../utils/calculateDiscount.js";

test("Cart Calculations - Subtotal & Item Count", () => {
  const items = [
    { id: "1", name: "Cardamom", price: 150, quantity: 2 },
    { id: "2", name: "Saffron", price: 400, quantity: 1 },
  ];

  assert.equal(calculateSubtotal(items), 700);
  assert.equal(calculateItemCount(items), 3);
  assert.equal(calculateSubtotal([]), 0);
  assert.equal(calculateItemCount([]), 0);
});

test("Cart Calculations - Shipping Threshold & Base Fee", () => {
  assert.equal(calculateShippingFee(0, 500, 49), 0); // Empty cart has no shipping
  assert.equal(calculateShippingFee(350, 500, 49), 49); // Below threshold
  assert.equal(calculateShippingFee(500, 500, 49), 0); // Exact threshold
  assert.equal(calculateShippingFee(850, 500, 49), 0); // Above threshold
});

test("Cart Calculations - Coupon Discount Percent & Fixed", () => {
  const percentCoupon = { code: "FEST10", discountType: "percent", discountValue: 10, minOrderAmount: 200 };
  const fixedCoupon = { code: "FLAT50", discountType: "fixed", discountValue: 50, minOrderAmount: 300 };

  // Percent coupon tests
  assert.equal(calculateCouponDiscount(150, percentCoupon), 0); // below minOrderAmount
  assert.equal(calculateCouponDiscount(1000, percentCoupon), 100); // 10% of 1000

  // Fixed coupon tests
  assert.equal(calculateCouponDiscount(250, fixedCoupon), 0); // below minOrderAmount
  assert.equal(calculateCouponDiscount(500, fixedCoupon), 50); // flat 50 off
  assert.equal(calculateCouponDiscount(30, { ...fixedCoupon, minOrderAmount: 0 }), 30); // discount cannot exceed subtotal
});

test("Cart Calculations - Full Summary Integration", () => {
  const items = [
    { id: "1", name: "Ginger", price: 200, quantity: 2 }, // 400
  ];
  const coupon = { code: "SAVE10", discountType: "percent", discountValue: 10, minOrderAmount: 100 };
  const settings = { shippingFreeThreshold: 500, shippingFee: 49 };

  const summary = calculateCartSummary(items, coupon, settings);
  assert.equal(summary.subtotal, 400);
  assert.equal(summary.itemCount, 2);
  assert.equal(summary.discount, 40);
  assert.equal(summary.shipping, 49); // 400 < 500
  assert.equal(summary.total, 409); // 400 + 49 - 40
  assert.equal(summary.freeDeliveryRemaining, 100); // 500 - 400
});

test("Product Discount Percentage Calculation", () => {
  assert.equal(calculateDiscount(80, 100), 20); // 20% off
  assert.equal(calculateDiscount(100, 100), 0); // No discount
  assert.equal(calculateDiscount(120, 100), 0); // Current higher than original
  assert.equal(calculateDiscount(50, 0), 0); // Invalid original price
});
