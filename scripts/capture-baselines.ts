/**
 * Phase 0 — capture reference screenshots of the LIVE misionessim.org site.
 * These are the ground truth that every later phase's Playwright visual
 * tests diff the Next.js build against (§6.1/§6.2 of the migration plan).
 *
 * Must run logged out — the WP admin bar adds 32-46px to page height when
 * logged in as admin, which would poison every baseline.
 *
 * Re-runnable: `yarn capture:baselines`. Re-run before Phase 7 cutover to
 * catch content published on WP since Phase 0 (content-freeze delta check).
 */
import { chromium, type Browser, type Page } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://misionessim.org";
const OUT_DIR = path.join(process.cwd(), "reference", "baselines");
const INVENTORY_PATH = path.join(process.cwd(), "data", "url-inventory.json");

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

interface InventoryEntry {
  path: string;
  type: string;
  disposition: string;
}

/**
 * Phase 0 captures a representative sample, not all ~455 content routes
 * (full sweep is a Phase 7 exit-criterion, run right before cutover).
 * Always-included: home + every in-scope static page + both section
 * indexes. Sampled: a handful of blog posts and revista items spanning
 * old/new/media-heavy so early-phase diffing has real variety to catch.
 */
async function selectRoutes(): Promise<string[]> {
  const raw = await readFile(INVENTORY_PATH, "utf-8");
  const inventory = JSON.parse(raw) as { entries: InventoryEntry[] };

  const always = inventory.entries
    .filter(
      (e) =>
        e.type === "home" ||
        e.type === "page" ||
        e.type === "blog-index" ||
        e.type === "revista-index",
    )
    .map((e) => e.path);

  // url-inventory.json is sorted by path, not date — sample spread across
  // the array (not just the first N) so we get old/new/mid variety rather
  // than N posts that happen to share an alphabetically-early slug prefix.
  const spread = <T,>(items: T[], count: number): T[] => {
    if (items.length <= count) return items;
    const step = items.length / count;
    return Array.from({ length: count }, (_, i) => items[Math.floor(i * step)]);
  };

  const blogPosts = inventory.entries.filter((e) => e.type === "blog-post");
  const revistaItems = inventory.entries.filter(
    (e) => e.type === "revista-item",
  );

  const blogSample = spread(blogPosts, 5).map((e) => e.path);
  const revistaSample = spread(revistaItems, 3).map((e) => e.path);

  return [...always, ...blogSample, ...revistaSample];
}

async function dismissCookieBanner(page: Page): Promise<void> {
  // Defensive no-op if no banner is present (misionessim.org currently has
  // none, but this guards against it appearing before Phase 7's re-run).
  const selectors = [
    "text=Accept",
    "text=Aceptar",
    '[data-cookieconsent] button',
  ];
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 500 })) await el.click();
    } catch {
      // not present, ignore
    }
  }
}

async function captureRoute(
  browser: Browser,
  route: string,
  viewport: (typeof VIEWPORTS)[number],
): Promise<void> {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();

  const url = `${SITE}${route}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  await dismissCookieBanner(page);
  await page.waitForTimeout(500); // let entrance animations/parallax settle

  const slug = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "__");
  const dir = path.join(OUT_DIR, slug);
  await mkdir(dir, { recursive: true });

  // Above-the-fold
  await page.screenshot({
    path: path.join(dir, `${viewport.name}.above-fold.png`),
  });
  // Full page
  await page.screenshot({
    path: path.join(dir, `${viewport.name}.full-page.png`),
    fullPage: true,
  });

  await context.close();
}

async function main() {
  const routes = await selectRoutes();
  console.log(`Capturing ${routes.length} routes x ${VIEWPORTS.length} viewports...`);

  const browser = await chromium.launch();
  try {
    for (const route of routes) {
      for (const viewport of VIEWPORTS) {
        process.stdout.write(`  ${viewport.name.padEnd(8)} ${route}\n`);
        await captureRoute(browser, route, viewport);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nBaselines written to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
