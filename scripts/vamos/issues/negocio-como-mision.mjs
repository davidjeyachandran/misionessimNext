/**
 * VAMOS — «Negocios como misión», mayo 2011
 * (revista m1m0OdKqYKXAWKWEnnO96).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A five-page 2011 newsletter: A4, two-column, sidebars and a boxed
 * "ideas prácticas" on the last page.
 */

const skipPages = new Set([]);

const articles = [
  { title: 'Negocios del Reino que transforman',            anchor: '¿Crees que un cristiano puede hacer negocios' },
  { title: 'Definamos BAM',                                 anchor: 'BAM (Business as Mission), en castellano' },
  { title: 'Abriendo puertas: tres declaraciones fundamentales', anchor: 'David Bronkema, Director del Programa' },
  { title: 'La mujer empresaria de Proverbios 31',          anchor: 'Los empresarios no son ciudadanos de segunda' },
  { title: 'p2 · lista de las tres declaraciones y Oportunidad para latinos', anchor: '1. Cristo nos envía a todo el mundo' },
  { title: 'El potencial de BAM',                           anchor: 'Si entendemos claramente que el llamado' },
  { title: 'Influenciando con el ejemplo',                  anchor: 'Misionero Shane Treadway, Director de misión' },
  { title: 'Lo que está haciendo SIM con BAM',              anchor: 'Muchas (probablemente la mayoría)' },
  { title: 'Los peligros de BAM',                           anchor: 'Que no se dedique tiempo suficiente' },
  { title: 'Los latinos y BAM',                             anchor: 'Hay negocios de BAM en América Latina' },
  { title: 'p5 · pull quote de Jeff Hahn',                  anchor: 'En la práctica vemos que BAM es más difícil' },
  { title: 'p5 · ideas prácticas',                          anchor: 'ideas' },
  { title: 'La parte operativa de BAM',                     anchor: 'Entrevista a PHD. David Bronkema' },
  { title: 'p5 · pie de página',                            anchor: 'equipo editorial' },
];

export default {
  revistaId: 'm1m0OdKqYKXAWKWEnnO96',
  coverAssetId: '1HLfUEb9NlpCwm56VhpYOB',
  date: '2011-05-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Pull quote «Idealmente, la compañía debería de ser 100% negocio…»
    // spliced into the prose line by line.
    'Negocios del Reino que transforman',
    // The three declarations the headline promises are a separate frame on
    // the other column, so the piece is only its lead-in.
    'Abriendo puertas: tres declaraciones fundamentales',
    // Photo caption «Shane Treadway en pleno trabajo» spliced into a sentence.
    'Influenciando con el ejemplo',
    // Last paragraph is two text frames interleaved word by word.
    'Los peligros de BAM',
    'p2 · lista de las tres declaraciones y Oportunidad para latinos',
    'p5 · pull quote de Jeff Hahn',
    'p5 · ideas prácticas',
    'p5 · pie de página',
  ]),
  /** p5 carries no photograph. */
  coverHero: new Set(['La parte operativa de BAM']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Mayo|2011|Tema:|Por:|equipo editorial|Directora:|ezine\.|Sandra Chiang|Tu iglesia local|web:|La revista SIM|misionessim\.org|Hay más de 200 ideas|VAMOS ya está|Haz click aquí)/i,
};
