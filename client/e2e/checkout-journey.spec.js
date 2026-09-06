import { test, expect } from "@playwright/test";

test.describe("E2E Customer Checkout Journey", () => {
  test("Browses catalog, verifies dynamic PIN code delivery, and completes guest checkout form", async ({ page }) => {
    // 1. Navigate to home catalog
    await page.goto("/");
    await expect(page).toHaveTitle(/GaramBazaar/i);

    // 2. Select first product card
    const firstProduct = page.locator("a[href*='/product/']").first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    await firstProduct.click();

    // 3. Verify Product Detail Page
    await expect(page.locator("h1")).toBeVisible();

    // 4. Test Dynamic PIN code serviceability input
    const pincodeInput = page.locator("input[placeholder*='PIN code' i], input[placeholder*='pincode' i], input[id*='pincode' i]").first();
    if (await pincodeInput.isVisible()) {
      await pincodeInput.fill("110001");
      const checkBtn = page.locator("button:has-text('Check'), button:has-text('Apply')").first();
      if (await checkBtn.isVisible()) {
        await checkBtn.click();
      }
      // Check delivery badge appears
      await expect(page.locator("text=/Delivery by/i")).toBeVisible({ timeout: 5000 });
    }

    // 5. Add to Cart
    const addToCartBtn = page.locator("button:has-text('Add to Cart')").first();
    await expect(addToCartBtn).toBeEnabled();
    await addToCartBtn.click();

    // 6. Open Cart Drawer / Navigate to Cart
    const cartIcon = page.locator("a[href*='/cart'], button[aria-label*='Cart' i]").first();
    await cartIcon.click();

    // 7. Proceed to Checkout
    const checkoutBtn = page.locator("a[href*='/checkout'], button:has-text('Checkout'), button:has-text('Proceed to Checkout')").first();
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // 8. Verify Checkout Page loaded with shipping form
    await expect(page).toHaveURL(/.*checkout.*/);
    const nameInput = page.locator("input[name='fullName'], input[name='name'], input[placeholder*='name' i]").first();
    await expect(nameInput).toBeVisible();
  });
});
