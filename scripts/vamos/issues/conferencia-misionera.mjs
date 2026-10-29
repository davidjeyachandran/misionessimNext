/**
 * VAMOS — «Conferencia misionera», febrero 2012
 * (revista 79EZ2WBP7IundSdVrpfDFp).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * An 10-page A4 issue (pp. 2-11), one headline per page, two-column body with pull quotes and sidebars.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Cuando tu amor por Cristo llega hasta las naciones', anchor: 'Es viernes por la noche' },
  { title: 'Ventajas de una conferencia misionera', anchor: 'Una conferencia misionera anual puede llegar' },
  { title: 'El éxito de una conferencia misionera', anchor: 'Una conferencia misionera que impacta a la' },
  { title: 'Los que ministran', anchor: 'Algo muy importante es que los expositores' },
  { title: 'Programando una conferencia misionera mundial', anchor: 'Luego de haber realizado los puntos' },
  { title: 'Eventos especiales durante la conferencia', anchor: 'Almuerzos o desayunos en la iglesia' },
  { title: 'p8 · pull quote Wick Jackson', anchor: '“La mejor manera de promocionar' },
  { title: 'Promocionando la conferencia misionera mundial', anchor: 'Los miembros de la iglesia deben saber' },
  { title: 'Conferencia misionera para levantar promesas de fe', anchor: 'Hay un tipo de conferencia misionera en la cual' },
  { title: 'Para que no se apague la llama', anchor: 'Uno de los grandes desafíos de la conferencia' },
  { title: 'Cómo impacta la conferencia misionera', anchor: 'Hay conferencia misioneras que son muy abiertas' },
];

export default {
  revistaId: '79EZ2WBP7IundSdVrpfDFp',
  coverAssetId: '6UQolJ0pjOyvdvakzO2KLN',
  date: '2012-02-01',
  skipPages,
  rowPages: new Set([]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Pull quote that opens p8 would otherwise land at the end of the p7 article.
    'p8 · pull quote Wick Jackson',
    // Two interleaved columns: sentences from the left and right column alternate mid-clause.
    'Promocionando la conferencia misionera mundial',
  ]),
  coverHero: new Set([]),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Febrero|2012|Tema:|Por:|Equipo Editorial|Directora:|La revista SIM tiene|Encontrarás muchos|misionessim\.org|Tu iglesia local te envía)/i,
};
