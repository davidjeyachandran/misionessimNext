/**
 * VAMOS — «Caballeros de Dios», octubre 2013
 * (revista 27PTU3FUUPcomz0gfRCSMm).
 *
 * A 16-page A4 issue in the 2013 newsletter layout: one or two articles per
 * page, with scripture boxes, pull quotes and testimony sidebars set
 * inside the measure.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Hombres de verdad',                             anchor: 'Cuando se acerca el día de las madres' },
  { title: 'La espada y su caballero',                      anchor: 'Todo caballero necesita un arma para la batalla' },
  { title: 'Tres características de un caballero de Dios', anchor: 'Hay muchos hombres de negocios, hombres de mundo' },
  { title: 'Siete elementos de un hombre de Dios',          anchor: 'La Valentía: Un hombre valiente' },
  { title: 'p4 · cita de Christian Richard',                anchor: 'Cuando pienso sobre ser un hombre de Dios' },
  { title: 'Hombres vencedores: destruyendo fortalezas',    anchor: 'El Encuentro de Varones en el Espíritu de Cristo' },
  { title: 'p5 · testimonio del Ps. Gaudencio Llantoy',     anchor: 'Fue una de las experiencias más hermosas' },
  { title: 'p5 · testimonio del Ps. Ruiz',                  anchor: 'El Señor trató de una manera directa' },
  { title: 'p5 · testimonio del Ps. Juan Rojas',            anchor: 'Participar en EVEC fue una tremenda bendición' },
  { title: 'Caballeros en el campo de batalla',             anchor: 'El ministerio “Libres en Cristo” se formó' },
  { title: 'p6 · La pornografía',                           anchor: '• Una de cada cuatro búsquedas en internet' },
  { title: 'p6 · testimonio de Rubén',                      anchor: 'Mi historia empieza cuando viajé' },
  { title: 'p6 · testimonio de Omar',                       anchor: 'Creí dejar el pecado cuando me casé' },
  { title: 'Renovando la armadura día a día',               anchor: 'Hace unas semanas conocí a una hermosa familia' },
  { title: 'Caballeros de Dios: renovando la armadura',   anchor: 'Vivimos en una época donde el activismo' },
  { title: 'p7 · cita de Hugo Leiva',                       anchor: 'Un hombre de Dios constantemente busca estar lleno' },
  { title: 'p7 · cita de Juan Guevara',                     anchor: 'Ser un hombre de Dios significa estar preparado' },
  { title: 'Libres del alcohol y el chamanismo',            anchor: 'Cuando la esposa de Zorig cayó gravemente enferma' },
  { title: 'p8 · cita de Ezequiel Marques',                 anchor: 'Ser un hombre de Dios es estar siempre vigilante' },
  { title: 'p8 · Test de adicción sexual',                  anchor: '•¿Ha' },
  { title: 'Jóvenes aceptan la responsabilidad',            anchor: 'Para mí, Marco Aldana' },
  { title: 'De rebelde a misionero',                        anchor: 'Me alejé de la iglesia a los 13 años' },
  { title: 'La prioridad más baja de la iglesia',           anchor: 'Hay más mujeres que hombres en las iglesias' },
  { title: '¿Cómo podemos lograr involucrar a los hombres en la iglesia?', anchor: '1) Una Iglesia bíblicamente saludable' },
  { title: 'Claves para un ministerio de varones fuerte en discipulado', anchor: 'Cinco Grupos Para Alcanzar' },
  { title: 'Sin duda, ni murmuraciones…',                   anchor: 'Como soldados, debemos siempre tener presente' },
  { title: 'Oremos por Siria',                              anchor: 'Sobre todo oremos por paz' },
  { title: 'El pastor vagabundo',                           anchor: 'El pastor Jeremías Steepek, se disfrazó' },
  { title: 'La iglesia sin paredes: vidas que cambian vidas', anchor: 'Juan Pablo Múnera pastor y fundador' },
  { title: 'Varones conforme al corazón de Dios',           anchor: 'Hay proyectos que nacen en el corazón de Dios' },
  { title: '¿Por qué los pastores siempre se ven perfectos?', anchor: 'Siempre se espera que los pastores' },
  { title: 'p16 · pie VAMOS, SIM',                          anchor: 'VAMOS, SIM' },
  { title: 'Hablando del pecado',                           anchor: 'Samuel trabaja con BCTI' },
];

export default {
  revistaId: '27PTU3FUUPcomz0gfRCSMm',
  coverAssetId: 'qTIhfTzFnYPA9IxdPaCtB',
  date: '2013-10-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p16 · pie VAMOS, SIM',
    'Hablando del pecado',
    // Pull quote «Un caballero…» is spliced into the first sentence.
    'La espada y su caballero',
    // Scripture boxes and the text of the page are interleaved word by word.
    'Tres características de un caballero de Dios',
    // Speaker's name «Marco Aldana» is spliced into the opening quote.
    'Jóvenes aceptan la responsabilidad',
    // The page's columns are read out of order and a stray «Ministerio de
    // Hombres:» header sits in the middle of the list.
    '¿Cómo podemos lograr involucrar a los hombres en la iglesia?',
    'La prioridad más baja de la iglesia',
    // Inline labels, plus a pull quote run into the last paragraph.
    'Claves para un ministerio de varones fuerte en discipulado',
    // Two-column interview quotes are interleaved line by line.
    'Sin duda, ni murmuraciones…',
    // The scripture quoted in the sermon is spliced into the author's
    // closing line.
    'El pastor vagabundo',
    // Three columns of Q&A alternate line by line.
    'La iglesia sin paredes: vidas que cambian vidas',
    // A sidebar label is spliced into a sentence and a paragraph breaks
    // mid-sentence.
    'Varones conforme al corazón de Dios',
    'Caballeros en el campo de batalla',
    'p4 · cita de Christian Richard',
    'p5 · testimonio del Ps. Gaudencio Llantoy',
    'p5 · testimonio del Ps. Ruiz',
    'p5 · testimonio del Ps. Juan Rojas',
    'p6 · La pornografía',
    'p6 · testimonio de Rubén',
    'p6 · testimonio de Omar',
    'p7 · cita de Hugo Leiva',
    'p7 · cita de Juan Guevara',
    'p8 · cita de Ezequiel Marques',
    'p8 · Test de adicción sexual',
  ]),
  /** A prayer sidebar on a page with no photograph. */
  coverHero: new Set(['Oremos por Siria']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Los Koivu$|Octubre|2013|Tema:|Caballeros$|Por:|Por Gino|Equipo Editorial|Directora:|VAMOS, SIM|web:)/i,
};
