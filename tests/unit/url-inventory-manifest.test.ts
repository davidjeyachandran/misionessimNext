import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

/**
 * Asserts the committed data/url-inventory.json matches expected counts.
 * Regenerate with `yarn build:url-inventory` before running this if the
 * live site has changed. Skips (does not fail) if the file hasn't been
 * generated yet, so a fresh checkout doesn't fail CI before Phase 0 runs.
 */
const INVENTORY_PATH = path.join(process.cwd(), "data", "url-inventory.json");

const hasInventory = existsSync(INVENTORY_PATH);
const describeIfPresent = hasInventory ? describe : describe.skip;

describeIfPresent("url-inventory.json manifest", () => {
  const inventory = JSON.parse(readFileSync(INVENTORY_PATH, "utf-8"));

  it("has zero missing entries for blog posts and revista items", () => {
    expect(inventory.countsByType["blog-post"]).toBe(335);
    expect(inventory.countsByType["revista-item"]).toBe(118);
  });

  it("has the 8 in-scope static pages (7 pages + home)", () => {
    expect(inventory.countsByType["page"]).toBe(7);
    expect(inventory.countsByType["home"]).toBe(1);
  });

  it("has one revistavamos alias per revista item", () => {
    expect(inventory.countsByType["revistavamos-alias"]).toBe(
      inventory.countsByType["revista-item"],
    );
  });

  it("drops all 11 donation-related pages (8 GiveWP forms + 3 utility pages)", () => {
    expect(inventory.countsByType["donation-page"]).toBe(11);
  });

  it("has taxonomy archive counts matching the live site (36 categories, 28 tags, 6 portfolio categories, 2 authors)", () => {
    expect(inventory.countsByType["category-archive"]).toBe(36);
    expect(inventory.countsByType["tag-archive"]).toBe(28);
    expect(inventory.countsByType["portfolio-category-archive"]).toBe(6);
    expect(inventory.countsByType["author-archive"]).toBe(2);
  });

  it("every entry has a non-empty path and a valid disposition", () => {
    const validDispositions = new Set([
      "rebuild-as-code",
      "migrate-to-contentful-blog",
      "migrate-to-contentful-revista",
      "generated-archive",
      "dropped-donations",
      "alias-redirect",
    ]);
    for (const entry of inventory.entries) {
      expect(entry.path.length).toBeGreaterThan(0);
      expect(validDispositions.has(entry.disposition)).toBe(true);
    }
  });
});
