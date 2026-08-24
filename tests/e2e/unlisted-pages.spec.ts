import { expect, test } from "@playwright/test";

// /rebuild-vs-wordpress/ is an internal review page: reachable by direct link,
// but never indexed and never linked. Three things keep it that way and each
// can be undone by accident, so each is asserted here. (Its absence from the
// sitemap is guaranteed by app/sitemap.ts's hand-written static list.)
const UNLISTED = "/rebuild-vs-wordpress/";

test("the unlisted review page tells crawlers not to index it", async ({ page }) => {
  await page.goto(`http://localhost:3000${UNLISTED}`);

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("the unlisted review page still renders for anyone with the link", async ({ page }) => {
  await page.goto(`http://localhost:3000${UNLISTED}`);

  await expect(
    page.getByRole("heading", { level: 1, name: "Qué ganamos con el sitio nuevo" }),
  ).toBeVisible();
  // Written in Spanish, so it inherits the document's `es` and must not
  // override it with a lang of its own.
  await expect(page.locator("main")).not.toHaveAttribute("lang", /./);
});

const PUBLIC_ROUTES = ["/", "/blog/", "/revistavamos/", "/recursos/", "/nosotros/"];

for (const route of PUBLIC_ROUTES) {
  test(`${route} does not link to the unlisted review page`, async ({ page }) => {
    await page.goto(`http://localhost:3000${route}`);

    await expect(page.locator(`a[href^="${UNLISTED}"], a[href*="${UNLISTED}"]`)).toHaveCount(0);
  });
}

test("robots.txt does not disallow the unlisted page", async ({ request }) => {
  // Blocking the crawl would stop crawlers reading the noindex tag — the
  // opposite of what an unlisted page wants.
  const body = await (await request.get("http://localhost:3000/robots.txt")).text();

  expect(body).not.toContain("rebuild-vs-wordpress");
});
