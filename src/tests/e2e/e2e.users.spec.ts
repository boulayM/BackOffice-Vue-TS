import { test, expect } from "@playwright/test";
import { searchByEmail } from "./helpers";

test.describe.serial("users critical", () => {
  const ts = Date.now();
  const email = `e2e_user_${ts}@example.com`;

  test("create user", async ({ page }) => {
    await page.goto("/users");
    await expect(
      page.getByRole("heading", { name: "Utilisateurs" }),
    ).toBeVisible();

    const waitCreate = page.waitForResponse(
      (res) =>
        res.url().includes("/api/users/register") &&
        res.request().method() === "POST",
    );

    await page.locator("#userFirstName").fill("E2E");
    await page.locator("#userLastName").fill("User");
    await page.locator("#userEmail").fill(email);
    await page.locator("#userPassword").fill("Password123!");
    await page.locator("#userRole").selectOption("USER");
    await page.getByRole("button", { name: /creer/i }).click();

    const createRes = await waitCreate;
    expect(createRes.ok()).toBeTruthy();

    await searchByEmail(page, email);
    const row = page.locator("tr", { hasText: email }).first();
    await expect(row).toBeVisible();
  });

  test("edit user name", async ({ page }) => {
    await page.goto("/users");
    await searchByEmail(page, email);

    const row = page.locator("tr", { hasText: email }).first();
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: "Editer" }).click();
    await page.locator("#editUserFirstName").fill("E2E-Edited");
    await page.locator("#editUserLastName").fill("User-Edited");
    await page.getByRole("button", { name: /enregistrer/i }).click();

    await page.waitForTimeout(500);
    await page.reload();

    await searchByEmail(page, email);
    const updatedRow = page.locator("tr", { hasText: email }).first();
    await expect(updatedRow).toContainText("E2E-Edited");
    await expect(updatedRow).toContainText("User-Edited");
  });

  test("filter by role", async ({ page }) => {
    await page.goto("/users");
    await searchByEmail(page, email);
    await page.locator("#usersRoleFilter").selectOption("USER");
    await expect(page.locator("tr", { hasText: email }).first()).toBeVisible();
  });

  test("export CSV", async ({ page }) => {
    await page.goto("/users");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /export/i }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/users.*\.csv/i);
  });

  test("delete user", async ({ page }) => {
    await page.goto("/users");
    await searchByEmail(page, email);

    const row = page.locator("tr", { hasText: email }).first();
    await expect(row).toBeVisible();

    page.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Supprimer" }).click();

    await expect(page.locator("tr", { hasText: email })).toHaveCount(0);
  });
});
