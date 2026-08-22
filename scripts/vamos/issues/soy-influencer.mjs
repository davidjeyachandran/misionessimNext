/**
 * VAMOS — «Soy influencer», marzo 2024
 * (revista 5a0GS4NP4NL3TTR7quEjVt).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected. Most of this edition is already published: 24 of
 * its articles came across in the WordPress migration and are listed in
 * `live` under their magazine headline.
 *
 * «Aprendiendo a convivir» is linked to this edition in Contentful but does
 * not appear in the PDF at all — checked by grep for Astrid Duarte and
 * Chortí, its subjects. Same case as «Consejos si NO quieres ser misionero»
 * in Envío responsable: written by the editor, not run in the magazine.
 */

/**
 * 1 cover · 3 TOC · 41 back cover.
 *
 * 4 sets its opening feature against a narrow pull-quote column that
 * interleaves with the body word by word; it is already live. 7 is a
 * statistics spread — every figure is its own frame and the pairing with
 * its label is lost.
 */
const skipPages = new Set([1, 3, 4, 7, 41]);

/** Already imported and published by hand — never touched by this import. */
const live = new Set([
  '5 razones para usar la nueva tecnología para evangelizar',
  '¿Influenciador o influenciado?',
  'El carácter determinará mi influencia',
  'Tu influencia: ¿Eres sal insípida?',
  'No siempre es un camino sencillo',
  'Tener una fe práctica',
  'Todo cristiano forma parte',
  'Los influenciadores en la Biblia',
  '¿Cómo sería el mundo sin la influencia de Mordecai Ham?',
  'Incomodando con nuestra fe',
  'Su influencia marcó la historia',
  'Lleno de Él, será inevitable influenciar',
  'Semillas de amor',
  'Inspirados a crear una agencia misionera',
  'Influencer: rapero, freestyler y pastor',
  'Consejos a los influencers',
  'Pasos para ser un influencer cristiano',
  'No necesita programa de la iglesia',
  'Llamados a ser una iglesia misionera',
  'Somos trigo y debemos multiplicarnos',
  'Llevando paz a nuestra comunidad',
  'La iglesia y su rol influenciador',
]);

