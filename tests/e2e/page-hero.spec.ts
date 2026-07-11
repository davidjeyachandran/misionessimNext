import { expect, test } from "@playwright/test";

const HERO_ROUTES = [
  "/blog/",
  "/nosotros/",
  "/ora/",
  "/recursos/",
  "/revistavamos/",
  "/sirve-con-sim/",
];

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 375, height: 812 },
];

for (const viewport of VIEWPORTS) {
  for (const route of HERO_ROUTES) {
    test(`${route} uses only its baked-in gradient at ${viewport.name} width`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(`http://localhost:3000${route}`);

      const hero = page.locator("main > section").first();
      const image = hero.locator("img");

      await expect(hero).toBeVisible();
      await expect(image).toBeVisible();
      await expect
        .poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0))
        .toBe(true);

      const cssGradients = await hero.locator("*").evaluateAll((elements) =>
        elements
          .map((element) => getComputedStyle(element).backgroundImage)
          .filter((backgroundImage) => backgroundImage.includes("gradient")),
      );

      expect(cssGradients).toEqual([]);
    });
  }
}
