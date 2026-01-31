import { test, expect } from "@playwright/test";

test.describe.serial("orders critical", () => {
  test("orders page loads", async ({ page }) => {
    await page.goto("/orders");
    await expect(
      page.getByRole("heading", { name: "Commandes" }),
    ).toBeVisible();
  });

  test("filter by status triggers list", async ({ page }) => {
    await page.goto("/orders");
    await page.locator("#ordersStatusFilter").selectOption("PENDING");
    await expect(
      page.getByRole("heading", { name: "Commandes" }),
    ).toBeVisible();
  });

  test("open details if row exists", async ({ page }) => {
    await page.goto("/orders");
    const rows = page.locator("tbody tr");
    if ((await rows.count()) === 0) test.skip();
    await rows.first().getByRole("button", { name: "Details" }).click();
    await expect(page.locator("#order-details")).toBeVisible();
  });

  test("export CSV", async ({ page }) => {
    await page.goto("/orders");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /export/i }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/orders.*\.csv/i);
  });
});
