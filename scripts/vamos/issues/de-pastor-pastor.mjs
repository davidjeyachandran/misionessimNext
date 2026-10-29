/**
 * VAMOS — «De pastor a pastor», marzo 2012
 * (revista 4eFBwitLfuDdhL568mjfys).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A 9-page A4 issue (pp. 2-10), one headline per page, two-column body with pull quotes and sidebars.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'La importancia del pastor en las misiones', anchor: 'Cuando terminé el seminario tenía dos ideas' },
  { title: 'Primero y solo Jerusalén', anchor: 'Es muy común escuchar a los pastores decir' },
  { title: 'Cuando el pastor no está motivado por misiones', anchor: 'Es común encontrar en muchas iglesias' },
  { title: 'El pastor, las finanzas y las misiones', anchor: 'El pastor Wilhan Gomes, dice que cuando' },
  { title: 'La falta de recursos no es excusa', anchor: 'Siendo honestos, podemos decir que pensar' },
  { title: 'Testimonios de pastores en misiones', anchor: '“Siempre planté varias iglesias con una visión' },
  { title: 'p7 · sidebar bullet list', anchor: '• Que me visite en el campo' },
  { title: 'Cómo irán si no hay quien los envíe', anchor: 'Hay muchos que no tienen apoyo de sus pastores' },
  { title: 'Pasos para que su iglesia haga misiones', anchor: 'Cuando el Pastor Edison Queiroz predica' },
  { title: 'Ánimo y desafío de pastor a pastor', anchor: '“Estoy pastoreando una iglesia donde estamos enseñando' },
  { title: 'p10 · masthead and trailing quote', anchor: 'La revista SIM tiene varios temas' },
];

export default {
  revistaId: '4eFBwitLfuDdhL568mjfys',
  coverAssetId: '5HQwAIzeMleNwUZEFcj03A',
  date: '2012-03-01',
  skipPages,
  rowPages: new Set([]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // A sentence breaks mid-clause where the sidebar pull quote is set into it, and the pull quotes are interleaved with the prose.
    'La importancia del pastor en las misiones',
    // Opening is a fragmented two-column splice («Ps. Alfredo Valencia» caption in the first sentence), and the page-5 headline is run into the end.
    'Cuando el pastor no está motivado por misiones',
    // Starts with the tail of the p4 article spliced onto its own first paragraph.
    'El pastor, las finanzas y las misiones',
    // The six «Paso N:» step labels are lost, so the list reads as unlabelled paragraphs.
    'Pasos para que su iglesia haga misiones',
    // Bullet list whose lead-in question is lost, so it reads as unattributed.
    'p7 · sidebar bullet list',
    // Masthead block spliced between two testimonial quotes.
    'p10 · masthead and trailing quote',
  ]),
  coverHero: new Set(['Testimonios de pastores en misiones']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Marzo|2012|Tema:|Por:|Equipo Editorial|Directora:|La revista SIM tiene|Encontrarás muchos|misionessim\.org|Obed Cruz en un|Tu iglesia local te envía)/i,
};
