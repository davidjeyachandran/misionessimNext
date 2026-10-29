/**
 * VAMOS — «Agencias misioneras», noviembre 2010
 * (revista 2Bx32e2BfaUeXUUuJwHcOz).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A four-page 2010 e-zine: a feature, an interview and agency profiles
 * whose questions are set as short frames, with sidebars and pull quotes
 * inside the measure.
 */

/** 3 is four agency interviews and profiles across two columns, with the questions as short frames. */
const skipPages = new Set([3]);

const articles = [
  { title: 'Facilitadores de envío',                          anchor: 'En un pequeño pueblo de un país del Asia' },
  { title: 'p1 · sidebar Cynthia Sundman y pull quotes',      anchor: 'C Mil veces' },
  { title: 'La iglesia y la agencia',                         anchor: 'Una buena agencia misionera debe ayudar' },
  { title: 'p2 · Ir al campo con la ayuda de una agencia y entrevista a Carlos Scott', anchor: 'Ir al campo misionero con la ayuda de una agencia' },
  { title: 'Un buen equipo y una buena agencia',              anchor: 'Por Douglas Christensen' },
  { title: 'p4 · lista Cómo escoger una agencia',             anchor: '• ¿Cuál es su reputación y trayectoria?' },
];

export default {
  revistaId: '2Bx32e2BfaUeXUUuJwHcOz',
  coverAssetId: '6KSGIlxCpMnwNsewZzbg7B',
  date: '2010-11-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p1 · sidebar Cynthia Sundman y pull quotes',
    // The «Ir al campo…» paragraph and the Carlos Scott interview are read
    // in the wrong order (the interview's questions are lost as short frames)
    // and the paragraph stops mid-sentence.
    'p2 · Ir al campo con la ayuda de una agencia y entrevista a Carlos Scott',
    // The checklist lost its heading «¿Cómo escoger una agencia misionera?».
    'p4 · lista Cómo escoger una agencia',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Noviembre|2010|Tema:|Por:|Directora:|equipo editorial|Tu iglesia local te envía)/i,
};
