/**
 * Create (or update) the Contentful webhook that redeploys misionessim.org
 * when content is published.
 *
 * Closes the second half of the publish gap: `check-revista-rewrites.ts` makes
 * a stale deploy fail loudly, but someone still had to *start* a deploy after
 * publishing. This makes Contentful start it.
 *
 * Setup, once:
 *   1. Vercel → Project → Settings → Git → Deploy Hooks. Create one named
 *      "Contentful publish", branch `main`. Copy the URL.
 *      That URL is a credential — anyone holding it can deploy the project.
 *   2. Put it in .env.local (gitignored) as:
 *        VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
 *   3. yarn setup:deploy-webhook
 *
 * Re-runnable: matches an existing webhook by name and updates it in place, so
 * rotating the deploy hook URL is step 2 plus a re-run.
 *
 * Why these topics and not `Entry.*`: `Entry.*` includes `auto_save`, which
 * fires while an editor is typing. Only the events that change what a build
 * would output are listed.
 *
 * Why the environment filter: the space has a `development` environment. Work
 * there must not deploy production. (`main` and `master` hold identical entry
 * counts and are an alias pair, so both are listed.)
 *
 * Note on bulk imports: the import scripts publish dozens of entries at a time.
 * Vercel cancels superseded deployments from the same deploy hook, so a burst
 * mostly collapses into one build — but deploy hooks are capped at 60 triggers
 * per hour per project, and triggers past that are dropped. After a large
 * import, confirm the final state actually deployed.
 */
import path from "node:path";

const WEBHOOK_NAME = "Vercel — deploy misionessim.org on publish";

const TOPICS = [
  "Entry.publish",
  "Entry.unpublish",
  "Entry.delete",
  "Asset.publish",
  "Asset.unpublish",
  "Asset.delete",
];

const PRODUCTION_ENVIRONMENTS = ["master", "main"];

try {
  process.loadEnvFile(path.join(process.cwd(), ".env.local"));
} catch {
  // rely on the ambient environment
}

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const DEPLOY_HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL;

/** Never print the hook URL: the path segments are the credential. */
const redact = (url: string) => {
  try {
    const { origin, pathname } = new URL(url);
    return `${origin}${pathname.replace(/[^/]+$/, "…")}`;
  } catch {
    return "<unparseable URL>";
  }
};

interface WebhookDefinition {
  sys: { id: string };
  name: string;
  url: string;
}

async function cma(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${CMA_TOKEN}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Contentful CMA ${response.status} ${response.statusText}\n${await response.text()}`,
    );
  }
  return response.json();
}

async function main() {
  if (!SPACE_ID || !CMA_TOKEN) {
    throw new Error("CONTENTFUL_SPACE_ID / CONTENTFUL_MANAGEMENT_TOKEN not set");
  }
  if (!DEPLOY_HOOK_URL) {
    throw new Error(
      "VERCEL_DEPLOY_HOOK_URL not set — create a Deploy Hook in Vercel\n" +
        "(Settings → Git → Deploy Hooks, branch `main`) and add the URL to .env.local.",
    );
  }
  if (!DEPLOY_HOOK_URL.startsWith("https://api.vercel.com/v1/integrations/deploy/")) {
    throw new Error(
      `VERCEL_DEPLOY_HOOK_URL does not look like a Vercel deploy hook: ${redact(DEPLOY_HOOK_URL)}`,
    );
  }

  const base = `https://api.contentful.com/spaces/${SPACE_ID}/webhook_definitions`;

  const body = {
    name: WEBHOOK_NAME,
    url: DEPLOY_HOOK_URL,
    topics: TOPICS,
    filters: [
      { in: [{ doc: "sys.environment.sys.id" }, PRODUCTION_ENVIRONMENTS] },
    ],
    // Vercel ignores the request body; send a small well-formed one rather
    // than Contentful's full entity payload.
    transformation: {
      method: "POST",
      contentType: "application/json; charset=utf-8",
      body: { source: "contentful" },
    },
    active: true,
  };

  const existing = (await cma(base)) as { items: WebhookDefinition[] };
  const match = existing.items.find((w) => w.name === WEBHOOK_NAME);

  if (match) {
    await cma(`${base}/${match.sys.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    console.log(`Updated webhook "${WEBHOOK_NAME}"`);
  } else {
    await cma(base, { method: "POST", body: JSON.stringify(body) });
    console.log(`Created webhook "${WEBHOOK_NAME}"`);
  }

  console.log(`  target:       ${redact(DEPLOY_HOOK_URL)}`);
  console.log(`  topics:       ${TOPICS.join(", ")}`);
  console.log(`  environments: ${PRODUCTION_ENVIRONMENTS.join(", ")}`);
  console.log(
    "\nVerify: publish any entry, then check Contentful → Settings → Webhooks" +
      "\nfor a 2xx call, and the Vercel dashboard for a deployment marked as" +
      "\ntriggered by a Deploy Hook.",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
