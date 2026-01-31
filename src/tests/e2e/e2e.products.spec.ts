import { test, expect } from "@playwright/test";

test.describe.serial("products critical", () => {
  const ts = Date.now();
  const name = `E2E Product ${ts}`;

  test("create product", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Produits" })).toBeVisible();

    const waitCreate = page.waitForResponse(
      (res) =>
        res.url().includes("/api/products") &&
        res.request().method() === "POST",
    );

    await page.locator("#productName").fill(name);
    await page.locator("#productDescription").fill("E2E Description");
    await page.locator("#productPrice").fill("9.99");
    await page.locator("#productIsActive").check();
    await page.getByRole("button", { name: /creer/i }).click();

    const createRes = await waitCreate;
    expect(createRes.ok()).toBeTruthy();

    await page.reload();
    await expect(page.locator("tr", { hasText: name })).toBeVisible();
  });

  test("edit product", async ({ page }) => {
    await page.goto("/products");
    const row = page.locator("tr", { hasText: name }).first();
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: "Editer" }).click();
    await page.locator("#editProductName").fill(`${name} Updated`);
    await page.getByRole("button", { name: /enregistrer/i }).click();

    await page.waitForTimeout(500);
    await page.reload();

    const updatedRow = page
      .locator("tr", { hasText: `${name} Updated` })
      .first();
    await expect(updatedRow).toBeVisible();
  });

  test("filter by active", async ({ page }) => {
    await page.goto("/products");
    await page.locator("#productsActiveFilter").selectOption("true");
    await expect(page.locator("tr", { hasText: name })).toBeVisible();
  });

  test("export CSV", async ({ page }) => {
    await page.goto("/products");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /export/i }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/products.*\.csv/i);
  });

  test("delete product", async ({ page }) => {
    await page.goto("/products");
    const row = page.locator("tr", { hasText: `${name} Updated` }).first();
    await expect(row).toBeVisible();

    page.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Supprimer" }).click();

    await expect(
      page.locator("tr", { hasText: `${name} Updated` }),
    ).toHaveCount(0);
  });
});
