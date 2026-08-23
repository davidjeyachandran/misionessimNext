import { expect, test } from "@playwright/test";

/**
 * The Revista/Manual block replaces live's ElementsKit tabs widget, whose tabs
 * are anchor links. These assertions pin the two behaviours that swap bought us:
 * keyboard operability, and no history entry per tab activation.
 */
test.describe("Recursos resource tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/recursos/");
  });

  test("shows the Revista panel first and switches on click", async ({ page }) => {
    const revistaTab = page.getByRole("tab", { name: /Revista VAMOS/ });
    const manualTab = page.getByRole("tab", { name: /Manual VAMOS/ });

    await expect(revistaTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("más de 100 ediciones");

    await manualTab.click();
    await expect(manualTab).toHaveAttribute("aria-selected", "true");
    await expect(revistaTab).toHaveAttribute("aria-selected", "false");
    await expect(page.getByRole("tabpanel")).toContainText("En este manual encontrarás");
  });

  test("moves between tabs with the arrow keys and leaves history alone", async ({ page }) => {
    const urlBefore = page.url();
    const manualTab = page.getByRole("tab", { name: /Manual VAMOS/ });

    await page.getByRole("tab", { name: /Revista VAMOS/ }).focus();
    await page.keyboard.press("ArrowDown");

    await expect(manualTab).toBeFocused();
    await expect(manualTab).toHaveAttribute("aria-selected", "true");
    expect(page.url()).toBe(urlBefore);
  });

  test("keeps the panel CTAs pointing at the live destinations", async ({ page }) => {
    const revistaCta = page.getByRole("tabpanel").getByRole("link", { name: "Descarga aquí" });
    await expect(revistaCta).toHaveAttribute("href", "/revistavamos/");
    // Internal link: same tab, unlike live's target="_blank".
    await expect(revistaCta).not.toHaveAttribute("target", "_blank");

    await page.getByRole("tab", { name: /Manual VAMOS/ }).click();
    const manualCta = page.getByRole("tabpanel").getByRole("link", { name: "Recursos aquí" });
    await expect(manualCta).toHaveAttribute("href", "https://movilicemos.org/curso-vamos/intro");
    await expect(manualCta).toHaveAttribute("target", "_blank");
  });
});
