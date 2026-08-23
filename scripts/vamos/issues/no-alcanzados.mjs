/**
 * VAMOS — «No Alcanzados», septiembre 2023
 * (revista ImjoFXjUDbBGF70tADbG8).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected. 24 of this edition's articles were published by
 * hand and are listed in `live`; several of them ran twice under different
 * titles (p22 as both «Barreras entre los no alcanzados» and «3 Barreras
 * que existen entre los no alcanzados», p24 twice likewise), which is why
 * `live` is shorter than the edition's post count.
 *
 * «Aprendiendo a convivir» (p31, Astrid Duarte among the Chortí) is live
 * but filed under *Soy influencer* in Contentful, not under this edition.
 * It is listed here so the import does not try to create a second copy.
 */

/** 1 cover · 3 TOC · 40 back cover (no text layer). */
const skipPages = new Set([1, 3, 40]);

/** Already imported and published by hand — never touched by this import. */
const live = new Set([
  'Le importa a Dios, nos debe importar también',
  '¿Por qué son No alcanzados?',
  'Dios está invitando a su iglesia a servir a musulmanes',
  'Un abrazo declara que tu presencia en mi vida es importante',
  '¿Por qué los obreros deben ser enviados a etnias aún no alcanzadas?',
  'COMIBAM realiza Segunda Consulta "Alcance Una Etnia"',
  'COMIBAM promueve alcanzando a las etnias no alcanzadas',
  'Dar con las dos manos',
  '¿Cómo llegamos a los pueblos no alcanzados del mundo?',
  'Un tercio de nosotros: no alcanzado',
  'Formar discípulos que leen los Evangelios',
  'Servir: No es una idea romántica',
  'Atreverse a interceder detrás del velo',
  'Barreras entre los no alcanzados',
  '¿Qué atrae a los musulmanes?',
  'Socios en el Evangelio',
  'Una tarea alcanzable: Más y mejor interés',
  'Niños que oran por pueblos sin Biblia',
  'Aprendiendo a convivir',
  'Círculo del silencio',
  'Romper el letargo y alcanzarlos',
  'Algunos obstáculos a superar',
  'Los niños en riesgo necesitan ser alcanzados',
]);

