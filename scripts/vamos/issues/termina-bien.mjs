/**
 * VAMOS — «Termina bien», marzo 2023
 * (revista 2X331PI3mg1Pfe1mQVUGYe).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * This edition's `blogPosts` array is read by mi-movilicemos's «Regresando
 * a casa» learning route, so appending to it changes what that course
 * shows. David signed off on extending it, as he did for the dic 2023
 * edition.
 */

/**
 * 1 cover · 3 TOC · 34 back cover (no text frames).
 * 28 sets two columns inside a single frame, which the text layer reads as
 * one line alternating between them ("SIM tiene una aldea para jubilados
 * en a la comunidad. Muchos presos luchan con Sebring, Florida…").
 * 33's tributes put each name in a frame of its own on the far side of the
 * gutter from its text, so name and tribute cannot be paired.
 */
const skipPages = new Set([1, 3, 28, 33, 34]);

/** Already imported and published by hand — never touched by this import. */
const live = new Set([
  'Si estás respirando, tienes un Señor a Quien glorificar',
  'Ocho años para entender',
  'Y regresé…',
]);

const articles = [
  { title: 'Pasando la batuta',                             anchor: 'No se enseña tanto sobre ello en los seminarios' },
  { title: 'Cruzando la meta con fidelidad',                anchor: 'Acabar la carrera es cruzar la meta satisfactoriamente' },
  { title: 'La Palabra de Dios nos ayuda en la transición', anchor: 'Curiosamente cuando me tocó iniciar la transición' },
  { title: 'Si estás respirando, tienes un Señor a Quien glorificar', anchor: 'El entregar nuestras energías a Dios es una bendición' },
  { title: 'Dios va delante de ti',                         anchor: 'Es importante tener la seguridad de qué es lo que Dios' },
  { title: 'p5 · columna derecha',                          anchor: 'Vemos a lo largo' },
  { title: '¿Qué hace que termine bien?',                   anchor: 'Regularmente se piensa que se está terminando bien una etapa ministerial' },
  { title: 'Dejar a otros',                                 anchor: 'Yo serví por más de 10 años desde los 17' },
  { title: 'La disposición: clave para un liderazgo en transición', anchor: 'La vida es una transición continua' },
  { title: 'Dar paso a alguien “mejor” para la posición',   anchor: 'Aunque inicialmente fui contratado para ser pastor interino' },
  { title: 'Dejar la pista de baile',                       anchor: 'Es hora de partir porque mi propósito particular' },
  { title: 'Si todo está bien, ¿por qué me voy?',           anchor: 'En los primeros años bajo mi liderazgo' },
  { title: 'Se busca la comunicación sólida',               anchor: 'La sucesión casi siempre es una temporada caótica' },
  { title: 'Una carrera de relevos',                        anchor: 'Pensemos en el liderazgo como una carrera de relevos' },
  { title: 'p10 · testimonio de los Montoya',               anchor: 'Hace 6 meses hicimos una transición de EE.UU a Medellín' },
  { title: 'Sucesión, jubilación y fin del servicio',       anchor: 'Hablamos con Daniel Casese, misionero venezolano' },
  { title: 'Un ministerio saludable y longevo',             anchor: '1. Apartar tiempo para cultivar la adoración' },
  { title: 'Nuestra identidad NO está en nuestro ministerio', anchor: 'Los líderes cristianos a menudo conectan erróneamente su ministerio' },
  { title: '“Me siento como Caleb, la vida es emocionante”', anchor: 'Wally y Diana Cassellius han servido en México' },
  { title: 'Ocho años para entender',                       anchor: 'Didi es una misionera colombiana que estaba sirviendo en la India' },
  { title: 'El duelo es más que la pérdida de una vida',    anchor: 'Cuando una persona muere tenemos un funeral' },
  { title: 'La importancia de detenernos a evaluar y reflexionar', anchor: 'Hay que hacer nuestro propio análisis' },
  { title: 'No fuera de circulación, sino bajar las revoluciones un poco', anchor: 'El término “retiro” no es el más apropiado' },
  { title: 'Una buena despedida',                           anchor: 'Se trata de hacer que todo salga bien en mis relaciones' },
  { title: 'Mirando hacia el final',                        anchor: 'Las palabras de Pablo a los efesios golpean hasta hoy' },
  { title: '¿Por qué a veces no se termina bien?',          anchor: 'La realidad del servicio en el campo misionero es una sola' },
  { title: 'Y regresé…',                                    anchor: 'Cuando salí al campo enviada por mi iglesia' },
  { title: 'Pocos líderes finalizan bien',                  anchor: 'Solo un tercio de los líderes terminaron de forma correcta' },
  { title: '6 características de los líderes que terminan bien', anchor: '1. Cultivar la intimidad con Jesús' },
  { title: '10 cosas que matan el ministerio',              anchor: 'En el caminar cristiano uno aprende que hay ciertas cosas' },
  { title: 'Un liderazgo a la deriva',                      anchor: '¿Por qué no se reemplaza a los líderes ineficaces?' },
  { title: 'Finalizar Bien',                                anchor: 'Pablo podía decir' },
  { title: 'Cómo hacer una buena transición',               anchor: 'En términos generales no somos muy buenos en Latinoamérica' },
  { title: 'Pasando la posta',                              anchor: 'Las carreras de relevos en atletismo se realizan en equipos' },
  { title: 'Tu primer llamado: amar a Dios',                anchor: 'El llamado sigue siendo el mismo' },
  { title: 'Alabamos a Dios por el crecimiento en Latinoamérica', anchor: 'Les Unruhl ha servido con SIM durante unos 60 años' },
  { title: 'Cómo edificar sobre una base firme para una vida entera de ministerio', anchor: 'Cómo edificar sobre una base firme' },
  { title: 'Por qué un líder no termina bien',              anchor: 'Es importante que el mentor tenga muy en claro este tipo de barreras' },
  { title: 'Los años dorados dados al Señor',               anchor: 'Hoy en día los cristianos mayores que se están jubilando' },
  { title: 'Ejemplos en la Biblia',                         anchor: 'Dios sigue usando hombres y mujeres fieles, sin importar su edad' },
  { title: 'Los guerreros de oración',                      anchor: 'La oración es un elemento imprescindible para el ejercicio de la misión' },
  { title: 'Déjalos que enseñen a otros',                   anchor: 'Los adultos mayores tienen mucho para enseñar a los jóvenes' },
  { title: 'Movilizar a los adultos mayores',               anchor: 'Los adultos mayores son agentes preciosos de Dios' },
  { title: 'Tomando en cuenta las estaciones',              anchor: 'Rara vez tomamos en cuenta las temporadas de arar' },
  { title: '"No veo tu edad"',                              anchor: 'Dios un día me dijo' },
];