const articles = [
  { title: 'Influencia al mundo para Cristo',               anchor: 'Como hijos de Dios, somos influenciadores para el Reino' },
  { title: 'Somos influenciadores',                         anchor: 'Vivimos en una época en donde la palabra' },
  { title: '¿Quién es un influencer?',                      anchor: 'Un influencer o influenciador es una persona activa en redes sociales' },
  { title: '5 razones para usar la nueva tecnología para evangelizar', anchor: '1. Las personas pasan cantidades significativas de tiempo absortos' },
  { title: '¿Influenciador o influenciado?',                anchor: 'Cuida lo que miras y escuchas' },
  { title: 'Maneras para ser influenciador de Cristo',      anchor: 'Aunque estamos viviendo en el mundo, nuestros ojos y corazones' },
  { title: 'El carácter determinará mi influencia',         anchor: 'No podemos perder de vista que Dios es el que da la influencia' },
  { title: 'Ustedes son la sal de la tierra',               anchor: 'La sal tiene muchos significados en la Biblia' },
  { title: 'Tu influencia: ¿Eres sal insípida?',            anchor: 'Somos nosotros los cristianos quienes debemos estar advertidos' },
  { title: 'No siempre es un camino sencillo',              anchor: 'Influenciar para Cristo no siempre es un camino sencillo' },
  { title: '¿Qué tienes en tus manos?',                     anchor: 'Los profesionales deben saber cómo honrar a Dios en la mayordomía' },
  { title: 'Quiero influenciar a las naciones',             anchor: 'Era joven cuando leí el libro' },
  { title: 'Jesús ingresó al mundo',                        anchor: 'Tenemos el maravilloso llamado de ser las manos y los pies de Cristo' },
  { title: 'Es el trato que tenemos para el prójimo',       anchor: 'El impacto es llegar al corazón de las personas a través de las enseñanzas' },
  { title: 'Tener una fe práctica',                         anchor: 'El propósito principal de que permanezcamos en esta tierra' },
  { title: 'Todo cristiano forma parte',                    anchor: 'La misión de todo cristiano es demostrar y extender el Reino de Dios' },
  { title: 'Los influenciadores en la Biblia',              anchor: 'Podemos imaginar el efecto dominó de la influencia' },
  { title: 'Ser ejemplo es influenciar',                    anchor: '• En palabra - que cuidemos nuestra boca' },
  { title: '¿Cómo sería el mundo sin la influencia de Mordecai Ham?', anchor: 'Quizás no te suena el nombre Mordecai Ham' },
  { title: 'Incomodando con nuestra fe',                    anchor: '¿Cuántas veces nos hemos encontrado envueltos en situaciones difíciles' },
  { title: 'Su influencia marcó la historia',               anchor: 'A lo largo de la historia del cristianismo se han levantado importantes líderes' },
  { title: 'Lleno de Él, será inevitable influenciar',      anchor: 'Solo podemos influenciar a otros cuando pasamos tiempo de calidad' },
  { title: 'Una mujer de influencia',                       anchor: 'La primera convertida en Europa, Lidia' },
  { title: 'Una mamá de gran influencia',                   anchor: 'Margaret Gowans fue una de las fundadoras de la agencia SIM' },
  { title: 'Una empleada doméstica rescató huérfanos',      anchor: 'La agencia misionera y el seminario le desanimaban a Gladys Aylward' },
  { title: 'Semillas de amor',                              anchor: 'El Señor nos ha hecho y nos está haciendo partícipes de la Gran Comisión' },
  { title: 'Cada día vive la Palabra',                      anchor: 'Juana de la Cruz es una mujer que quiere ver cambios en los niños' },
  { title: 'Misiones de tapa a tapa',                       anchor: 'Christopher Wright en su libro' },
  { title: 'Inspirados a crear una agencia misionera',      anchor: 'Aún recuerdo dónde estábamos sentados en mi oficina' },
  { title: 'Descubre tu vocación',                          anchor: 'Dios nos creó a cada uno de nosotros para tener una vocación' },
  { title: 'La influencia de Pablo en su sociedad',         anchor: 'El Señor le dijo: Ve, porque instrumento escogido me es este' },
  { title: 'Contra la corriente',                           anchor: 'Necesitamos ir contra la corriente de corrupción, soborno' },
  { title: 'Influencer: rapero, freestyler y pastor',       anchor: 'En medio de nuestras iglesias hay personas influenciando' },
  { title: 'Consejos a los influencers',                    anchor: 'Mi consejo lo resumo en 3 palabras' },
  { title: 'Que bajen la guardia',                          anchor: 'Yo uso el contenido en redes sociales para pre-evangelizar' },
  { title: '¡Soy influencer!',                              anchor: 'Estudia estos versículos sobre ser influencer' },
  { title: 'Pasos para ser un influencer cristiano',        anchor: 'Analiza tus motivaciones' },
  { title: 'Consejos para ser un buen influencer cristiano', anchor: '• Asegúrate de tener buena teología' },
  { title: 'Sé influencer ahora mismo',                     anchor: 'Hay un ministerio donde tú puedes ser influencer' },
  { title: 'p29 · Mordekai, continuación',                  anchor: 'Como uno de mis contenidos es de videojuegos' },
  { title: 'No necesita programa de la iglesia',            anchor: 'Fuera de las paredes y los programas de la' },
  { title: 'Una influencia desde hace 25 años',             anchor: 'El mes pasado, Gio Pineda, director de la oficina de envío' },
  { title: 'Ejemplo de influencia y envío de misioneros',   anchor: 'Y perseverando unánimes cada día en el templo' },
  { title: '¿Qué es una iglesia misionera?',                anchor: '• Es un pueblo de fe: confía en Dios' },
  { title: 'Llamados a ser una iglesia misionera',          anchor: 'La iglesia está llamada a ser misionera' },
  { title: '¿Qué le impide a una iglesia ser misionera?',   anchor: '• La iglesia es muy cerrada' },
  { title: 'Somos trigo y debemos multiplicarnos',          anchor: 'Es necesario que veamos la misión como parte de nuestra vida' },
  { title: 'Llevando paz a nuestra comunidad',              anchor: 'Tenemos un impacto en la comunidad, actualmente tenemos la asociación civil' },
  { title: 'Mi pastor me movilizó',                         anchor: 'Fue vital la influencia de mi pastor, Ramón Medina' },
  { title: 'Una iglesia que respiraba misiones',            anchor: 'Fui muchas veces a la iglesia de Edison Queiroz' },
  { title: 'Facilitemos cambios dignificantes',             anchor: 'La Fundación Gosén facilita cambios dignificantes en la calidad de vida' },
  { title: 'La iglesia es el vehículo',                     anchor: 'Una iglesia misionera es aquella que está cumpliendo el mandato' },
  { title: 'RUMBO a una Iglesia Misionera',                 anchor: 'Es un curso de orientación básica, para descubrir tu parte' },
  { title: 'La iglesia y su rol influenciador',             anchor: '1. ¿Cómo ser influenciadores de Cristo a nivel de iglesia?' },
  { title: 'No olvidemos nuestros adolescentes',            anchor: 'Hay que discipular a los adolescentes a desarrollar sus dones' },
  { title: 'Mitos y malentendidos sobre la Misión',         anchor: '¿Es hacer la misión de Dios a nuestra manera' },
  { title: 'Círculos de influencia de las familias misionales', anchor: 'Las familias pueden hacer misiones influenciando en sus círculos de vida' },
  { title: 'Cada discípulo tiene una misión',               anchor: 'Debemos apoyar a que el Evangelio sea proclamado en todo lugar' },
  { title: 'Consejos para ser un cristiano que influye en su entorno', anchor: 'Invierte en conversaciones profundas' },
];

