import { expect, test } from "@playwright/test";

const HERO_ROUTES = [
  { route: "/", selector: ".hero .parallax-bg img" },
  { route: "/nosotros/", selector: ".hero-page .parallax-bg img" },
];

for (const { route, selector } of HERO_ROUTES) {
  test(`${route} prioritizes its LCP hero image`, async ({ page }) => {
    await page.goto(`http://localhost:3000${route}`);

    const heroImage = page.locator(selector);
    await expect(heroImage).toHaveCount(1);
    await expect(heroImage).toHaveAttribute("fetchpriority", "high");
    await expect(heroImage).not.toHaveAttribute("loading", "lazy");
  });
}
