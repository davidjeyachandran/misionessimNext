/**
 * VAMOS — «Equipos multiculturales», junio 2023
 * (revista 6DRJSmhlrX3BYeMiJPdXoP).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected. This is the most heavily hand-published edition so
 * far: 25 of its articles are already live, so `live` carries most of the
 * manifest and only the remainder is imported.
 */

/** 1 cover · 3 TOC. */
const skipPages = new Set([1, 3]);

/** Already imported and published by hand — never touched by this import. */
const live = new Set([
  'Llevándose bien con otras culturas',
  'Cómo nos afectan las diferencias',
  'Barreras en la comunicación',
  'Unidos con un solo propósito',
  'Es un aprendizaje constante',
  'Climas diferentes',
  'Idiomas y su efecto en el equipo',
  'English for missions',
  'Aprendiendo a comunicarnos en un equipo intercultural',
  'Mi ministerio ha mejorado por trabajar en equipo',
  'Los estilos de liderazgo varían',
  'A liderar bien',
  'El equipo: tu familia extendida',
  '4 etapas en el desarrollo de un equipo de trabajo multicultural',
  'Dispuestos a considerar diferentes perspectivas',
  'Como un equipo en campo de juego',
  'Lo bueno y lo aprendido en un equipo multicultural',
  'Las diferencias pueden ser superadas',
  'Conflicto en el equipo',
  'Quitar prejuicios y tener el corazón de Dios',
  'Aprendiendo de las ofensas',
  'Un sentido de comunidad',
  'Por qué necesito otras culturas en mi equipo de plantación de iglesias',
  'Comunicar bien es amar',
  'Oración de la UNIDAD por los equipos multiculturales',
]);

const articles = [
  { title: 'La tensión y la bendición de equipos multiculturales', anchor: 'Los equipos en el campo misionero generalmente son multiculturales' },
  { title: 'Llevándose bien con otras culturas',            anchor: 'No es la primera vez que los latinos llegan tarde a la reunión' },
  { title: 'Trabajando en equipos multiculturales',         anchor: '1. El equipo multicultural muestra la belleza' },
  { title: 'Cómo nos afectan las diferencias',              anchor: 'Las diferencias culturales son frecuentemente reveladas en' },
  { title: 'Cada uno aporta con su cultura',                anchor: 'Sirviendo en el departamento de comunicaciones en el Logos Hope' },
  { title: 'No te quedes con la primera impresión',         anchor: 'En el primer año de servicio en el campo vi el lado humorístico' },
  { title: 'Barreras en la comunicación',                   anchor: 'Una de las principales barreras para los equipos multiculturales' },
  { title: 'Unidos con un solo propósito',                  anchor: 'Marvin Pirir y su familia sirven en República Dominicana' },
  { title: 'Consejos para los equipos',                     anchor: '• Entender que todos somos iguales delante de Dios' },
  { title: 'Los judíos aprendieron a trabajar juntos con otras culturas', anchor: 'Si leemos la historia de Hechos 11:19-20' },
  { title: 'Es un aprendizaje constante',                   anchor: 'Luis Gonzales, es del país de El Salvador y sirve en Asia' },
  { title: 'Etnocentrismo, estereotipos, suposiciones',     anchor: 'Un equipo multicultural encuentra dificultades mientras se forma' },
  { title: 'Favorece un mejor encaje',                      anchor: 'Es importante tener en cuenta las diferentes habilidades culturales' },
  { title: 'Latinos buscan formar comunidad',               anchor: 'Para los latinos ser equipo es más que solamente trabajar juntos' },
  { title: 'Climas diferentes',                             anchor: 'Culturas cálidas' },
  { title: 'La falta del idioma obstaculiza',               anchor: 'Si el misionero no está dispuesto a aprender' },
  { title: 'Idiomas y su efecto en el equipo',              anchor: 'Los idiomas son tan importantes como comer' },
  { title: 'English for missions',                          anchor: '(para nivel intermedio y avanzado)' },
  { title: 'Aprendiendo a comunicarnos en un equipo intercultural', anchor: 'La comunicación es una de las cosas más difíciles' },
  { title: 'Mi ministerio ha mejorado por trabajar en equipo', anchor: 'He visto cómo Dios usa las diferencias entre nuestras culturas' },
  { title: '“Uno para todos y todos para uno"',             anchor: '¿Recordamos este lema?' },
  { title: 'Los estilos de liderazgo varían',               anchor: 'Las culturas difieren en cuanto a la manera en que los líderes' },
  { title: 'A liderar bien',                                anchor: 'Recuerdo la primera vez que me desempeñé como gerente' },
  { title: 'Cómo mantener un equipo multicultural',         anchor: 'Todo inicia con la decisión de amar a otros' },
  { title: 'Características importantes',                   anchor: 'Flexibilidad y disposición' },
  { title: 'El equipo: tu familia extendida',               anchor: 'Al principio, al trabajar con un equipo tan multicultural' },
  { title: '4 etapas en el desarrollo de un equipo de trabajo multicultural', anchor: 'Dios me ha dado la oportunidad de servir en equipos multiculturales' },
  { title: 'Dispuestos a considerar diferentes perspectivas', anchor: 'Los latinos tienen varias habilidades naturales' },
  { title: 'Como un equipo en campo de juego',              anchor: 'Antes de venir al campo transcultural' },
  { title: 'Lo bueno y lo aprendido en un equipo multicultural', anchor: 'Cada cultura tiene su propia cosmovisión' },
  { title: 'Las diferencias pueden ser superadas',          anchor: 'Día a día podemos ver lo retador que puede ser trabajar en grupo' },
  { title: 'Somos más dados a las relaciones personales',   anchor: 'Por experiencias parecidas en nuestros pueblos' },
  { title: 'Trabajo en equipo forma carácter',              anchor: 'Siempre existen o deberían existir valores y prácticas' },
  { title: 'Orando en unidad',                              anchor: 'Al entender la importancia de la oración por las mujeres del islam' },
  { title: 'Conflicto en el equipo',                        anchor: 'No se trata de la tensión que puede pasar' },
  { title: '"Fui herida y yo herí"',                        anchor: 'Al parecer yo herí a algunos en algo' },
  { title: 'Saber dar y recibir las críticas',              anchor: 'Las críticas también son una gran causa de conflicto' },
  { title: 'Juzgando como si estuviese en contra de la Palabra de Dios', anchor: 'Los latinos no pueden comprender por qué los anglosajones' },
  { title: '¿Bíblico o cultural?',                          anchor: 'Este pequeño cuadro te dará unos ejemplos' },
  { title: 'Cada tensión no es solo sobre la cultura',      anchor: 'Nuestra personalidad es única, somos creados' },
  { title: 'Quitar prejuicios y tener el corazón de Dios',  anchor: 'Para trabajar bien en equipo, es importante reconocer nuestros prejuicios' },
  { title: 'Recuerda cómo quieres ser tratado',             anchor: 'Muchas veces sabemos las pautas bíblicas' },
  { title: 'Nuestra fortaleza es trabajar en equipo',       anchor: 'El trabajo en equipo es donde se refleja lo que cada uno ha vivido' },
  { title: '¿Cultura o carácter?',                          anchor: 'Como personas, tenemos nuestro trasfondo cultural' },
  { title: 'Aprendiendo de las ofensas',                    anchor: 'En mis inicios en el campo viví por 3 meses con mis colegas de Taiwán' },
  { title: 'Tratar abiertamente las diferencias culturales', anchor: 'Puede parecer obvio, pero hablar abiertamente sobre las diferencias' },
  { title: 'Superar la tensión con humildad',               anchor: 'Los inconvenientes que dan paso a las tensiones en un grupo' },
  { title: 'Un sentido de comunidad',                       anchor: 'La clave para la supervivencia de equipos multiculturales' },
  { title: 'No estamos para competir, sino para cooperar',  anchor: 'Dr. Joshua Bogunjoko, director internacional de SIM' },
  { title: 'Cómo preparar mejor a los latinos',             anchor: 'El obrero debe aferrarse al equipo de campo' },
  { title: 'Por qué necesito otras culturas en mi equipo de plantación de iglesias', anchor: 'Muchas de nuestras creencias culturales que consideramos' },
  { title: 'Comunicar bien es amar',                        anchor: 'Comunicarnos efectivamente es un acto de amor' },
  { title: 'Retos en el equipo',                            anchor: 'Gio del equipo de liderazgo de SIM Latinoamérica relata los retos' },
  { title: 'Superación mirando hacia la Cruz',              anchor: 'En estos casi veinte años de la Escuela Misionera Hechos 29' },
  { title: 'Aprender sobre ti mismo',                       anchor: 'Recomiendo que los candidatos lleven un curso' },
  { title: 'Oración de la UNIDAD por los equipos multiculturales', anchor: 'Cuando se acercaban los últimos días de Jesús en la tierra' },
];

