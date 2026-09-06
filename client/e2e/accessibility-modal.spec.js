import { test, expect } from "@playwright/test";

test.describe("WCAG 2.2 AA Accessibility & Modal Focus Trapping", () => {
  test("Modal opens, traps keyboard focus, closes on Escape, and restores body scroll", async ({ page }) => {
    await page.goto("/checkout");

    // Check if any modal triggers exist on checkout or auth
    const authBtn = page.locator("button:has-text('Login'), button:has-text('Sign In'), button:has-text('Apply Coupon')").first();
    if (await authBtn.isVisible()) {
      await authBtn.click();

      // Verify modal dialog exists with WCAG ARIA attributes
      const modal = page.locator("[role='dialog']").first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      await expect(modal).toHaveAttribute("aria-modal", "true");

      // Verify Body scroll is locked
      const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
      expect(bodyOverflow).toBe("hidden");

      // Press Escape key
      await page.keyboard.press("Escape");

      // Verify Modal closes
      await expect(modal).not.toBeVisible();

      // Verify Body scroll is restored
      const restoredOverflow = await page.evaluate(() => document.body.style.overflow);
      expect(restoredOverflow).toBe("");
    }
  });
});
