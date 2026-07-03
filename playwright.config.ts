import { defineConfig, devices } from "@playwright/test";

/**
 * Three viewport sizes used throughout the migration for both baseline
 * capture (against the live site) and visual regression (against the
 * Next.js build). See docs/nextjs-migration-analysis.md §6.
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 812 }, // iPhone SE-class
  tablet: { width: 768, height: 1024 }, // iPad-class
  desktop: { width: 1440, height: 900 }, // standard laptop
} as const;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02, // start loose; tighten per-route as parity improves
      animations: "disabled",
    },
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["line"], ["html", { open: "never" }]],
  snapshotPathTemplate: "reference/baselines/{arg}{ext}",

  projects: [
    // Functional e2e — no visual assertions, runs against the local dev server.
    {
      name: "e2e",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Chrome"] },
    },

    // Visual regression — compares the Next.js build against Phase 0
    // baselines at all 3 viewports. Runs in CI on every PR.
    {
      name: "visual-mobile",
      testDir: "./tests/visual",
      use: { ...devices["Desktop Chrome"], viewport: VIEWPORTS.mobile },
    },
    {
      name: "visual-tablet",
      testDir: "./tests/visual",
      use: { ...devices["Desktop Chrome"], viewport: VIEWPORTS.tablet },
    },
    {
      name: "visual-desktop",
      testDir: "./tests/visual",
      use: { ...devices["Desktop Chrome"], viewport: VIEWPORTS.desktop },
    },
  ],

  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
