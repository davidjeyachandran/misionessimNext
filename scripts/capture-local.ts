/**
 * Gap-analysis companion to capture-baselines.ts — captures the SAME routes
 * from the local Next.js dev server (localhost:3000) with the SAME directory
 * and file naming, so each shot pairs 1:1 with its live-site baseline:
 *
 *   reference/baselines/<slug>/desktop.full-page.png   (live, ground truth)
 *   reference/local/<slug>/desktop.full-page.png       (ours)
 *
 * Legacy live URLs are mapped to their new local routes (e.g.
 * /la-revista/<slug>/ → /revistavamos/<slug>/) but keep the baseline's
 * directory name so the pairing holds.
 *
 * Re-runnable: `yarn capture:local`.
 */
import { chromium, type Browser } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SITE = process.env.LOCAL_SITE ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "reference", "local");

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

/**
 * Baseline dir name → local route. Mirrors the slug scheme in
 * capture-baselines.ts (`/` → `home`, path separators → `__`).
 * terms-and-conditions is deliberately absent (not rebuilt — see PROGRESS.md).
 */
const ROUTES: Record<string, string> = {
  home: "/",
  blog: "/blog/",
  "blog__2017-07__de-la-selva-su-gente": "/blog/2017-07/de-la-selva-su-gente/",
  "blog__2020-01__no-hay-limitaciones-para-las-solteras":
    "/blog/2020-01/no-hay-limitaciones-para-las-solteras/",
  "blog__2020-09__emanando-la-fragancia-dulce-de-cristo":
    "/blog/2020-09/emanando-la-fragancia-dulce-de-cristo/",
  "blog__2021-10__entendiendo-el-por-que-detras-de-las-preguntas":
    "/blog/2021-10/entendiendo-el-por-que-detras-de-las-preguntas/",
  "blog__2024-05__me-anima-a-seguir-practicando":
    "/blog/2024-05/me-anima-a-seguir-practicando/",
  "declaracion-de-fe-de-sim": "/declaracion-de-fe-de-sim/",
  // Live /la-revista/ (index + editions) now lives at /revistavamos/ locally.
  "la-revista": "/revistavamos/",
  "la-revista__africa": "/revistavamos/africa/",
  "la-revista__evangelismo-creativo": "/revistavamos/evangelismo-creativo/",
  "la-revista__misiones-de-corto-plazo":
    "/revistavamos/misiones-de-corto-plazo/",
  "la-revista__lucha-espiritual": "/revistavamos/lucha-espiritual/",
  nosotros: "/nosotros/",
  ora: "/ora/",
  recursos: "/recursos/",
  revistavamos: "/revistavamos/",
  "sirve-con-sim": "/sirve-con-sim/",
};

async function captureRoute(
  browser: Browser,
  slug: string,
  route: string,
  viewport: (typeof VIEWPORTS)[number],
): Promise<void> {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();

  await page.goto(`${SITE}${route}`, {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  await page.waitForTimeout(500); // let entrance animations/parallax settle

  const dir = path.join(OUT_DIR, slug);
  await mkdir(dir, { recursive: true });

  await page.screenshot({
    path: path.join(dir, `${viewport.name}.above-fold.png`),
  });
  await page.screenshot({
    path: path.join(dir, `${viewport.name}.full-page.png`),
    fullPage: true,
  });

  await context.close();
}

async function main() {
  const entries = Object.entries(ROUTES);
  console.log(
    `Capturing ${entries.length} routes x ${VIEWPORTS.length} viewports from ${SITE}...`,
  );

  const browser = await chromium.launch();
  const failures: string[] = [];
  try {
    for (const [slug, route] of entries) {
      for (const viewport of VIEWPORTS) {
        process.stdout.write(`  ${viewport.name.padEnd(8)} ${route}\n`);
        try {
          await captureRoute(browser, slug, route, viewport);
        } catch (err) {
          failures.push(`${viewport.name} ${route}: ${String(err)}`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} capture(s) failed:`);
    for (const f of failures) console.error(`  ${f}`);
  }
  console.log(`\nLocal screenshots written to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
