import { test, expect } from "@playwright/test";

test("auth setup", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL || "";
  const password = process.env.E2E_ADMIN_PASSWORD || "";
  if (!email || !password)
    throw new Error("E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD missing");

  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /connexion|login/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: "e2e.storage.json" });
});
