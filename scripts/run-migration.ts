/**
 * Runs a Contentful content-type migration (cms/migrations/*.ts) against a
 * given environment, using the official contentful-migration package's JS
 * API directly (not the `contentful` CLI binary, whose separate login flow
 * caused a credential exposure earlier this session — see
 * docs/PROGRESS.md).
 *
 * Usage: `yarn migrate:cms -- --file=cms/migrations/001-....ts --environment=<id>`
 *
 * Same safety rails as scripts/import-cms.ts: requires an explicit
 * --environment (no default), refuses "master"/"main" (alias for the same
 * production data, shared with mi-movilicemos) without --force.
 */
import { runMigration } from "contentful-migration";
import path from "node:path";

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const fileArg = args.find((a) => a.startsWith("--file="));
  const envArg = args.find((a) => a.startsWith("--environment="));
  const filePath = fileArg?.split("=")[1];
  const environmentId = envArg?.split("=")[1];

  if (!filePath) throw new Error("--file=<path to migration file> is required.");
  if (!environmentId) throw new Error("--environment=<id> is required (no default).");

  const PRODUCTION_ENVIRONMENT_IDS = ["master", "main"];
  if (PRODUCTION_ENVIRONMENT_IDS.includes(environmentId) && !force) {
    throw new Error(
      `Refusing to run a migration against "${environmentId}" — production environment (shared space, also used by mi-movilicemos; "master" is an alias for "main", same data). Use a sandbox environment first, or pass --force if you really mean it.`,
    );
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !accessToken) {
    throw new Error("CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env.local.");
  }

  console.log(`Running migration ${filePath} against environment "${environmentId}"...`);
  await runMigration({
    filePath: path.resolve(process.cwd(), filePath),
    spaceId,
    environmentId,
    accessToken,
    yes: true, // non-interactive — this script IS the review step
  });
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
