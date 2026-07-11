import { expect, test } from "@playwright/test";

for (const viewport of [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 375, height: 812 },
]) {
  test(`Revista covers fit without cropping at ${viewport.name} width`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("http://localhost:3000/revistavamos/");

    const covers = page.locator("main > div img");
    await expect(covers.first()).toBeVisible();
    expect(await covers.count()).toBeGreaterThan(1);
    await expect
      .poll(() => covers.first().evaluate((image) => image.complete && image.naturalWidth > 0))
      .toBe(true);

    const coverStyles = await covers.evaluateAll((images) =>
      images.map((image) => getComputedStyle(image).objectFit),
    );

    expect(coverStyles.every((objectFit) => objectFit === "contain")).toBe(true);

    if (viewport.name === "desktop") {
      const firstCard = page.locator("main article").first();
      const firstCardImage = firstCard.locator("img");

      await firstCard.hover();
      await expect
        .poll(() => firstCardImage.evaluate((image) => getComputedStyle(image).scale))
        .toBe("1.05");
    }
  });
}
