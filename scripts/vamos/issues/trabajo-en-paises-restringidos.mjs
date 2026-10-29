/**
 * VAMOS — «Trabajo en países restringidos», agosto 2012
 * (revista 3NgkuPGioh0mfeXEazmbhi).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A 10-page A4 issue (pp. 2-11), one headline per page, two-column body with pull quotes and sidebars.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Una oración peligrosa', anchor: 'Cansado de sus miedos como misionero en Paquistán' },
  { title: 'Una iglesia que lucha por su fe', anchor: 'Estos países de acceso restringido al Evangelio' },
  { title: 'Mi religión me lo prohíbe', anchor: 'Hay tres grandes bloques religiosos' },
  { title: 'Los peligros en zonas restringidas al Evangelio', anchor: 'Es tan delicado y complicado el tema de la' },
  { title: 'El poder que vence las tinieblas', anchor: 'El ambiente espiritual es cargado' },
  { title: 'Este misionero no va solo', anchor: 'Amada iglesia de Jesucristo, es importante' },
  { title: 'Padecer con un propósito', anchor: 'Hay más de 40 países en el mundo donde' },
  { title: 'Entrando creativamente: una puerta abierta', anchor: 'Dios está levantando una fuerza misionera' },
  { title: 'Aprender a amar', anchor: 'Estamos hablando de lugares donde la' },
  { title: 'Cuidado: peligro, peligro', anchor: 'Un misionero en un campo restringido necesita' },
];

export default {
  revistaId: '3NgkuPGioh0mfeXEazmbhi',
  coverAssetId: '63uhSf5ookTKLZjQTRwImy',
  date: '2012-08-01',
  skipPages,
  rowPages: new Set([]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Pull quote sits between «necesidades» and «y te protege del peligro», splitting a sentence.
    'El poder que vence las tinieblas',
    // Pull quote set into the middle of the bullet list and «Provéerles de cuidado integral» is cut from its explanation.
    'Este misionero no va solo',
    // Pull quotes and attributions spliced word by word into the first half («actividades ilegales de su»…).
    'Padecer con un propósito',
    // Pull quote words and the next headline run into the prose, and a sentence ends on a stray name.
    'Aprender a amar',
    // The «Las consideraciones de seguridad…» callout is inside the main text frame and breaks into stray paragraphs («Comunicación Integral del» / «Misionero.») at the tail; it cannot be isolated by anchor.
    'Cuidado: peligro, peligro',
  ]),
  coverHero: new Set(['Mi religión me lo prohíbe', 'Los peligros en zonas restringidas al Evangelio']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Agosto|2012|Tema:|Por:|Equipo Editorial|Directora:|La revista SIM tiene|Encontrarás muchos|misionessim\.org|Tu iglesia local te envía)/i,
};
