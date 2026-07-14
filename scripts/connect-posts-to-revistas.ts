/**
 * Connect blogPost entries to their revista (VAMOS edition) in Contentful.
 *
 * The mapping below was derived by matching each unconnected post's body
 * against the edition PDFs (5-word shingle containment — near-verbatim
 * reuse only) plus explicit "Edición Revista VAMOS" attributions in the
 * WordPress bodies. See the session notes in docs/ for the evidence trail.
 *
 * Two writes per connection, mirroring how the ~786 already-connected
 * posts are modelled:
 *  - blogPost.revista        → Entry link to the revista
 *  - revista.blogPosts       → post appended to the edition's article list
 *    (skipped where `updateArray: false` — `regresando-a-casa` and
 *    `termina-bien` back the live "Regresando a casa" learning route in
 *    mi-movilicemos, so their arrays must not change without sign-off).
 *
 * Usage (Node 20):
 *  - `yarn connect:revistas`                          dry run (default)
 *  - `yarn connect:revistas --live --environment=master`  execute
 *
 * Idempotent: posts that already have a revista link are skipped, and
 * array appends dedupe by entry id, so re-running after a partial
 * failure is safe. The script only updates the two fields above.
 */
export {}; // only dynamic imports below — force module scope so `main` doesn't collide across scripts

type EditionPlan = {
  /** Clean revista slug (the CMA lookup also tries the legacy "/" form). */
  revistaSlug: string;
  /** false = leave revista.blogPosts untouched (mi-movilicemos route). */
  updateArray: boolean;
  /** Post slugs in the order they should be appended (publishDate ASC). */
  posts: string[];
};

const PLAN: EditionPlan[] = [
  // ── The 9 recent editions (previously zero connected posts) ──
  {
    revistaSlug: "conferencias-misioneras",
    updateArray: true,
    posts: [
      "la-iglesia-dio-un-giro-total",
      "tiene-importancia-local-y-mundial",
      "una-fiesta-misionera",
      "salen-motivados-a-involucrarse",
      "y-el-teatro-y-la-danza-en-el-culto-misionero",
    ],
  },
  {
    revistaSlug: "cuidado-integral-biblico-y-solidario",
    updateArray: true,
    posts: [
      "el-devocional-es-el-que-se-vive-cada-dia",
      "formas-en-que-la-iglesia-puede-fortalecer-a-los-obreros",
    ],
  },
  {
    revistaSlug: "discipulos-que-hacen-discipulos",
    updateArray: true,
    posts: [
      "4-razones-por-las-que-los-cristianos-no-discipulan",
      "discipulado-en-el-desierto-como-dios-esta-obrando-en-el-norte-de-africa",
      "10-cualidades-de-un-discipulador",
    ],
  },
  {
    revistaSlug: "caracter-misionero",
    updateArray: true,
    posts: [
      "moldeada-por-el-senor-lecciones-de-caracter-en-asia",
      "el-caracter-se-pone-a-prueba-en-prisma",
    ],
  },
  {
    revistaSlug: "envio-responsable-2",
    updateArray: true,
    posts: ["consejos-si-no-quieres-ser-misionero"],
  },
  {
    revistaSlug: "lucha-espiritual",
    updateArray: true,
    posts: ["luz-en-medio-de-la-oscuridad"],
  },
  {
    revistaSlug: "el-clamor-macedonio",
    updateArray: true,
    posts: [
      "olas-del-llamado-de-dios",
      "reconocer-el-llamado-de-dios",
      "alemania-una-puerta-abierta-para-profesionales-estudiantes-y-jovenes-con-llamado-misionero",
    ],
  },
  // la-gente-que-no-vemos, latinos-en-adaptacion: no post in Contentful
  // matched their PDFs — nothing to connect yet.

  // ── Older editions the same evidence resolved for free ──
  {
    revistaSlug: "equipos-multiculturales-2024",
    updateArray: true,
    posts: [
      "4-etapas-en-el-desarrollo-de-un-equipo-de-trabajo-multicultural",
      "unidos-con-un-solo-proposito",
      "aprendiendo-a-comunicarnos-en-un-equipo-intercultural",
      "un-trabajo-arduo-en-equipo-por-el-reino-de-los-cielos",
      "como-un-equipo-en-campo-de-juego",
      "a-liderar-bien",
      "idiomas-y-su-efecto-en-el-equipo",
      "unidos-por-un-solo-proposito",
    ],
  },
  {
    revistaSlug: "no-alcanzados",
    updateArray: true,
    posts: [
      "por-que-los-obreros-deben-ser-enviados-a-etnias-aun-no-alcanzadas",
      "dios-esta-invitando-a-su-iglesia-a-servir-a-musulmanes",
      "3-barreras-que-existen-entre-los-no-alcanzados",
      "que-les-llama-la-atencion-a-los-musulmanes-sobre-jesus",
      "comibam-promueve-alcanzando-a-las-etnias-no-alcanzadas",
      "un-tercio-de-nosotros-no-alcanzado",
    ],
  },
  {
    revistaSlug: "soy-influencer",
    updateArray: true,
    posts: [
      "somos-trigo-y-debemos-multiplicarnos",
      "la-iglesia-y-su-rol-influenciador",
      "aprendiendo-a-convivir",
      "tu-influencia-eres-sal-insipida-2",
      "todo-cristiano-forma-parte",
      "como-seria-el-mundo-sin-la-influencia-de-mordecai-ham",
      "su-influencia-marco-la-historia",
      "consejos-a-los-influencers",
    ],
  },
  {
    // Backs the live mi-movilicemos "Regresando a casa" route — link the
    // posts but do NOT extend the route's article list.
    revistaSlug: "regresando-a-casa",
    updateArray: false,
    posts: [
      "ayudando-al-misionero-a-reintegrarse",
      "cual-es-el-problema-solo-esta-volviendo-a-casa",
      "planeando-el-regreso-a-casa",
      "coordinando-el-regreso",
    ],
  },
  {
    // Same route as regresando-a-casa — array untouched.
    revistaSlug: "termina-bien",
    updateArray: false,
    posts: [
      "estamos-limitando-a-otros-en-su-compromiso-en-las-misiones",
      "no-fuera-de-circulacion-sino-bajar-las-revoluciones-un-poco",
      "transiciones-mensaje-para-los-pastores-y-lideres",
      "la-palabra-de-dios-nos-ayuda-en-la-transicion",
      "nuestra-identidad-no-esta-en-nuestro-ministerio",
    ],
  },
  {
    revistaSlug: "fondos-misioneros-2022",
    updateArray: true,
    posts: ["discipulando-a-los-dadores", "no-hay-recursos"],
  },
  {
    revistaSlug: "idioma-y-cultura-2022",
    updateArray: true,
    posts: [
      "es-un-peligro-no-dominar-el-idioma",
      "me-anima-a-seguir-practicando",
    ],
  },
  {
    revistaSlug: "autocuidado",
    updateArray: true,
    posts: [
      "autocuidado-antes-de-ir-al-campo-misionero",
      "evolucion-del-concepto-de-autocuidado",
      "una-accion-intencionada",
    ],
  },
  {
    revistaSlug: "arte-en-misiones",
    updateArray: true,
    posts: ["glorificamos-a-dios-a-traves-del-arte"],
  },
];

