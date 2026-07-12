/**
 * Import the 9 revista editions missing from Contentful.
 *
 * Dry-run by default — prints what would be created without touching anything.
 * Use --live --environment=master to execute (requires CONTENTFUL_MANAGEMENT_TOKEN).
 *
 * Run with Node 20 (default shell is Node 16 — run `nvm use 20` first):
 *   yarn import:revistas                              # dry run
 *   yarn import:revistas --live --environment=master  # live — only with David's sign-off
 *
 * Safe to re-run after a partial failure: each edition is skipped if its slug
 * already exists (checks both "slug" and "/slug" forms).
 */

interface Edition {
  slug: string;
  title: string;
  fecha: string;
  pdfUrl: string;
  coverUrl: string;
  /**
   * Intro paragraph shown below the title on the live site, stored in the
   * `body` RichText field. Omitted for the 3 editions that have no intro on
   * the original (la-gente-que-no-vemos, latinos-en-adaptacion,
   * cuidado-integral-biblico-y-solidario) — confirmed 2026-07-12.
   */
  description?: string;
}

// Source of truth: verified 2026-07-12 against reference/mirror/la-revista/*/index.html
// Ordered oldest-first so logs are easy to follow on partial failure.
const EDITIONS: Edition[] = [
  {
    slug: "conferencias-misioneras",
    title: "Conferencias misioneras",
    fecha: "2024-06-01T00:00:00Z",
    pdfUrl: "https://misionessim.org/wp-content/uploads/2024/11/conferenciamisioneravamosjun24.pdf",
    coverUrl: "https://misionessim.org/wp-content/uploads/2024/11/conferenciamisioneravamosjun24.jpg",
    description:
      "Su amor nos impulsa: Las conferencias misioneras llevan a la transformación de los corazones de los asistentes, especialmente cuando hay un buen seguimiento.",
  },
  {
    slug: "la-gente-que-no-vemos",
    title: "La gente que no vemos",
    fecha: "2024-09-01T00:00:00Z",
    pdfUrl: "https://misionessim.org/wp-content/uploads/2025/04/GenteQueNoVemosVAMOSsept24.pdf",
    coverUrl: "https://misionessim.org/wp-content/uploads/2025/04/GenteQueNoVemosVAMOSsept24-1.jpg",
  },
  {
    slug: "latinos-en-adaptacion",
    title: "Latinos en adaptación, sus retos y resilencia",
    fecha: "2024-12-01T00:00:00Z",
    pdfUrl: "https://misionessim.org/wp-content/uploads/2025/04/AdaptacionVAMOSdic24.pdf",
    coverUrl: "https://misionessim.org/wp-content/uploads/2025/04/AdaptacionVAMOSdic24.jpg",
  },
  {
    slug: "cuidado-integral-biblico-y-solidario",
    title: "Cuidado Integral bíblico y solidario",
    fecha: "2025-03-01T00:00:00Z",
    pdfUrl: "https://misionessim.org/wp-content/uploads/2025/04/CuidadoIntegralMarzo25.pdf",
    coverUrl: "https://misionessim.org/wp-content/uploads/2025/04/CuidadoIntegralMarzo25.jpg",
  },
  {
    slug: "discipulos-que-hacen-discipulos",
    title: "Discípulos que hacen discípulos",
    fecha: "2025-06-01T00:00:00Z",
    pdfUrl: "https://misionessim.org/wp-content/uploads/2025/05/DiscipuladoVAMOSjunio25.pdf",
    coverUrl: "https://misionessim.org/wp-content/uploads/2025/05/DiscipuladoVAMOS25portada-Medium.jpg",
    description:
      "El discipulado es la herramienta más poderosa de la iglesia en llevar a cabo la Misión de Dios.",
  },
  {
    slug: "caracter-misionero",
    title: "Carácter misionero",
    fecha: "2025-09-01T00:00:00Z",
    pdfUrl: "https://misionessim.org/wp-content/uploads/2025/08/CaracterVAMOSseptiembre25.pdf",
    coverUrl: "https://misionessim.org/wp-content/uploads/2025/08/CaracterVAMOS25portada-Medium.jpg",
    description:
      "Nuestra oración es que Dios nos guíe hacia candidatos y obreros que, más allá de tener buenas cualidades, reflejen a Cristo.",
  },
  {
    slug: "envio-responsable-2",
    title: "Envío responsable",
    fecha: "2025-12-01T00:00:00Z",
    pdfUrl: "https://misionessim.org/wp-content/uploads/2025/11/SIMLaEnvio25.pdf",
    coverUrl: "https://misionessim.org/wp-content/uploads/2025/11/EnvioVAMOS25portada-Medium.jpg",
    description:
      "El envío no es solo logístico: es espiritual, comunitario y celestial. Es un momento sagrado, un acto profético, una declaración de fe y obediencia.",
  },
  {
    slug: "lucha-espiritual",
    title: "Lucha espiritual",
    fecha: "2026-03-01T00:00:00Z",
    pdfUrl: "https://misionessim.org/wp-content/uploads/2026/02/LuchaEspiritualVamosMarzo26-4.pdf",
    coverUrl: "https://misionessim.org/wp-content/uploads/2026/02/LuchaEspiritualportada-Medium.jpg",
    description:
      "Todo creyente es parte de esta batalla espiritual, así como todo creyente es parte de la Misión de Dios.",
  },
  {
    slug: "el-clamor-macedonio",
    title: "El clamor macedonio",
    fecha: "2026-06-01T00:00:00Z",
    pdfUrl: "https://misionessim.org/wp-content/uploads/2026/05/LlamadoMacedonioJun26.pdf",
    coverUrl: "https://misionessim.org/wp-content/uploads/2026/05/llamadoMacedonioPortada26-Medium.jpg",
    description:
      "Con una obediencia sencilla, Pablo cambió de rumbo, se levantó y marchó hacia Macedonia. “Ven y ayúdanos”. No es solo un relato del pasado; es una invitación viva, urgente, dirigida hoy a la Iglesia.",
  },
];