export default {
  revistaId: '6DRJSmhlrX3BYeMiJPdXoP',
  coverAssetId: '7lQFLEDynreyBKOur6ensx',
  date: '2023-06-01',
  skipPages,
  /**
   * Each of these runs one article across both columns with a second item
   * or a pull quote below it, so the default column order files the
   * spread's right half inside whatever sits underneath.
   */
  rowPages: new Set([10, 19, 31]),
  live,
  articles,
  /**
   * p19's «Características importantes» is a two-column list of traits, each
   * label in its own frame; read either way the labels separate from the
   * text they introduce. Anchored to keep it out of «Cómo mantener un
   * equipo multicultural», then dropped.
   */
  dropArticles: new Set(['Características importantes']),
  /** p9's only photograph sits in the right column, with «Los judíos…». */
  coverHero: new Set(['Consejos para los equipos']),
  noHeroSkip: new Set(),
  heroOverride: {
    // Both pages set their lead photo in the right-hand column, close
    // enough to the left column's edge that the left article claims it
    // first and leaves its true owner with nothing.
    'Los judíos aprendieron a trabajar juntos con otras culturas': 'doc-9_4.jpg',
    'Favorece un mejor encaje': 'doc-11_3.jpg',
    // p17's automatic pick is clip art on white, which the saturation
    // measurement over-rewards (see the warning score.mjs prints).
    '“Uno para todos y todos para uno"': 'doc-17_4.jpg',
  },
  furniture: /^(Jessica Bastidas|Ruth Lévano|Ruth Huarote|Evelyn Subuyuj|Merari Garc[ií]a|Luigi Sarmiento|Elkin Useche|Andrés Mena|Geraldyne Velasquez|Cristhian Lopez|Sociedad Internacional Misionera|Oficina de Latinoamérica|Desde el escritorio del equipo VAMOS|Tema: Equipos Multiculturales|Cultivemos relaciones personales|Es la Iglesia qui[eé]n env[ií]a|\(foto de la portada|Para dar una ofrenda|Revistas? recomendadas?|Recursos? recomendados?|Video recomendado|Mira el video|Aprender una nueva lengua o cultura es un proceso|OM ofrece dos opciones distintas|Este manual fue creado|Todos los días recibirás un devocional|Confianza, cooperación, respeto uno por otro)/i,
};