const LOCALE = "en-US";

function parseArgs() {
  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const envArg = args.find((a) => a.startsWith("--environment="));
  const environmentId = envArg?.split("=")[1];
  if (live && !environmentId) {
    throw new Error(
      "--live requires an explicit --environment=<id> (e.g. --environment=master).",
    );
  }
  return { live, environmentId };
}

function dryRun() {
  let total = 0;
  for (const ed of PLAN) {
    console.log(
      `\n${ed.revistaSlug}${ed.updateArray ? "" : "  [blogPosts array NOT updated — mi-movilicemos route]"}`,
    );
    for (const slug of ed.posts) {
      console.log(`  + ${slug}`);
      total++;
    }
  }
  console.log(
    `\nDry run: would connect ${total} posts across ${PLAN.length} revistas.`,
  );
  console.log("Run with --live --environment=master to execute.");
}

async function runLive(environmentId: string) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !managementToken) {
    throw new Error(
      "CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN must be set in .env.local for --live mode.",
    );
  }
  const { createClient } = await import("contentful-management");
  const client = createClient({ accessToken: managementToken });
  const ctx = { spaceId, environmentId };

  for (const ed of PLAN) {
    const revistas = await client.entry.getMany({
      ...ctx,
      query: {
        content_type: "revista",
        "fields.slug[in]": `${ed.revistaSlug},/${ed.revistaSlug}`,
      },
    });
    if (revistas.total !== 1) {
      throw new Error(
        `${ed.revistaSlug}: expected exactly 1 revista, found ${revistas.total} — stopping.`,
      );
    }
    const revista = revistas.items[0];
    const revistaId = revista.sys.id;
    const newlyLinked: string[] = [];

    for (const postSlug of ed.posts) {
      const posts = await client.entry.getMany({
        ...ctx,
        query: { content_type: "blogPost", "fields.slug": postSlug },
      });
      if (posts.total !== 1) {
        throw new Error(
          `${postSlug}: expected exactly 1 blogPost, found ${posts.total} — stopping.`,
        );
      }
      const post = posts.items[0];
      const existingLink = post.fields.revista?.[LOCALE]?.sys?.id;
      if (existingLink) {
        console.log(
          `skip ${postSlug}: already linked to revista ${existingLink}`,
        );
        continue;
      }
      post.fields.revista = {
        [LOCALE]: { sys: { type: "Link", linkType: "Entry", id: revistaId } },
      };
      const updated = await client.entry.update(
        { ...ctx, entryId: post.sys.id },
        post,
      );
      await client.entry.publish({ ...ctx, entryId: post.sys.id }, updated);
      newlyLinked.push(post.sys.id);
      console.log(`${ed.revistaSlug}: linked ${postSlug} (${post.sys.id})`);
    }

    if (!ed.updateArray) {
      console.log(`${ed.revistaSlug}: blogPosts array left untouched`);
      continue;
    }
    if (newlyLinked.length === 0) continue;

    const current: { sys: { id: string } }[] =
      revista.fields.blogPosts?.[LOCALE] ?? [];
    const have = new Set(current.map((l) => l.sys.id));
    const additions = newlyLinked
      .filter((id) => !have.has(id))
      .map((id) => ({ sys: { type: "Link", linkType: "Entry", id } }));
    if (additions.length === 0) continue;
    revista.fields.blogPosts = { [LOCALE]: [...current, ...additions] };
    const updatedRevista = await client.entry.update(
      { ...ctx, entryId: revistaId },
      revista,
    );
    await client.entry.publish(
      { ...ctx, entryId: revistaId },
      updatedRevista,
    );
    console.log(
      `${ed.revistaSlug}: blogPosts array +${additions.length} (now ${current.length + additions.length})`,
    );
  }
  console.log("\nDone.");
}

async function main() {
  const { live, environmentId } = parseArgs();
  if (!live) {
    dryRun();
    return;
  }
  await runLive(environmentId!);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
