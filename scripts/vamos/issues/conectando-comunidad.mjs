/**
 * VAMOS «Conectando con la comunidad» — septiembre 2026 — article manifest.
 *
 * The cover, the masthead page's furniture and the back cover are skipped;
 * everything else is anchored by the opening words of its first body block.
 * Headlines are set as outlined vector art on most pages, so they do not
 * appear in the text layer at all — where one DOES appear as live text and
 * runs to 12 words or more (p18, p28), the short-frame rule cannot drop it
 * and it is isolated in `dropArticles` instead.
 */
const skipPages = new Set([
  1,   // cover
  3,   // table of contents
  35,  // back cover — SIM ministry directory, not an article
]);

/**
 * p17 stacks two two-column articles, so whole-left-then-whole-right puts
 * the top article's continuation inside the bottom one. Read by row.
 */
const rowPages = new Set([17]);

const articles = [
  // ── p2 editorial ──────────────────────────────────────────────────────
  { title: 'Evangelio en acción',                              anchor: 'Estoy emocionado de presentar esta edición' },
  { title: 'Pie de imprenta p2',                               anchor: 'Escríbenos a' },

  // ── tema principal ────────────────────────────────────────────────────
  { title: 'Pie de foto p4',                                   anchor: 'Juanita en Asia abraza' },
  { title: 'Una iglesia relevante conecta fe y vida cotidiana', anchor: 'Cuando la iglesia no es relevante' },
  { title: 'Creatividad al estilo de Jesús',                   anchor: 'La Escritura revela que comunicar el Evangelio' },
  { title: 'Seamos creativos como Jesús',                      anchor: 'La creatividad de Jesús no era un recurso estético' },

  // ── testimonios ───────────────────────────────────────────────────────
  { title: 'Años de presencia que construyen confianza',       anchor: 'Una de las ventajas de vivir varios años' },
  { title: 'Más que folletos: acompañar hasta formar discípulos', anchor: 'A veces, como iglesia, decimos' },
  { title: 'Sembrando fe en cada show infantil',               anchor: 'Quisiera compartir un poco de mi testimonio' },
  { title: 'Cita 1 Timoteo p8',                                anchor: 'Ante todo, recomiendo que se hagan plegarias' },
  { title: 'La pirámide de Maslow',                            anchor: 'La pirámide de Maslow de psicólogo Abraham Maslow' },
  { title: 'Conexión con la comunidad mediante la oración',    anchor: 'Una de las experiencias de contacto con la comunidad' },
  { title: 'Guatemaltecos bendiciendo a guatemaltecos',        anchor: 'Fe en Acción, una asociación de fe cristiana' },
  { title: 'Mirar con atención: descubrir necesidades reales', anchor: 'La vida cristiana nos invita a mirar con atención' },
  { title: 'Sembrando amistad en cada paseo',                  anchor: 'He disfrutado tener una mascota' },
  { title: 'Un gimnasio que abrió corazones y hogares',        anchor: 'Uno de los emprendimientos de conexión con la comunidad' },
  { title: 'Cultivar un corazón por los perdidos',             anchor: '7 pasos para despertar pasión por quienes' },
  { title: '"La iglesia sale de sus muros"',                   anchor: 'En mis oraciones siempre pedía' },
  { title: 'Sembrando semillas que dan fruto eterno',          anchor: 'Desde niña he sentido una gran pasión' },
  { title: 'Tutoría y formación bíblica para familias musulmanas', anchor: 'Parte de nuestro trabajo fue apoyar a creyentes' },
  { title: 'Tardarás en ver el fruto, pero lo verás',          anchor: 'Hace 16 años llegamos a una comunidad levantada' },
  { title: 'Años de servicio silencioso, hoy una iglesia viva', anchor: 'En 1998 en un lugar remoto del valle Ommo' },
  { title: 'Jóvenes sueñan con una iglesia diferente',         anchor: 'A fines de los 90 y principios de los 2000' },
  { title: 'Una emisora que conecta fe y cultura',             anchor: 'Con un amigo comenzamos Nueveynueveradio' },
  { title: 'Cuatro meses, quince creyentes, un nuevo templo',  anchor: 'Viví por un corto tiempo en un pueblo' },
  { title: 'Enseñando fútbol, guitarra, inglés y español',     anchor: 'Por siete años participé' },
  { title: 'Titular p18',                                      anchor: 'Gratuito porque Cristo' },
  { title: 'Gratuito porque Cristo ya pagó el precio',         anchor: 'Como familia servimos localmente en el sur de Chile' },
  { title: 'El Evangelio es integral',                         anchor: 'Como grupo de jóvenes, Dios habló' },
  { title: 'Un oasis de pertenencia',                          anchor: 'En un radio de 10 km no hay iglesia' },
  { title: 'Una propuesta difícil para el líder musulmán',     anchor: 'La comunidad en la que vivíamos tenía 23 mezquitas' },
  { title: 'De prisionera a maestra',                          anchor: 'Vanessa Hernaiz, quien un día entró esposada' },
  { title: 'De reclusa a maestra de discipulado bíblico en las cárceles', anchor: 'Algunas vidas parecen condenadas a la oscuridad' },
  { title: 'El arte como puente',                              anchor: 'Todo comenzó en el grupo de conexión' },
  { title: 'Aprender, aplicar y compartir: el ciclo del Reino', anchor: 'En mi aprendizaje del idioma farsi' },
  { title: 'Ideas para prepararte mejor y aprovechar las oportunidades que Dios nos da', anchor: '1. Caminatas de oración' },
  { title: 'De la cocina al corazón: El Día de la Galleta',    anchor: 'Dos misioneras de SIM en Lima, Perú' },

  // ── deporte ───────────────────────────────────────────────────────────
  { title: 'Más que una estrategia, una plataforma misionera', anchor: 'El deporte puede ser más que un pasatiempo' },
  { title: 'Una pelota reparada, un sueño compartido',         anchor: 'Isaac, con tan solo 18 años' },
  { title: 'Ficha Sports Friends p26',                         anchor: 'es un ministerio de SIM que usa el deporte' },
  { title: 'No solamente como un gancho',                      anchor: 'En su capacitación básica, Sports Friends busca' },
  { title: 'Contextualizar la misión: cuando el manual no alcanza', anchor: 'En algunas comunidades de la selva no existe la palabra pelota' },
  { title: 'Titular p28',                                      anchor: 'De la cancha a la iglesia' },
  { title: 'De la cancha a la iglesia: el punto donde tropiezan los ministerios', anchor: 'Los ministerios deben ser contextualizados' },
  { title: 'Una inversión para el Reino: formando discípulos a través del deporte', anchor: 'En el ministerio deportivo no se deben esperar cambios' },
  { title: 'Cómo el deporte abrió puertas para el liderazgo y la esperanza', anchor: 'El Pastor Kleber lidera una iglesia' },
  { title: 'Orgánico, auténtico y guiado por Dios',            anchor: 'Este año se visitó una comunidad que había sido desplazada' },
  { title: 'Un balón abre caminos de fe',                      anchor: 'Como muchos niños latinoamericanos, Natán' },
  { title: '"No buscamos solo deportistas"',                   anchor: 'No solo buscan amantes del fútbol' },
  { title: '8 pasos para iniciar un ministerio deportivo en una iglesia', anchor: 'Inspirado en los principios de Sports Friends' },
  { title: 'Viñetas huérfanas p34',                            anchor: '• • • • • • •' },
];

