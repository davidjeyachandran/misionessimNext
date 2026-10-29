/**
 * VAMOS — «Involucrar tu iglesia», noviembre 2012
 * (revista 6yvR4x2y6CP63FmwUksno5).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A 10-page A4 issue (pp. 2-11), one headline per page, two-column body with pull quotes and sidebars.
 */

/** 1 cover (image only) · 10-11 downloadable-materials lists and house ads. */
const skipPages = new Set([1, 10, 11]);

const articles = [
  { title: 'Todos somos parte de la tarea', anchor: 'Nosotros, la iglesia, somos llamados a cumplir' },
  { title: 'Sé realista', anchor: 'Si tu iglesia no ora por sus vidas' },
  { title: 'p3 · niveles de involucramiento', anchor: '1. Apoyando - Participación en apoyo' },
  { title: 'Retando', anchor: 'A la iglesia de Cristo le fue encargada' },
  { title: 'Los mitos para no hacer la tarea', anchor: 'Muchas veces, la iglesia presenta pretextos' },
  { title: 'Ideas prácticas para desarrollar en tu iglesia', anchor: 'Para animar a que nuestras iglesias participen' },
  { title: 'Identificando a los llamados', anchor: 'Sabemos que el llamado de hacer misiones es un llamado' },
  { title: 'p7 · headline fragment', anchor: 'Pastor, Usted' },
  { title: 'Pastor, usted es clave', anchor: 'La congregación no va a obedecer a la Gran Comisión' },
  { title: 'Es que no les tienes paciencia', anchor: 'En tu caminar hacia el' },
  { title: 'Lo que tú puedes hacer para levantar a tu iglesia', anchor: 'Es común encontrar candidatos llamados a las misiones' },
];

export default {
  revistaId: '6yvR4x2y6CP63FmwUksno5',
  coverAssetId: '1qmmAdcaG2IwIVOKmH6KLd',
  date: '2012-11-01',
  skipPages,
  rowPages: new Set([]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Numbered sidebar whose own heading is lost; it would sit unattributed inside «Sé realista».
    'p3 · niveles de involucramiento',
    // The next page's headline, which would otherwise be appended to the end of the p6 article.
    'p7 · headline fragment',
    // Pull quote and a name caption are spliced word by word through the text («Carlos Scott, ella pudo darse cuenta que…»).
    'Es que no les tienes paciencia',
    // Under 150 words once the levels sidebar and the Envoy article are separated out.
    'Sé realista',
  ]),
  coverHero: new Set([]),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Noviembre|2012|Tema:|Por:|Equipo Editorial|Directora:|La revista SIM tiene|Encontrarás muchos|misionessim\.org|VAMOS, SIM|Tu iglesia local te envía)/i,
};