// Wrap a plain string as a single-paragraph Contentful RichText document,
// matching the `body` field's shape.
function toRichTextDocument(text: string) {
  return {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "paragraph",
        data: {},
        content: [{ nodeType: "text", value: text, marks: [], data: {} }],
      },
    ],
  };
}

// ---------------------------------------------------------------------------

async function runLive(environmentId: string) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    throw new Error(
      "CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env.local",
    );
  }

  const { createClient } = await import("contentful-management");
  const client = createClient({ accessToken: managementToken });
  const ctx = { spaceId, environmentId };

  // Download a file and create + process + publish a Contentful asset.
  // Defined inline so `client`/`ctx` keep their inferred types (annotating a
  // parameter with createClient's overloaded ReturnType resolves wrong).
  async function uploadAsset(
    url: string,
    title: string,
    contentType: "image/jpeg" | "application/pdf",
  ): Promise<string> {
    const res = await fetch(url, {
      headers: { "user-agent": "misionessim-migration-bot/1.0" },
    });
    if (!res.ok) throw new Error(`download failed ${res.status}: ${url}`);
    const buffer = await res.arrayBuffer();
    const fileName = url.split("/").pop()!.split("?")[0];

    const asset = await client.asset.createFromFiles(ctx, {
      fields: {
        title: { "en-US": title },
        description: { "en-US": "" },
        file: { "en-US": { contentType, fileName, file: buffer } },
      },
    });

    const processed = await client.asset.processForAllLocales(ctx, asset);
    await client.asset.publish({ ...ctx, assetId: processed.sys.id }, processed);

    return processed.sys.id;
  }

  console.log(`\nLive run → space ${spaceId}, environment ${environmentId}`);
  console.log(`Processing ${EDITIONS.length} editions...\n`);

  for (const { slug, title, fecha, pdfUrl, coverUrl, description } of EDITIONS) {
    console.log(`\n── ${slug}`);

    // Idempotency: skip if already exists (check both "slug" and "/slug" forms)
    const existing = await client.entry.getMany({
      ...ctx,
      query: { content_type: "revista", "fields.slug[in]": `${slug},/${slug}` },
    });
    if (existing.total > 0) {
      console.log(`  skip: already exists (entry ${existing.items[0].sys.id})`);
      continue;
    }

    // Upload cover image
    console.log(`  cover: ${coverUrl.split("/").pop()}`);
    const coverAssetId = await uploadAsset(
      coverUrl,
      `${title} — portada`,
      "image/jpeg",
    );
    console.log(`  cover → asset ${coverAssetId}`);

    // Upload PDF
    console.log(`  pdf: ${pdfUrl.split("/").pop()}`);
    const pdfAssetId = await uploadAsset(
      pdfUrl,
      `${title} — PDF`,
      "application/pdf",
    );
    console.log(`  pdf → asset ${pdfAssetId}`);

    // Create and publish entry
    // NOTE: field id is "revistaPDF" (capital PDF) — the CMA rejects "revistaPdf"
    const fields: Record<string, unknown> = {
      title: { "en-US": title },
      slug: { "en-US": slug },
      fecha: { "en-US": fecha },
      revistaPDF: { "en-US": { sys: { type: "Link" as const, linkType: "Asset" as const, id: pdfAssetId } } },
      coverImage: { "en-US": { sys: { type: "Link" as const, linkType: "Asset" as const, id: coverAssetId } } },
    };
    // Intro paragraph → `body` RichText (only editions that have one on the live site)
    if (description) {
      fields.body = { "en-US": toRichTextDocument(description) };
    }

    const entry = await client.entry.create(
      { ...ctx, contentTypeId: "revista" },
      { fields },
    );
    await client.entry.publish({ ...ctx, entryId: entry.sys.id }, entry);
    console.log(`  entry → ${entry.sys.id} ✓ published`);
  }

  console.log("\nDone.");
}

// ---------------------------------------------------------------------------

function printDryRun() {
  console.log(`\nDRY RUN — ${EDITIONS.length} editions would be created:\n`);
  for (const { slug, title, fecha, pdfUrl, coverUrl, description } of EDITIONS) {
    console.log(`  ${slug}`);
    console.log(`    title:  ${title}`);
    console.log(`    fecha:  ${fecha}`);
    console.log(`    cover:  ${coverUrl.split("/").pop()}`);
    console.log(`    pdf:    ${pdfUrl.split("/").pop()}`);
    console.log(`    body:   ${description ? description : "(none — no intro on live site)"}`);
  }
  console.log(
    "\nRun with --live --environment=master to execute (requires David's sign-off).",
  );
}

// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const envArg = args.find((a) => a.startsWith("--environment="));
  const environmentId = envArg?.split("=")[1];

  if (!live) {
    printDryRun();
    return;
  }

  if (!environmentId) {
    console.error("Error: --live requires --environment=<id> (e.g. --environment=master)");
    process.exit(1);
  }

  await runLive(environmentId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Mark as a module so top-level declarations don't collide with sibling
// scripts in the shared global scope during `next build` type-checking.
export {};
