/**
 * VAMOS — «Idioma y cultura», septiembre 2022
 * (revista 5sMxIym3kyLD3SCtW6NFh).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * «La traducción bíblica y la multiculturalidad del cuerpo de Cristo» is
 * live under this edition but does not appear in this PDF at all (grep for
 * "inmortalidad de un pueblo" finds nothing) — written outside the
 * magazine, like «Aprendiendo a convivir» under *Soy influencer*.
 */

/** 1 cover · 3 TOC · 36 back cover (no text frames). */
const skipPages = new Set([1, 3, 36]);

/** Already imported and published by hand — never touched by this import. */
const live = new Set([
  '¿El inglés es necesario en todos los casos?',
  // Ran first in jun 2022 and is live under that edition as «10 razones
  // por las que necesitas saber inglés para servir en el campo».
  '¿Por qué necesito aprender inglés?',
  'Es un peligro no dominar el idioma',
  'Me anima a seguir practicando',
  '4 razones para aprender el lenguaje del corazón',
  '¿Por qué debemos conocer la cultura y su cosmovisión?',
  '¿Cómo aprender una nueva cultura?',
]);

const articles = [
  { title: 'Puentes lingüísticos y culturales',            anchor: 'La relación idioma-cultura es la columna vertebral' },
  { title: 'No lo veían tan necesario o relevante',        anchor: 'En realidad, suelen ser contados con los dedos de la mano' },
  { title: 'No tomes el camino fácil',                     anchor: 'Deberemos tener cuidado de no tomar el camino fácil' },
  { title: 'Aprendiendo inglés para servir',               anchor: 'Esforcémonos por dar lo mejor de nosotros al aprender' },
  { title: '¿El inglés es necesario en todos los casos?',  anchor: 'En la edición describimos cuán importante es aprender inglés' },
  { title: '¿Por qué necesito aprender inglés?',           anchor: 'Si piensas salir de Latinoamérica para servir a Dios' },
  { title: 'Saber comunicarse para no quedar aislada',     anchor: 'Sandra, obrera latina en Europa del Este' },
  { title: 'Esto es lo que cuesta',                        anchor: 'Cuando somos adultos, cuesta más por el trabajo' },
  { title: 'Los acentos son importantes',                  anchor: 'Un candidato debe estar expuesto a diferentes acentos' },
  { title: 'Es un peligro no dominar el idioma',           anchor: 'Aprender un nuevo idioma es un proceso necesario' },
  { title: 'Pautas para aprender el idioma',               anchor: 'Trabaja tu pronunciación' },
  { title: 'El aprendizaje de idiomas no es intravenoso',  anchor: 'El aprendizaje de idiomas no se realiza por vía intravenosa' },
  { title: 'La nueva generación de obreros sabe hablar inglés', anchor: 'Quiero compartir con ustedes sobre la importancia de invertir' },
  { title: 'Invirtamos en los obreros',                    anchor: 'Estar certificado es la manera en la que confirmamos' },
  { title: 'Inicia en tu propio país',                     anchor: 'Actualmente, existen muchas herramientas que nos facilitan' },
  { title: '“Envíame a otro país, allí voy a aprender”',   anchor: 'Estar inmerso en un idioma te ayudará a aprender mejor' },
  { title: 'Rompiendo mitos',                              anchor: 'Solemos pensar en que solo hay una forma de aprender algo' },
  { title: '¿Aprender o estudiar?',                        anchor: 'Aprender es adquirir la lengua para comunicar' },
  { title: '¿Cómo debo aprenderlo?',                       anchor: 'Te compartimos algunos consejos y recomendaciones' },
  { title: 'En otro idioma PUEDO',                         anchor: 'Marca las casillas en que sientes seguro' },
  { title: 'Me anima a seguir practicando',                anchor: 'Si hay personas que no conocen ni han oído de Jesús' },
  { title: 'Amarás más la misión',                         anchor: 'Las facilidades de las personas para aprender un idioma' },
  { title: 'Perfecciona tu inglés para el campo misionero', anchor: 'Los misioneros latinos en el campo nos dicen que debemos animar' },
  { title: 'p16 · anuncio del curso',                      anchor: '(para nivel intermedio y avanzado)' },
  { title: 'El inglés es básico',                          anchor: 'Para poder salir como misioneros a cualquier lugar' },
  { title: 'Mission Language',                             anchor: 'La inspiración es expandir el Reino de Dios usando el idioma inglés' },
  { title: 'p18 · directorio de institutos',               anchor: 'equipa a las personas interesadas en la misión cristiana' },
  { title: 'Un curso de inmersión en Rio Grande',          anchor: 'El Instituto Bíblico de Rio Grande, Texas' },
  { title: 'Invertir intencionalmente',                    anchor: 'Un candidato a misionero, que pretende aprender un nuevo idioma' },
  { title: 'Nunca es suficiente',                          anchor: 'En todo mi tiempo de preparación para salir al campo misionero' },
  { title: 'Campamento de inglés',                         anchor: 'Hace algunos años, hicimos un retiro en inglés' },
  { title: 'Mi experiencia como intérprete',               anchor: 'En mi tiempo como intérprete para grupos misioneros' },
  { title: 'Falta desarrollar el autoaprendizaje',         anchor: 'No es por el maestro ni por el alumno que los latinos' },
  { title: 'El Espíritu Santo actúa como traductor',       anchor: 'Si tu Dios es tan grande' },
  { title: 'Aprendiendo un idioma',                        anchor: 'Para ayudar en tu aprendizaje, compartimos algunos ítems' },
  { title: 'Es comunicación y también es ministerio',      anchor: 'Al misionero antropólogo Charles H. Kraft' },
  { title: 'El idioma abre puertas',                       anchor: 'El campo misionero está lleno de retos' },
  { title: '4 razones para aprender el lenguaje del corazón', anchor: '1. Los esfuerzos del lenguaje comunican amor' },
  { title: 'Hazlo una prioridad',                          anchor: 'Cuando vine a Sudáfrica hace 7 años' },
  { title: 'Hay que conocer tu manera de aprender',        anchor: 'Un matrimonio en Asia Central llegó con sus hijos pequeños' },
  { title: 'Iglesia: Apoya al candidato',                  anchor: 'Algunos pastores consideran que el aprendizaje de la cultura' },
  { title: 'Pastores: sus candidatos necesitan tiempo para el idioma', anchor: 'Piensa en cómo haces discípulos y compartes el Evangelio' },
  { title: 'Empezar con el idioma puente',                 anchor: 'A menudo, los trabajadores necesitan aprender más de un idioma' },
  { title: 'Más allá del idioma',                          anchor: 'Nuestro mundo nunca ha estado más conectado' },
  { title: 'Barreras para el aprendizaje de un idioma',    anchor: '1. Autoprotección' },
  { title: '¿Por qué debemos conocer la cultura y su cosmovisión?', anchor: 'Somos humanos, vivimos en una sociedad y pertenecemos a ella' },
  { title: 'Un manual para enseñar inglés a refugiadas',   anchor: 'Una apreciación más profunda de la cultura de la cual ellas provienen' },
  { title: 'No una pared sino una ventana',                anchor: 'Para ellos, el sonido es una ventana transparente' },
  { title: 'Hemos tenido éxito con esto',                  anchor: 'Un aspecto donde los latinos han tenido éxito' },
  { title: 'Convivir para conocerlos mejor',               anchor: 'La cultura es muy importante en las sociedades' },
  { title: '¿Cómo aprender una nueva cultura?',            anchor: 'Dios valora las culturas y nosotros debemos hacerlo también' },
  { title: 'Hay que adaptarse a la cultura',               anchor: 'Entender y adoptar la cultura es clave para la efectividad' },
  { title: 'Analizar valores',                             anchor: 'Existen cuatro maneras de considerar nuestros valores' },
  { title: '¿Cuál es tu cosmovisión?',                     anchor: 'La Prueba Cultural es una herramienta GRATUITA' },
];

