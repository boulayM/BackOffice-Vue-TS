export async function searchByEmail(page, email) {
  await page.locator("#usersSearch").fill(email);
  await page.keyboard.press("Enter");
}
