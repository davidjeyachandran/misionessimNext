/**
 * VAMOS — «Antes de ir», enero 2013
 * (revista 4cPPJCbzIpOptczI2DJprG).
 *
 * A 12-page A4 issue, mostly one article per page in two columns, with
 * bullet lists and testimony pull quotes set inside the measure.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Él lo hizo antes de ser enviado',               anchor: 'Desde antes que los primeros seres humanos pecaran' },
  { title: 'Experimenta otra cultura antes de salir',       anchor: 'Muchos misioneros con experiencia, recomiendan' },
  { title: 'p3 · lista Antes de salir considera',           anchor: '• Adquirir destrezas para el idioma' },
  { title: 'p3 · ¿Qué me llevo?',                           anchor: 'Tenemos dos herramientas para ayudarte' },
  { title: 'Habilidades previas',                           anchor: 'Es importante que desarrolles algunas habilidades' },
  { title: 'Experiencias ministeriales en tu iglesia',      anchor: 'El misionero Eldon Porter que trabaja en alianzas' },
  { title: 'Evita estos errores frecuentes',                anchor: 'Toda nueva labor implica cierta inexperiencia' },
  { title: 'Consejos prácticos para cuidar tu seguridad personal', anchor: 'Antes de salir es importante que aprendas algunas cosas' },
  { title: 'Como en casa',                                  anchor: 'La adaptación al campo es un proceso largo' },
  { title: 'Considera durante el vuelo',                    anchor: 'Los Misioneros gastan mucho tiempo en aviones' },
  { title: 'p9 · Sin soltarlo ni un momento (apertura)', anchor: 'Si bien es cierto' },
  { title: 'Prepara a tus hijos para salir',                anchor: 'Si tienes una familia, tu cónyuge e hijos' },
  { title: 'p9 · titular Prepara a tus hijos', anchor: 'Prepara a tus Hijos para Salir' },
  { title: 'p9 · Sin soltarlo ni un momento (continuación)', anchor: 'sentía que de otra forma, no iba' },
  { title: 'El apoyo de la iglesia en tu proceso de salida', anchor: 'La iglesia que te envía, cumple un papel muy importante' },
  { title: 'Un compromiso a largo plazo',                   anchor: 'Si observas cómo se está desarrollando todo' },
  { title: 'Prepárate en desarrollar un carácter maduro',   anchor: 'Por falta de madurez en el carácter' },
  { title: 'Lo que harás estando allí',                     anchor: 'Primeramente no pienses en salir si tu llamado no está claro' },
  { title: 'p12 · anuncios del curso en línea',             anchor: 'Todas las revistas VAMOS están disponibles' },
];

export default {
  revistaId: '4cPPJCbzIpOptczI2DJprG',
  coverAssetId: '4GMfhIQpZAAMrBtOcuLMZv',
  date: '2013-01-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p12 · anuncios del curso en línea',
    // Right column of «Sin soltarlo ni un momento» lands after the article
    // below it; its opening is lost, so it is isolated and dropped.
    'p9 · Sin soltarlo ni un momento (apertura)',
    'p9 · titular Prepara a tus hijos',
    'p9 · Sin soltarlo ni un momento (continuación)',
    // Two-column bullet list of skills is split mid-item across the frames.
    'Habilidades previas',
    // Pull quote «A las 4 am llegué al…» spliced into a bullet.
    'Evita estos errores frecuentes',
    // Letter-spaced headline fragments and a name spliced into sentences.
    'Prepárate en desarrollar un carácter maduro',
    // Pull quote «Lo importante sería…» interleaved with the last paragraphs.
    'Lo que harás estando allí',
  ]),
  /** p10 carries no photograph, only background art. */
  coverHero: new Set(['El apoyo de la iglesia en tu proceso de salida', 'Un compromiso a largo plazo']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Enero|2013|Tema:|Por:|Equipo Editorial|Directora:|VAMOS, SIM|web:)/i,
};
