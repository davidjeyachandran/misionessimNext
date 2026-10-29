/**
 * VAMOS — «Trabajando con niños», abril 2012
 * (revista 5R9VKQc5hADAFNpN5KqDmI).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A 6-page A4 issue (pp. 2-7), one headline per page, two-column body with pull quotes and sidebars.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Es más que un juego', anchor: 'De pronto Jaime le gritó' },
  { title: 'Misioneritos que llegan a la familia', anchor: 'Los misioneros y una madre ríen juntos' },
  { title: 'Escuela Dominical, más que una guardería', anchor: 'Muchos de los ministerios de la niñez' },
  { title: 'Una lucecita que nunca dejará de brillar', anchor: 'Viajemos en el tiempo' },
  { title: 'Formando misioneros', anchor: '¡Qué maravillosa tarea es' },
  { title: 'p7 · recursos y materiales', anchor: 'Recursos y materiales para niños' },
  { title: 'El llamado es para todos', anchor: 'Noelía Juarez, tiene 11 años' },
];

export default {
  revistaId: '5R9VKQc5hADAFNpN5KqDmI',
  coverAssetId: '17BofuTBm34xziYd5rgPqW',
  date: '2012-04-01',
  skipPages,
  rowPages: new Set([]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Resource list whose bullets are empty in the text layer.
    'p7 · recursos y materiales',
    // Two-column page with a pull quote and caption interleaved word by word into the prose.
    'Misioneritos que llegan a la familia',
    // Two sentences break mid-clause where the pull quote is spliced in («son verdaderas» / «lamparitas en sus hogares»).
    'Una lucecita que nunca dejará de brillar',
    // A sidebar blurb and two pull quotes sit between «en One» and «Challengue», splitting a sentence.
    'Es más que un juego',
  ]),
  coverHero: new Set([]),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Abril|2012|Tema:|Por:|Equipo Editorial|Directora:|La revista SIM tiene|Encontrarás muchos|misionessim\.org|Tu iglesia local te envía)/i,
};