export default {
  revistaId: '5a0GS4NP4NL3TTR7quEjVt',
  coverAssetId: '4ShkbF9vYL8wbp4J5vAQVt',
  date: '2024-03-01',
  skipPages,
  /** p20 runs a testimony across both columns above a second, shorter item. */
  rowPages: new Set([20]),
  live,
  articles,
  /** Anchored only to keep the live Mordekai interview's run-on out of p29. */
  dropArticles: new Set(['p29 · Mordekai, continuación']),
  /** Sidebars set beside an article that owns the page's only photograph. */
  coverHero: new Set([
    'Jesús ingresó al mundo',
    'Círculos de influencia de las familias misionales',
    'Consejos para ser un cristiano que influye en su entorno',
  ]),
  noHeroSkip: new Set(),
  /**
   * p13's photograph sits in the right column and belongs to the article
   * there, not the list beside it. p21 is an archive spread: every photo on
   * it is black and white, so all of them score as greyscale furniture and
   * the automatic pick falls through to a blank panel.
   */
  heroOverride: {
    'Es el trato que tenemos para el prójimo': 'doc-13_3.jpg',
    'Una mamá de gran influencia':             'doc-21_4.png',
  },
  furniture: /^(Ruth Huarote|Evelyn Subuyuj|Merari Garc[ií]a|Luigi Sarmiento|Geraldyne Velasquez|Ruth Lévano|Jessica Bastidas|Sociedad Internacional Misionera|Oficina de Latinoamérica|Desde el escritorio del equipo VAMOS|Tema: Soy influencer|La Misión de Dios es para que Sus hijos la vivan|Para dar una ofrenda|Revistas? recomendadas?|Recursos? recomendados?|Fuente:|Descarga todo el curso|Si deseas leer más|Comentario de un estudiante|Para reflexionar|Jesús se comunicó sin usar Powerpoint)/i,
};
