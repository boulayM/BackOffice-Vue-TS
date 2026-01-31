import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("dashboard loads", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /dashboard/i }),
    ).toBeVisible();
  });
  test("users loads", async ({ page }) => {
    await page.goto("/users");
    await expect(
      page.getByRole("heading", { name: /utilisateurs/i }),
    ).toBeVisible();
  });
  test("products loads", async ({ page }) => {
    await page.goto("/products");
    await expect(
      page.getByRole("heading", { name: /produits/i }),
    ).toBeVisible();
  });
  test("orders loads", async ({ page }) => {
    await page.goto("/orders");
    await expect(
      page.getByRole("heading", { name: /commandes/i }),
    ).toBeVisible();
  });
  test("audit logs loads", async ({ page }) => {
    await page.goto("/audit-logs");
    await expect(page.getByRole("heading", { name: /audit/i })).toBeVisible();
  });
});