export default {
  revistaId: '5sMxIym3kyLD3SCtW6NFh',
  coverAssetId: '6zflosrPg61Z9d4MBzWWeU',
  date: '2022-09-01',
  skipPages,
  /**
   * Each of these runs an article across the spread with a second item
   * below or beside it, so column order files the spread's right half in
   * the wrong place.
   */
  rowPages: new Set([4, 24, 34]),
  live,
  articles,
  /**
   * Anchored only to keep their text out of the article before them: p16's
   * right half is the «Perfecciona tu inglés» course advertisement, and
   * p18's left column is a directory of language schools, one name and one
   * address per frame.
   */
  dropArticles: new Set([
    'p16 · anuncio del curso',
    'p18 · directorio de institutos',
  ]),
  /**
   * p7 carries no photograph at all (its only full-width images are a rule
   * and a gradient) and p19 is a bar chart; the third is a sidebar beside
   * an article that owns the page's single photograph.
   */
  coverHero: new Set([
    'Saber comunicarse para no quedar aislada',
    'Invertir intencionalmente',
    'Hay que conocer tu manera de aprender',
  ]),
  noHeroSkip: new Set(),
  heroOverride: {
    // Each page's lead photo sits in the column of the article beside this
    // one, close enough to the gutter to be claimed first.
    'Inicia en tu propio país': 'doc-12_3.jpg',
    'El Espíritu Santo actúa como traductor': 'doc-23_3.jpg',
    // Wider than a candidate is allowed to be, or measured as greyscale —
    // this edition sets much of its photography in black and white.
    'Mission Language': 'doc-17_4.jpg',
    'Hazlo una prioridad': 'doc-26_3.jpg',
    'Barreras para el aprendizaje de un idioma': 'doc-29_4.jpg',
  },
  furniture: /^(Ruth Huarote|Ruth Lévano|Daniel Castoldi|Andrés Mena|Evelyn Subuyuj|Merari Garc[ií]a|Luigi Sarmiento|Luigi Zelote|Johanna Bernuy|Jessica Bastidas|Sociedad Internacional Misionera|Oficina de Latinoamérica|Desde el escritorio del equipo VAMOS|Tema: Idioma y cultura|Aprender el idioma nos inserta a una cultura|Es la Iglesia qui[eé]n env[ií]a|Para dar una ofrenda|Revistas? recomendadas?|Recursos? recomendados?|Cursos? recomendados?|Video recomendado|Todos los días recibirás un consejo|Taller en línea GRATIS|Algunas de las razones de por qué necesitas aprender inglés|COMENTARIOS? DE( LOS)? ESTUDIANTES|Conexion Training ofrece cursos en línea|Conoce más sobre la “Contextualización”|Mayor información de costos)/i,
};
