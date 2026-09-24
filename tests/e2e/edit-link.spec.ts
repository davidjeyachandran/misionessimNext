import { expect, test } from "@playwright/test";

// `?edit` reveals an "Edit in Contentful" link on pages backed by an entry,
// remembered per browser until `?edit=off` (docs/adr/0002).
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const EDIT_LINK = { name: "Editar en Contentful" };

test("the edit link is hidden from visitors", async ({ page }) => {
  await page.goto(`${BASE}/blog/`);
  await page.locator('main a[href^="/blog/20"]').first().click();
  await expect(page.locator("[data-contentful-entry]")).toBeAttached();
  await expect(page.getByRole("link", EDIT_LINK)).toHaveCount(0);
});

test("?edit links a post to its Contentful entry and is remembered", async ({ page }) => {
  await page.goto(`${BASE}/blog/?edit`);
  // A listing has no single entry to edit.
  await expect(page.getByRole("link", EDIT_LINK)).toHaveCount(0);

  await page.locator('main a[href^="/blog/20"]').first().click();
  const entryId = await page.locator("[data-contentful-entry]").getAttribute("data-contentful-entry");
  await expect(page.getByRole("link", EDIT_LINK)).toHaveAttribute(
    "href",
    new RegExp(`^https://app\\.contentful\\.com/spaces/[^/]+/entries/${entryId}$`),
  );

  await page.goto(`${BASE}/`);
  await expect(page.getByRole("link", EDIT_LINK)).toHaveCount(0);

  await page.goto(`${BASE}/revistavamos/?edit=off`);
  await page.locator('main a[href^="/revistavamos/"]').first().click();
  await expect(page.locator("[data-contentful-entry]")).toBeAttached();
  await expect(page.getByRole("link", EDIT_LINK)).toHaveCount(0);
});
