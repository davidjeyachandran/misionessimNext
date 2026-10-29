/**
 * VAMOS — «El llamado», mayo 2010
 * (revista 79KtPcPONxwNj9QqbBulDN).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A four-page 2010 e-zine: testimony and advice pieces with pull quotes
 * and sidebars set inside the measure.
 */

const skipPages = new Set([]);

const articles = [
  { title: 'Un desafío por cumplir',                          anchor: 'En el año 1995 viajaron a Cochabamba' },
  { title: 'Demos un vistazo a tu maleta',                    anchor: 'Imagina… vienes pre-empacado' },
  { title: '¡Una tarea para todos!',                          anchor: 'La misión es como un hospital' },
  { title: 'p2 · pull quote Hudson Taylor (izq.)',            anchor: 'Yo nunca diría' },
  { title: 'p2 · pull quote Hudson Taylor (der.)',            anchor: 'En un período difícil' },
  { title: 'Ten en cuenta',                                   anchor: 'El llamado misionero es un emocionante desafío' },
  { title: 'Rendirse jamás',                                  anchor: 'Si estás seguro(a) de tu llamado misionero' },
  { title: 'Visa para una misión',                            anchor: 'Doris estaba involucrada' },
  { title: '“Enfoquémonos en glorificar a Dios”',             anchor: 'Daniel, junto a su esposa e hija' },
  { title: 'p4 · links y masthead',                           anchor: 'Para bajar la revista SIM' },
];

export default {
  revistaId: '79KtPcPONxwNj9QqbBulDN',
  coverAssetId: '1uBwIXYVvMTVgMpnjwr4LX',
  date: '2010-05-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p2 · pull quote Hudson Taylor (izq.)',
    'p2 · pull quote Hudson Taylor (der.)',
    'p4 · links y masthead',
    // The pull quote «Nosotros no lo elegimos, Dios lo eligió» is run into
    // the second sentence, and the testimony's quotation is cut off.
    'Un desafío por cumplir',
    // The sub-headings «Habla acerca de misiones con el equipo pastoral»,
    // «Mira tu actitud» and «Es tu tarea» are lost, and a stray
    // «Testimonio:» trails the text.
    'Rendirse jamás',
    // The sidebar quote is spliced word by word into the last paragraphs.
    'Visa para una misión',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Mayo|2010|Tema:|Por:|Dios sólo tuvo|equipo editorial|Editora:|Tu iglesia local te envía)/i,
};
