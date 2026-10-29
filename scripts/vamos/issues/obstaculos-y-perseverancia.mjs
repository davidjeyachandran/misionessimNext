/**
 * VAMOS — «Obstáculos y perseverancia», septiembre 2012
 * (revista 4T4XjKO1MfMIyffdqotth8).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A 10-page A4 issue (pp. 2-11), one headline per page, two-column body with pull quotes and sidebars.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Llamados a la meta', anchor: 'Las risas de los pequeños llenan el' },
  { title: 'Obstáculos en el proceso de salir al campo', anchor: 'Muchos misioneros latinos están respondiendo' },
  { title: 'No me detengo a ser reina, soy misionera', anchor: 'Soledad lleva diez años involucrada' },
  { title: 'Más que un cuento de hadas', anchor: 'Todos los cuentos que nos contaban' },
  { title: 'Preparados y afilados', anchor: 'Estar bien preparado es como tener' },
  { title: '¡Qué largo proceso!', anchor: 'Piensa por un instante en los grandes triunfadores' },
  { title: 'La espera nos formó', anchor: 'Pedro y Karen han pasado muchos años' },
  { title: 'No esperes hacer en el campo lo que puedes hacer', anchor: 'Muchas veces, los llamados a misiones hablan' },
  { title: 'Todo ayuda para bien', anchor: 'Mientras trabaja y estudia en Nueva Zelanda' },
  { title: 'La perseverancia que da frutos', anchor: 'Pasaron ocho años para que Karen' },
  { title: 'Confiando en los sueños de Dios', anchor: 'Recuerda a los grandes hombres de fe' },
  { title: 'p11 · Manual VAMOS ad', anchor: 'Mientras esperas para salir al campo' },
  { title: 'Tirar la toalla', anchor: 'Las reglas del box' },
];

export default {
  revistaId: '4T4XjKO1MfMIyffdqotth8',
  coverAssetId: '5yPv0UFnmrLjDnup4yShk',
  date: '2012-09-01',
  skipPages,
  rowPages: new Set([]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // A caption («Familia Marroquín-Samayoa») and a pull quote (« Cumplidos los… dos años, las») are spliced into the middle of a sentence.
    'La espera nos formó',
    // The closing Hebrews 12 pull quote is interleaved with the verse it repeats, ending in a garbled tail.
    'La perseverancia que da frutos',
    // House ad for the VAMOS manual.
    'p11 · Manual VAMOS ad',
    // Under 150 words once the masthead and ad are removed.
    'Tirar la toalla',
  ]),
  coverHero: new Set([]),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Septiembre|2012|Tema:|Por:|Equipo Editorial|Directora:|La revista SIM tiene|Encontrarás muchos|misionessim\.org|VAMOS, SIM|Tu iglesia local te envía)/i,
};
