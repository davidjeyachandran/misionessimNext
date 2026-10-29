/**
 * VAMOS — «Idioma y cultura», diciembre 2012
 * (revista 59i5xqgI8218p7CdJ76Z67).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * An 11-page A4 issue (pp. 2-12), one headline per page, two-column body with pull quotes and sidebars.
 */

/** 1 cover (image only) · 4 learning-style self-test. */
const skipPages = new Set([1, 4]);

const articles = [
  { title: 'Como un bebé otra vez', anchor: 'Un cristiano con llamado misionero, que' },
  { title: 'El Padre está interesado en tu aprendizaje del idioma', anchor: 'Dios reconoce y respeta las lenguas' },
  { title: 'Es un peligro no dominar el idioma', anchor: '• Aprender un segundo idioma es más un logro' },
  { title: 'El idioma y la cultura son inseparables', anchor: 'El aprendizaje de un idioma es una actividad' },
  { title: 'Necesitaba saber de la cultura', anchor: 'Antes de llegar al campo, Fernanda' },
  { title: 'Una guía para la cultura basada en 1 Corintios 13', anchor: 'Basada en 1 Corintios 13' },
  { title: 'Preguntas para entender diferentes culturas', anchor: 'Al trabajar con gente de diferentes culturas' },
  { title: 'La vergüenza y los misioneros latinos', anchor: 'En las clases del A2L, dijo David Rising' },
  { title: 'No más excusas', anchor: 'Cuando se habla de aprender un nuevo' },
  { title: 'Aprende inglés', anchor: 'En el campo misionero hay un idioma intermedio' },
];

export default {
  revistaId: '59i5xqgI8218p7CdJ76Z67',
  coverAssetId: '4TYnmUvMseTPKskrQvMRqN',
  date: '2012-12-01',
  skipPages,
  rowPages: new Set([]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Pull quotes split two sentences mid-clause («y de hacer amigos…» starts a paragraph in lower case).
    'El idioma y la cultura son inseparables',
    // The 17-item question list is truncated mid-sentence in most items; the continuation lines are lost.
    'Preguntas para entender diferentes culturas',
    // Pull quote spliced into the first paragraph («mundo. Así que vale»), and the VAMOS manual ad is run into the end.
    'Aprende inglés',
    // A paragraph ends mid-sentence («el clima afectó») because its continuation landed in a sidebar.
    'Necesitaba saber de la cultura',
    // One line of the 1 Corinthians 13 paraphrase is cut off mid-clause («se burlan de su»); the subtitle also leads as a stray paragraph.
    'Una guía para la cultura basada en 1 Corintios 13',
  ]),
  coverHero: new Set([]),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Diciembre|2012|Tema:|Por:|Equipo Editorial|Directora:|La revista SIM tiene|Encontrarás muchos|misionessim\.org|VAMOS, SIM|Tu iglesia local te envía)/i,
};
