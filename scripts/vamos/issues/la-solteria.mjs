/**
 * VAMOS — «La soltería», enero 2010
 * (revista 3005VXTft5KIhyNUF8yk81).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A four-page 2010 newsletter: one A4 page per piece, every page cluttered
 * with pull quotes and sidebars set inside the measure.
 */

/** None: the cover page is also the first article. */
const skipPages = new Set([]);

const articles = [
  { title: 'La espera que no desespera',                 anchor: 'A veces los casados miran a los solteros' },
  { title: 'La cama de una plaza siempre será suficiente para mí', anchor: 'Rocío Silva, es chilena y trabaja' },
  { title: 'Tips para los misioneros solteros',          anchor: '• Necesitas de “una familia”' },
  { title: 'p2 · pull quote y titular de la p3',         anchor: 'No estamos en' },
  { title: 'Aprendamos a vivir disfrutando las ventajas de la soltería', anchor: 'Andrés Vergara, misionero chileno' },
  { title: 'Jesús mismo fue soltero: necesitan cuidado pastoral', anchor: 'Los solteros realizan trabajos muy valiosos' },
  { title: 'p4 · oportunidades misioneras',              anchor: 'Ecuador - PRF' },
];

export default {
  revistaId: '3005VXTft5KIhyNUF8yk81',
  coverAssetId: '3DhE2OWeP3YOgMIw36mG4A',
  date: '2010-01-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p4 · oportunidades misioneras',
    'p2 · pull quote y titular de la p3',
    // Rocío Silva's name, the pull quote «pude viajar…» and «¡No te afanes…»
    // are spliced word-by-word into the prose.
    'La espera que no desespera',
    // Pull quote «En Isaías me ha dicho» interleaved in the middle of the text.
    'La cama de una plaza siempre será suficiente para mí',
    // Questions and answers are separated by the sidebar: one question lands
    // at the end of the interview and its answer is left under the wrong one.
    'Aprendamos a vivir disfrutando las ventajas de la soltería',
    // Pull quote spliced word-by-word, bullet list split across the frames.
    'Jesús mismo fue soltero: necesitan cuidado pastoral',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Enero|2010|Tema:|Por:|equipo editorial|Editora:|Tu iglesia local te envía)/i,
};
