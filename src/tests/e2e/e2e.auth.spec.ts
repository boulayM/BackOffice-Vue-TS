import { test, expect } from "@playwright/test";

test.describe("auth", () => {
  test("redirects to access denied when unauthenticated", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      storageState: undefined,
    });
    const page = await context.newPage();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login|access-denied/);

    await context.close();
  });

  test("login and logout flow", async ({ page }) => {
    await page.goto("/logout");
    await expect(page).toHaveURL(/login|access-denied/);
  });
});
