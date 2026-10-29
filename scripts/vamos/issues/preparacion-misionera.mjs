/**
 * VAMOS — «Preparación misionera», julio 2010
 * (revista 3uUQZWbUgNZcvAbftshc8w).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A five-page 2010 e-zine: a two-column cover feature, testimonies and an
 * interview, with a self-assessment list and service listings.
 */

/** 4 is service-opportunity listings and mission-agency ads. */
const skipPages = new Set([4]);

const articles = [
  { title: 'Listos para la cancha',                           anchor: 'En el fútbol queremos tener el mejor' },
  { title: 'Dejándonos preparar por Dios',                    anchor: 'Yola y Julio Sineragua' },
  { title: 'p2 · titular la iglesia',                        anchor: 'la iglesia' },
  { title: 'La iglesia, un agente de preparación',            anchor: 'Muchas veces, los candidatos a misiones' },
  { title: 'Mantente en forma: nunca dejes de entrenar',      anchor: 'Andrés comenzó su preparación misionera' },
  { title: 'p3 · Evalúate a ti mismo',                        anchor: '1. De una escala del 1 al 10' },
  { title: 'Misioneros de alta calidad',                      anchor: 'Creer que con lo que sabemos basta' },
  { title: 'p5 · vivir para contarlo',                        anchor: 'Hace unos meses, fuimos a visitar' },
  { title: 'p5 · footer',                                     anchor: 'Tu iglesia local te envía' },
  { title: 'p5 · masthead',                                   anchor: 'Para bajar la revista SIM' },
];

export default {
  revistaId: '3uUQZWbUgNZcvAbftshc8w',
  coverAssetId: '3LpTcsp6vFEUyciNIycdUy',
  date: '2010-07-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p2 · titular la iglesia',
    // The pull quote «Un obrero mal preparado…» leaves its attribution
    // («Mario Loss misionero de SIM en Uruguay») as a stray paragraph
    // between the two halves of the feature.
    'Listos para la cancha',
    // Mario Loss's quotation is set into the prose with its caption.
    'La iglesia, un agente de preparación',
    // The interview questions are lost (too short to survive as frames),
    // leaving unlabelled answers and a repeated pull quote.
    'Mantente en forma: nunca dejes de entrenar',
    'p3 · Evalúate a ti mismo',
    // The pull quote and the Xinia Gamboa caption are spliced word by word
    // into the opening paragraphs.
    'Misioneros de alta calidad',
    'p5 · footer',
    'p5 · masthead',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Julio|2010|Tema:|Por:|Directora:|equipo editorial|Tu iglesia local te envía)/i,
};
