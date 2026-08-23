import { expect, test } from "@playwright/test";

test("home publishes corrected launch copy and a descriptive title", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await expect(page).toHaveTitle("Misiones transculturales · SIM Latinoamérica");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "¡Sé parte de lo que Dios está haciendo en el mundo!",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Descubre cómo" })).toBeVisible();
});

test("static pages inherit a large default social image", async ({ page }) => {
  await page.goto("http://localhost:3000/nosotros/");

  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://misionessim.org/home/banner-sim-home-2026-1200.webp",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});

const REVISTA_ROUTES = ["/", "/recursos/", "/revistavamos/", "/revistavamos/page/2/"];

for (const route of REVISTA_ROUTES) {
  test(`${route} uses the durable Revista VAMOS edition count`, async ({ page }) => {
    await page.goto(`http://localhost:3000${route}`);

    const publishedCopy = `${await page.locator("body").innerText()} ${await page
      .locator('meta[name="description"]')
      .getAttribute("content")}`;
    expect(publishedCopy).toMatch(/más de 100/i);
    expect(publishedCopy).not.toMatch(/más de 110/i);
  });
}

test("footer does not link to a generic social-network homepage", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  await expect(page.locator('footer a[href="https://x.com/"]')).toHaveCount(0);
});

// Regression: `twitter:*` is never derived from `openGraph`, so before these
// routes declared their own `twitter` block every article and every edition
// advertised the homepage banner as its card image.
const HOMEPAGE_BANNER = "https://misionessim.org/home/banner-sim-home-2026-1200.webp";

const OWN_SOCIAL_IMAGE = [
  { route: "/blog/2025-06/10-cualidades-de-un-discipulador/", label: "an article" },
  { route: "/revistavamos/el-clamor-macedonio/", label: "a magazine edition" },
];

for (const { route, label } of OWN_SOCIAL_IMAGE) {
  test(`${label} uses its own image on both card types`, async ({ page }) => {
    await page.goto(`http://localhost:3000${route}`);

    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    const twitter = await page.locator('meta[name="twitter:image"]').getAttribute("content");

    expect(og).toBeTruthy();
    expect(twitter).toBe(og);
    expect(twitter).not.toBe(HOMEPAGE_BANNER);
  });
}

test("articles publish Article structured data", async ({ page }) => {
  await page.goto("http://localhost:3000/blog/2025-06/10-cualidades-de-un-discipulador/");

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const nodes = blocks.flatMap((block) => JSON.parse(block)["@graph"] as Array<{ "@type": string }>);
  const types = nodes.map((node) => node["@type"]);

  expect(types).toContain("Article");
  expect(types).toContain("BreadcrumbList");
  expect(types).toContain("Organization");
  expect(types).toContain("WebSite");

  const article = nodes.find((node) => node["@type"] === "Article") as Record<string, unknown>;
  expect(article.headline).toBe("10 cualidades de un discipulador según el modelo de Jesús");
  expect(article.datePublished).toBeTruthy();
  expect(article.image).toBeTruthy();

  // We have no author data in the CMS, so the publisher stands in. Claiming a
  // Person here would be fabricated attribution.
  expect(article.author).toEqual(article.publisher);

  // No search endpoint exists, so no SearchAction may be advertised.
  const website = nodes.find((node) => node["@type"] === "WebSite") as Record<string, unknown>;
  expect(website.potentialAction).toBeUndefined();
});
