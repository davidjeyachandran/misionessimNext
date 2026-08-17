import { expect, test } from "@playwright/test";

/**
 * The podcast band renders six Spotify episode embeds. Live builds them as six
 * hand-pasted Elementor HTML widgets, which is how they drifted apart: two carry
 * a `theme=0` the other four don't, none carry a title, and the CTA still has a
 * share-tracking `?si=` on it. These assertions pin the cleaned-up versions.
 */
test.describe("Recursos podcast", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/recursos/");
  });

  test("renders six lazy, titled episode embeds with a consistent theme", async ({ page }) => {
    const frames = page.locator('iframe[src*="open.spotify.com/embed/episode/"]');
    await expect(frames).toHaveCount(6);

    for (const frame of await frames.all()) {
      await expect(frame).toHaveAttribute("loading", "lazy");
      await expect(frame).toHaveAttribute("title", /^Reproductor de Spotify: .+/);
      // Live sets theme=0 on two of the six, flattening them while the rest
      // tint from the cover art.
      await expect(frame).not.toHaveAttribute("src", /theme=/);
    }
  });

  test("links to the show without the share-tracking parameter", async ({ page }) => {
    const cta = page.getByRole("link", { name: "Escucha más en Spotify" });
    await expect(cta).toHaveAttribute(
      "href",
      "https://open.spotify.com/show/0vftsfjR9UP5tD2PG6jb5P",
    );
    await expect(cta).toHaveAttribute("target", "_blank");
  });

  test("lays the episodes out one, two then three across", async ({ page }) => {
    const frames = page.locator('iframe[src*="open.spotify.com/embed/episode/"]');

    async function columns() {
      const xs = await frames.evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().x)),
      );
      return new Set(xs).size;
    }

    await page.setViewportSize({ width: 375, height: 812 });
    expect(await columns()).toBe(1);

    // Live keeps three across here, squeezing each player to 189px.
    await page.setViewportSize({ width: 768, height: 1024 });
    expect(await columns()).toBe(2);

    await page.setViewportSize({ width: 1440, height: 900 });
    expect(await columns()).toBe(3);
  });
});
