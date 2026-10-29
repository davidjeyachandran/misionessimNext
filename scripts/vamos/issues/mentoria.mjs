/**
 * VAMOS — «Mentoría», mayo 2012
 * (revista 6JAZcyJG9F5oCdfxsKgS0W).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A 9-page A4 issue (pp. 2-10), one headline per page, two-column body with pull quotes and sidebars.
 */

/** 1 cover (image only) · 9 self-assessment score grid. */
const skipPages = new Set([1, 9]);

const articles = [
  { title: 'Transfiriendo vida', anchor: 'Fueron trece hombres que vivieron juntos' },
  { title: 'Así no lo hizo Jesús', anchor: 'Hay una gran diferencia en la manera' },
  { title: 'Más que palabras, vida', anchor: 'El apóstol Pablo dijo que el Evangelio' },
  { title: 'Nos falta seguimiento', anchor: 'Escuchamos con frecuencia que los misioneros' },
  { title: 'Tipos de mentores', anchor: 'Paul Stanley y Robert Clinton' },
  { title: 'Cambiando nuestra mentalidad', anchor: 'Para ser un buen mentor es necesario' },
  { title: 'Misioneros rinden cuentas', anchor: 'Generalmente el misionero no tiene' },
  { title: 'Poniendo el mentoreo en práctica', anchor: 'La red de agencias misioneras Corrientes' },
  { title: 'p10 · Manual interactivo ad', anchor: '• Creado exclusivamente por y para' },
];

export default {
  revistaId: '6JAZcyJG9F5oCdfxsKgS0W',
  coverAssetId: '6TkqkeU8LpMEucI40WuDfY',
  date: '2012-05-01',
  skipPages,
  rowPages: new Set([]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Pull quote set between «capacitados para una» and «labor sobrenatural», splitting a sentence.
    'Transfiriendo vida',
    // Two-column comparison (griego vs. hebreo) with the column headings lost, so the bullets are unattributed and one set is stranded at the end.
    'Así no lo hizo Jesús',
    // Pull quotes split two sentences mid-clause («pero vienen»…, «y firmeza» stranded).
    'Nos falta seguimiento',
    // Pull quote words («Antonio Pavón») spliced into the first paragraph and the next page's headline is run into the end.
    'Misioneros rinden cuentas',
    // House ad for the VAMOS manual, with its headline split across three frames.
    'p10 · Manual interactivo ad',
    // Human-thinking vs. Kingdom-values contrast table; its two columns are run together so the pairings are lost.
    'Cambiando nuestra mentalidad',
  ]),
  coverHero: new Set([]),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Mayo|2012|Tema:|Por:|Equipo Editorial|Directora:|La revista SIM tiene|Encontrarás muchos|misionessim\.org|Tu iglesia local te envía)/i,
};
