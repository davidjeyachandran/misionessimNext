/**
 * One-time migration: enable table-related rich text node types on the
 * blogPost.body field in the given Contentful environment.
 *
 * The blogPost content type has an enabledNodeTypes validator on `body` that
 * did not include table nodes. Trying to publish an entry whose body contains
 * a `table` node produces a 422 InvalidEntry error:
 *   "Only heading 1, ... are allowed"
 *
 * Run:
 *   yarn tsx scripts/enable-table-nodes.ts --environment=main
 */
import { createClient } from "contentful-management";
import { fileURLToPath } from "node:url";

const TABLE_NODE_TYPES = [
  "table",
  "table-row",
  "table-header-cell",
  "table-cell",
];

async function main() {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    throw new Error(
      "CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env.local",
    );
  }

  const args = process.argv.slice(2);
  const envArg = args.find((a) => a.startsWith("--environment="));
  const environmentId = envArg?.split("=")[1];
  if (!environmentId) {
    throw new Error("--environment=<id> is required");
  }

  const client = createClient({ accessToken: managementToken });
  const ctParams = { spaceId, environmentId, contentTypeId: "blogPost" };

  console.log(`Fetching blogPost content type from environment "${environmentId}"...`);
  const ct = await client.contentType.get(ctParams);

  const bodyField = ct.fields.find((f) => f.id === "body");
  if (!bodyField) throw new Error("body field not found on blogPost content type");

  const nodeTypesValidation = (bodyField.validations ?? []).find(
    (v) => (v as Record<string, unknown>).enabledNodeTypes,
  ) as { enabledNodeTypes: string[] } | undefined;

  if (!nodeTypesValidation) {
    throw new Error(
      "enabledNodeTypes validation not found on body field — check the content type in Contentful UI",
    );
  }

  const existing = nodeTypesValidation.enabledNodeTypes;
  const toAdd = TABLE_NODE_TYPES.filter((t) => !existing.includes(t));

  if (toAdd.length === 0) {
    console.log("Table node types already enabled — nothing to do.");
    return;
  }

  nodeTypesValidation.enabledNodeTypes = [...existing, ...toAdd];
  console.log("Adding node types:", toAdd);

  const updated = await client.contentType.update(ctParams, ct);
  await client.contentType.publish(ctParams, updated);
  console.log("Done. blogPost.body now accepts table nodes.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
