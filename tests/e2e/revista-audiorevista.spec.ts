import { expect, test } from "@playwright/test";

/**
 * The Audiorevista band closes the Revista VAMOS index on every paginated
 * page. Live builds it as three hand-pasted Elementor HTML widgets wrapped in
 * fade-in animations that start at `visibility: hidden`, so the whole band
 * stays blank when that script doesn't run, and none of the players carry a
 * title. These assertions pin the cleaned-up version.
 */
test.describe("Audiorevista VAMOS", () => {
  test("renders three lazy, titled episode embeds", async ({ page }) => {
    await page.goto("http://localhost:3000/revistavamos/");

    const band = page.locator("section").filter({ hasText: "Audiorevista VAMOS" });
    await expect(band.getByRole("heading", { name: "Audiorevista VAMOS" })).toBeVisible();
    await expect(
      band.getByText("Ahora también puedes escuchar toda la Revista VAMOS desde cualquier lugar"),
    ).toBeVisible();

    const frames = band.locator('iframe[src*="open.spotify.com/embed/episode/"]');
    await expect(frames).toHaveCount(3);

    for (const frame of await frames.all()) {
      await expect(frame).toHaveAttribute("loading", "lazy");
      await expect(frame).toHaveAttribute("title", /^Reproductor de Spotify: .+/);
      // Live tacks `?utm_source=generator` onto every embed; nothing reads it.
      await expect(frame).not.toHaveAttribute("src", /\?/);
    }
  });

  test("closes the paginated pages too", async ({ page }) => {
    await page.goto("http://localhost:3000/revistavamos/page/2/");
    await expect(page.getByRole("heading", { name: "Audiorevista VAMOS" })).toBeVisible();
  });

  test("lays the players out one, two then three across", async ({ page }) => {
    await page.goto("http://localhost:3000/revistavamos/");
    const band = page.locator("section").filter({ hasText: "Audiorevista VAMOS" });
    const frames = band.locator('iframe[src*="open.spotify.com/embed/episode/"]');

    async function columns() {
      const xs = await frames.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().x)),
      );
      return new Set(xs).size;
    }

    await page.setViewportSize({ width: 375, height: 812 });
    expect(await columns()).toBe(1);

    await page.setViewportSize({ width: 768, height: 1024 });
    expect(await columns()).toBe(2);

    await page.setViewportSize({ width: 1440, height: 900 });
    expect(await columns()).toBe(3);
  });

  test("stays visible with JavaScript disabled", async ({ browser }) => {
    // Live's band is invisible without its animation script.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("http://localhost:3000/revistavamos/");
    await expect(page.getByRole("heading", { name: "Audiorevista VAMOS" })).toBeVisible();
    await context.close();
  });
});
