/**
 * VAMOS — «Iglesia y misiones», diciembre 2009
 * (revista 34xtrme3zYlnKQjSGMKD4S).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A four-page 2009 e-zine: a cover feature plus interviews, every page
 * cluttered with pull quotes and sidebars set inside the measure.
 */

/** p4 is pull quotes, a survey, ads and the masthead. */
const skipPages = new Set([4]);

const articles = [
  { title: 'Misiones es tarea de la iglesia',                 anchor: 'Remontándonos al pasado de la iglesia primitiva' },
  { title: 'p1 · sidebar Rocío Silva',                        anchor: 'La chilena Rocío Silva fue enviada' },
  { title: 'p2 · sidebar Sara y Nando',                       anchor: 'Sara y Nando son' },
  { title: 'Introduzcamos lo que es realmente misiones a la iglesia', anchor: 'Alejandro Rodríguez, es actualmente director' },
  { title: 'Incómodo con la comodidad de la iglesia',         anchor: 'Llegué al campo misionero luego' },
];

export default {
  revistaId: '34xtrme3zYlnKQjSGMKD4S',
  coverAssetId: '4WVXmveeEmUewQz2pDKtEH',
  date: '2009-12-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p1 · sidebar Rocío Silva',
    'p2 · sidebar Sara y Nando',
    // The cover feature continues on p2, where its text is set in a
    // two-column frame with pull quotes; p1 also splices a caption
    // («Alberto») into a quotation and the continuation is lost.
    'Misiones es tarea de la iglesia',
    // «lo en que es realmente misiones»: a pull-quote headline is spliced
    // into the sentence and reorders it.
    'Introduzcamos lo que es realmente misiones a la iglesia',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Diciembre|2009|Tema:|Por\s*Ana|Por:|equipo editorial|Editora:|Tu iglesia local te envía)/i,
};