export default {
  revistaId: '1oU4fcJfoJPnX4isTlYKZj',
  coverAssetId: '19Ew7lkWHC3p4kU8ohsBZI',
  date: '2026-09-01',
  skipPages,
  rowPages,
  articles,
  /**
   * Anchored only to keep their text out of the article before them.
   *
   * · Pie de imprenta p2 — the contact panel runs on into a lowercase URL
   *   frame, which exempts it from the masthead rule, so the editorial
   *   would otherwise close on «Escríbenos a:». Everything after it on the
   *   page is masthead too.
   * · Pie de foto p4 / Titular p18 / Titular p28 — caption and headline
   *   frames of 12 words or more, which the short-frame rule cannot drop.
   * · Cita 1 Timoteo p8 — a scripture panel set in the left column, so it
   *   reads BEFORE the article it illustrates and would otherwise close p7.
   * · Ficha Sports Friends p26 — an infographic panel whose section labels
   *   are separate short frames; imported whole it would read as one
   *   unlabelled bullet run appended to Isaac's testimony.
   * · Viñetas huérfanas p34 — the bullet glyphs of step 8's skills list are
   *   set in their own 4pt-wide frame beside the words. Keeping it would
   *   ship a paragraph of seven naked bullets, so the step-8 list and the
   *   two closing lines are dropped with it.
   */
  dropArticles: new Set([
    'Pie de imprenta p2',
    'Pie de foto p4',
    'Cita 1 Timoteo p8',
    'Titular p18',
    'Ficha Sports Friends p26',
    'Titular p28',
    'Viñetas huérfanas p34',
  ]),
  /**
   * Articles whose page carries no usable photograph, given the issue cover.
   * p23 and p27 each hold one photo, taken by the article beside them; p34
   * is a full page of type with no photograph at all.
   */
  coverHero: new Set([
    'Ideas para prepararte mejor y aprovechar las oportunidades que Dios nos da',
    'Contextualizar la misión: cuando el manual no alcanza',
    '8 pasos para iniciar un ministerio deportivo en una iglesia',
  ]),
  /**
   * · Evangelio en acción — the automatic pick is the SIM wordmark; the
   *   editorial's own illustration is the cover thumbnail beside it.
   * · Sembrando amistad — the gym photograph in the NEXT column outscores
   *   this article's own; naming it here frees the gym photo for the gym.
   * · Jóvenes sueñan — the fanzine artwork is wider than a candidate is
   *   allowed to be, so nothing at all was offered for the page.
   */
  heroOverride: {
    'Evangelio en acción':                      'doc-2_4.jpg',
    'Sembrando amistad en cada paseo':          'doc-11_3.jpg',
    'Jóvenes sueñan con una iglesia diferente': 'doc-16_3.jpg',
  },
  /** Masthead names reset every issue; the shared pattern covers the rest. */
  furniture: /^(Jessica Bastidas|Luigi Sarmiento|Geraldyne Velasquez|Christina Conti)/i,
};
