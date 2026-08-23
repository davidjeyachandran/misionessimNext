import { expect, test } from "@playwright/test";

// 50 of the 119 editions carry an empty `description` on their cover asset,
// so the cover link used to fall back to alt="" and announce as nothing.
// This edition is one of them — picked deliberately, so the test fails again
// if the link ever goes back to borrowing its name from the image.
const EDITION_WITH_BLANK_COVER_DESCRIPTION = "/revistavamos/el-clamor-macedonio/";

test("the cover link names the download, not the artwork", async ({ page }) => {
  await page.goto(`http://localhost:3000${EDITION_WITH_BLANK_COVER_DESCRIPTION}`);

  const title = (await page.getByRole("heading", { level: 1 }).innerText()).trim();
  const coverLink = page.locator("main a[href$='.pdf']").filter({ has: page.locator("img") });

  await expect(coverLink).toHaveAccessibleName(`Descargar PDF: ${title}`);
  await expect(coverLink).toHaveAttribute("href", /\.pdf$/);
});

test("the cover image always has alt text", async ({ page }) => {
  await page.goto(`http://localhost:3000${EDITION_WITH_BLANK_COVER_DESCRIPTION}`);

  const cover = page.locator("main header img").first();
  const alt = await cover.getAttribute("alt");
  expect(alt?.trim()).toBeTruthy();
});
