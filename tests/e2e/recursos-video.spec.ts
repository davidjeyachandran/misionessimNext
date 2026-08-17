import { expect, test } from "@playwright/test";

/**
 * The Talleres block replaces live's ElementsKit video widget, whose trigger is
 * an `<a href="https://www.youtube.com/embed/…">` labelled "video-popup". These
 * assertions pin what that swap bought us: a named button instead of a bare
 * embed link, and an iframe that only exists while the lightbox is open.
 */
test.describe("Recursos video lightbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/recursos/");
  });

  test("does not load the YouTube iframe until the video is opened", async ({ page }) => {
    await expect(page.locator(".lightbox-video iframe")).toHaveCount(0);

    await page.getByRole("button", { name: /Reproducir video/ }).click();

    const frame = page.locator(".lightbox-video iframe");
    await expect(frame).toHaveAttribute("src", /youtube\.com\/embed\/tZwOQbkjf5Q/);
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("closes on Escape and releases the body scroll lock", async ({ page }) => {
    await page.getByRole("button", { name: /Reproducir video/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".lightbox-video iframe")).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("keeps the channel CTA pointing at the live destination", async ({ page }) => {
    const cta = page.getByRole("link", { name: "Mira más videos aquí" });
    await expect(cta).toHaveAttribute("href", "https://www.youtube.com/c/SIMLatinoamérica");
    await expect(cta).toHaveAttribute("target", "_blank");
  });
});
