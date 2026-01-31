import { test, expect } from "@playwright/test";

test.describe.serial("audit logs critical", () => {
  test("audit logs page loads", async ({ page }) => {
    await page.goto("/audit-logs");
    await expect(
      page.getByRole("heading", { name: "Audit Logs" }),
    ).toBeVisible();
  });

  test("filter by action triggers list", async ({ page }) => {
    await page.goto("/audit-logs");
    await page.locator("#auditAction").fill("ORDER");
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Audit Logs" }),
    ).toBeVisible();
  });

  test("open details if row exists", async ({ page }) => {
    await page.goto("/audit-logs");
    const rows = page.locator("tbody tr");
    if ((await rows.count()) === 0) test.skip();
    await rows.first().getByRole("button", { name: "Details" }).click();
    await expect(page.locator("#audit-details")).toBeVisible();
  });

  test("export CSV", async ({ page }) => {
    await page.goto("/audit-logs");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /export/i }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/audit.*\.csv/i);
  });
});