const articles = [
  { title: 'Los lugares fáciles ya han sido alcanzados',   anchor: 'Es asombroso y abrumador pensar que 4 de cada 10' },
  { title: 'Le importa a Dios, nos debe importar también', anchor: 'Vivimos en un mundo en el que la interconectividad' },
  { title: '¿Por qué hemos de terminar con la tarea?',     anchor: '• No porque es nuestro deber' },
  { title: 'Términos y definiciones',                      anchor: 'La Ventana 10/40 comprende una vasta' },
  { title: '¿Por qué son No alcanzados?',                  anchor: '¿Alguna vez has pensado por qué los no alcanzados' },
  { title: 'Nada es fácil, ni rápido',                     anchor: '• No hay Biblia en su idioma' },
  { title: 'Dios está invitando a su iglesia a servir a musulmanes', anchor: 'Escucha, capacítate, aprende, memoriza' },
  { title: 'Un abrazo declara que tu presencia en mi vida es importante', anchor: 'La cercanía depende de la cultura' },
  { title: '¿Por qué los obreros deben ser enviados a etnias aún no alcanzadas?', anchor: 'Los obreros deben ser enviados a etnias no alcanzadas, en primer lugar' },
  { title: 'COMIBAM realiza Segunda Consulta "Alcance Una Etnia"', anchor: 'Misioneros, pastores y líderes de organizaciones misioneras se reunieron' },
  { title: 'COMIBAM promueve alcanzando a las etnias no alcanzadas', anchor: 'Cada país con un grupo nacional de COMIBAM' },
  { title: 'Reconozcamos la tarea restante',               anchor: 'Allan Matamoros, sirviendo entre no alcanzados' },
  { title: 'Dar con las dos manos',                        anchor: 'Los No Alcanzados deben ser importantes para la iglesia' },
  { title: 'Dar nuestra vida en rescate por muchos',       anchor: 'La iglesia local puede desarrollar estrategias' },
  { title: '¿Cómo llegamos a los pueblos no alcanzados del mundo?', anchor: 'Jesús quiere que Su esposa, la Iglesia, crezca' },
  { title: 'Un tercio de nosotros: no alcanzado',          anchor: 'La Sra. Tovek es una persona no alcanzada' },
  { title: 'Formar discípulos que leen los Evangelios',    anchor: 'La preocupación que Jesús quiere que tengamos' },
  { title: 'Fe sobre el miedo',                            anchor: 'Se dice que Dios ha cerrado la puerta a Sudán' },
  { title: 'Un ejemplo de alguna Iglesia movilizada',      anchor: 'Edison Queiroz fue un gran movilizador' },
  { title: 'Rol de latinos con los No Alcanzados',         anchor: 'Los latinos tenemos ciertas ventajas' },
  { title: '1 de cada 7 cristianos es perseguido',         anchor: 'Los cristianos son perseguidos en muchas partes del mundo' },
  { title: 'Servir: No es una idea romántica',             anchor: 'Servir a Dios significa obedecer Su voluntad' },
  { title: 'Los no alcanzados ninivitas',                  anchor: 'La historia del profeta Jonás es un claro ejemplo' },
  { title: 'Atreverse a interceder detrás del velo',       anchor: 'En una conferencia del ministerio Manarah' },
  { title: 'El reto puede ser abrumador',                  anchor: 'Hay demasiada información que puede abrumarnos' },
  { title: 'Irlos a buscar',                               anchor: 'Hoy en el mundo budista estamos visitando un pueblo sin cristianos' },
  { title: 'Adoptar una etnia No Alcanzada',               anchor: 'Para este gran trabajo se tiene que trabajar en conjunto' },
  { title: 'Alcance Una Etnia (AUE)',                      anchor: 'Alcance Una Etnia es un compromiso a largo plazo' },
  { title: 'Barreras entre los no alcanzados',             anchor: 'Hay barreras o paredes que hacen difícil llevar el Evangelio' },
  { title: '¿Quién adopta y alcanza a una etnia?',         anchor: 'Hay muchos modelos diferentes para adoptar' },
  { title: 'Aprendí a esperar en acción',                  anchor: 'Nací en un hogar católico, en una pequeña ciudad de la selva peruana' },
  { title: '¿Qué atrae a los musulmanes?',                 anchor: 'En la investigación de Dudley Woodberry' },
  { title: 'Ningún lugar sin alcanzar',                    anchor: 'Ningún lugar sin alcanzar con el Evangelio, es una visión' },
  { title: 'Socios en el Evangelio',                       anchor: 'Cuando damos un paso atrás y echamos un buen vistazo' },
  { title: 'No es seguro, pero Dios nos envía',            anchor: 'Debemos ser cuidadosos al presentar el ir a los no alcanzados' },
  { title: 'Pero yo no siento el llamado',                 anchor: 'En una secuencia de tres “llamados”' },
  { title: 'Una tarea alcanzable: Más y mejor interés',    anchor: 'La movilización misionera ha logrado cambios en mi propia vida' },
  { title: 'Cómo movilizar para llegar a los No Alcanzados', anchor: 'A través de una conferencia:' },
  { title: 'El Evangelio en toda lengua: 5fish',           anchor: 'Las grabaciones de audio disponibles en 5fish' },
  { title: 'Niños que oran por pueblos sin Biblia',        anchor: 'Desde Alcanzando a toda Etnia en su Lengua' },
  { title: 'Los grupos étnicos fronterizos',               anchor: 'Los grupos étnicos fronterizos son etnias agrupadas' },
  { title: 'Aprendiendo a convivir',                       anchor: 'Astrid Duarte ahora dirige un proyecto misionero' },
  { title: 'Frontera Tailandia Myanmar',                   anchor: 'Casas quemadas, personas huyendo, bombardeos' },
  { title: 'Círculo del silencio',                         anchor: 'En México existe una región con el 1% o menos de Evangelio' },
  { title: '¡Envíanos misioneros!',                        anchor: 'La invitación está abierta para cualquier hijo de Dios' },
  { title: 'Lucas 10 en Acción',                           anchor: 'Como parte de la movilización para que más obreros lleguen' },
  { title: 'Romper el letargo y alcanzarlos',              anchor: 'Una entrevista con Jaqueline Fuenmayor' },
  { title: 'Puentes de misericordia',                      anchor: 'Equipos de profesionales han servido por más de 16 años' },
  { title: 'Alcanzando a los niños',                       anchor: 'Guatemala es un país multicultural y llevar el mensaje' },
  { title: 'Algunos obstáculos a superar',                 anchor: 'Venezuela, con una población total de 27.227.930' },
  { title: 'La vital necesidad de Biblias',                anchor: 'Si miramos a las poblaciones no alcanzadas es inevitable' },
  { title: 'Los niños en riesgo necesitan ser alcanzados', anchor: 'Abordamos a la misionera Francisca Viloria' },
  { title: '“Yo provoqué la persecución”',                 anchor: 'Aunque a veces no lo parezca, pequeñas acciones' },
];

export default {
  revistaId: 'ImjoFXjUDbBGF70tADbG8',
  coverAssetId: '3IteT6Sd7Yt4LEtwmUCHkx',
  date: '2023-09-01',
  skipPages,
  /** p35 runs two articles side by side, each one set across both columns. */
  rowPages: new Set([35]),
  live,
  articles,
  /**
   * p28's right half is a worksheet of ideas: every heading sits in its own
   * frame and the bullet markers of the first list sit in a frame of their
   * own, so the pairing is lost and the piece reads as run-together lists.
   * Anchored to keep it out of «Una tarea alcanzable», then dropped.
   */
  dropArticles: new Set(['Cómo movilizar para llegar a los No Alcanzados']),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  /**
   * Both pages carry one full-measure banner photograph and nothing else,
   * and a banner is too wide to be picked automatically.
   */
  heroOverride: {
    'Pero yo no siento el llamado': 'doc-27_4.jpg',
    '¡Envíanos misioneros!': 'doc-33_3.jpg',
  },
  furniture: /^(Jessica Bastidas|Ruth Huarote|Evelyn Subuyuj|Merari Garc[ií]a|Luigi Sarmiento|Geraldyne Velasquez|Cristhian Lopez|Daniel Castoldi|Sonia Gu[ee]?rvara|Ruth Lévano|Sociedad Internacional Misionera|Oficina de Latinoamérica|Desde el escritorio del equipo VAMOS|Tema: No Alcanzados|Hay que investigar, orar y tener una estrategia|Es la Iglesia qui[eé]n env[ií]a|Para dar una ofrenda|Revistas? recomendadas?|Recursos? recomendados?|Video recomendado|Descubre qué te falta hacer|Este manual fue creado|Muchos temas específicos para aprender|La Revista VAMOS y muchos otros materiales|Conoce más sobre la “Contextualización”)/i,
};
