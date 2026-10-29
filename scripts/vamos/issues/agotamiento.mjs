/**
 * VAMOS — «Agotamiento», julio 2012
 * (revista 1V8VoUN2kFyVNdHFtCf5Id).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A 10-page A4 issue (pp. 2-11), one headline per page, two-column body with pull quotes and sidebars.
 */

/** 1 cover (image only) · 6 self-assessment questionnaire. */
const skipPages = new Set([1, 6]);

const articles = [
  { title: '¡Estás quemado!', anchor: 'Hace meses que sientes excesivo cansancio' },
  { title: '¿Me estará pasando a mí?', anchor: 'Sentirse cansado y no querer ir a trabajar' },
  { title: 'Adictos a la adrenalina', anchor: 'Adictos a la Adrenalina' },
  { title: 'Gran estrés, un factor detonante', anchor: 'El estrés es parte de la vida de toda' },
  { title: 'Misioneros reales', anchor: 'Los misioneros y líderes siempre están' },
  { title: '¡A combatir!', anchor: '• Toma descanso' },
  { title: 'El agotamiento no es un fracaso espiritual', anchor: 'Si estás sufriendo de agotamiento' },
  { title: 'Aprende a decidir ¡no!', anchor: '“El agotamiento es' },
  { title: 'Consejos para recuperarte', anchor: 'Los entrenadores saben' },
];

export default {
  revistaId: '1V8VoUN2kFyVNdHFtCf5Id',
  coverAssetId: '2kRB7DIzRemJBukHTrIeJd',
  date: '2012-07-01',
  skipPages,
  rowPages: new Set([]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Two-column text interleaved word by word with pull quote and the following headline.
    'Adictos a la adrenalina',
    // Pull quotes spliced into the prose and attributions run together at the end.
    'Gran estrés, un factor detonante',
    // Pull quotes and attributions interleaved word by word through the second half.
    'Misioneros reales',
    // Pull quote spliced into the middle of a sentence («Fácilmente en el»…).
    'El agotamiento no es un fracaso espiritual',
    // Bullet list is split by the VAMOS manual house ad, which also trails the list.
    'Consejos para recuperarte',
  ]),
  coverHero: new Set(['¡Estás quemado!']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Julio|2012|Tema:|Por:|Equipo Editorial|Directora:|La revista SIM tiene|Encontrarás muchos|misionessim\.org|Tu iglesia local te envía)/i,
};