export default {
  revistaId: '2X331PI3mg1Pfe1mQVUGYe',
  coverAssetId: '4aYra4x9IE0kXCQd3oNygs',
  date: '2023-03-01',
  skipPages,
  /**
   * 13 and 25 each run an article across the spread with a second item
   * beside or below it; 29 sets a sidebar down the right of a page whose
   * article fills the left. Column order files the wrong half in each case.
   */
  rowPages: new Set([13, 25, 29]),
  live,
  articles,
  /**
   * Anchored only to keep their text out of the article before them:
   * p5's right column is a two-column frame the extractor could not cut;
   * p10's testimonio is a 119-word caption; «10 cosas que matan el
   * ministerio» and «Ejemplos en la Biblia» are lists whose items are set
   * one unnumbered heading per frame, so the short-frame rule takes the
   * headings and leaves the explanations unlabelled.
   */
  dropArticles: new Set([
    'p5 · columna derecha',
    'p10 · testimonio de los Montoya',
    '10 cosas que matan el ministerio',
    'Ejemplos en la Biblia',
  ]),
  /** Sidebars beside an article that owns the page's only photograph. */
  coverHero: new Set([
    'Pocos líderes finalizan bien',
    'Cómo edificar sobre una base firme para una vida entera de ministerio',
  ]),
  noHeroSkip: new Set(),
  heroOverride: {
    // p21's photograph sits in the right column, with «6 características».
    '6 características de los líderes que terminan bien': 'doc-21_10.jpg',
    // p27's only photograph is a full-measure banner, too wide to be picked.
    'Por qué un líder no termina bien': 'doc-27_4.jpg',
    // p32's right-hand photograph belongs to «"No veo tu edad"»; this
    // article's own portrait is the small one under its text.
    'Tomando en cuenta las estaciones': 'doc-32_3.jpg',
  },
  furniture: /^(Jessica Bastidas|Luigi Sarmiento|Ruth Lévano|Evelyn Subuyuj|Merari Garc[ií]a|Suzette Romero|Andrés Mena|Daniel Castoldi|Sonia Guevara|Zetta OK|Geraldyne Velasquez|Sociedad Internacional Misionera|Oficina de Latinoamérica|Desde el escritorio del equipo VAMOS|Tema: Terminando bien|La forma cómo entramos|Es la Iglesia qui[eé]n env[ií]a|Para dar una ofrenda|Revistas? recomendadas?|Recursos? recomendados?|Video recomendado)/i,
};
