/**
 * VAMOS — «Fondos misioneros», diciembre 2022
 * (revista 6DZPuxoeSBw2rnUvhAhdTY).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 */

/**
 * 1 cover · 3 TOC · 43 back cover (no text frames).
 * 39 sets two columns inside a single frame, so the text layer reads one
 * line alternating between them ("Cuando un misionero apoyo mensual llegue
 * decide salir a un a tiempo…").
 */
const skipPages = new Set([1, 3, 39, 43]);

/** Already imported and published by hand — never touched by this import. */
const live = new Set([
  'Cambiando nuestro pensamiento sobre la generosidad',
  'Discipulando a los dadores',
  'No hay recursos',
  '¿Cómo movilizar a las personas a dar para las misiones?',
  'Uniendo fuerzas para enviar misioneros',
  'A Dios le importa más tener el 100% de mi corazón que darme el 100% de mi sustento',
  'Ningún lugar de América Latina es tan pobre como para no ofrendar',
]);

const articles = [
  { title: 'Buscando soluciones',                           anchor: 'Nuestro lema este año con la movilización y comunicación de SIM' },
  { title: 'Haciendo mucho con poco',                       anchor: 'El dinero es casi siempre lo primero que viene a la mente' },
  { title: 'La base es la Biblia',                          anchor: 'La verdad es que debemos poner todo en perspectiva del Reino de Dios' },
  { title: 'Invirtiendo en lo último de la tierra',         anchor: 'Siempre dejamos lo mínimo para la obra de Dios' },
  { title: 'El 15% de lo que Jesús habló fue sobre dinero y posesiones', anchor: 'Si tu iglesia siguiera este ejemplo' },
  { title: 'La generosidad nos destaca',                    anchor: 'La primera parte de Éxodo 35 hace una referencia a la generosidad' },
  { title: 'Camino de generosidad',                         anchor: 'Generosity Path es una red de todo el mundo' },
  { title: 'Cambiando nuestro pensamiento sobre la generosidad', anchor: 'Damos un porcentaje Cuando le he dado el 10% a Dios' },
  { title: 'IGLESIA: refleja a Cristo',                     anchor: 'Como parte de la Grey somos miembros del Cuerpo de Cristo' },
  { title: 'Empieza conmigo',                               anchor: 'Uno de los problemas es que muchas veces nosotros no hemos participado' },
  { title: 'Pastor a pastor: así la iglesia crece',         anchor: 'Nosotros debemos entender que somos la fuerza local' },
  { title: 'Un desafío imperativo',                         anchor: 'Dios nos ha llamado a proclamar las Buenas Noticias' },
  { title: 'Enviemos semillas al campo y en casa',          anchor: 'Es súper importante conectarse con la visión y la misión de Dios' },
  { title: 'Madurez espiritual',                            anchor: 'Necesitamos ayudar en el discipulado, enseñando a nuestros hermanos' },
  { title: 'Discipulando a los dadores',                    anchor: 'Estamos discipulando a los potenciales dadores' },
  { title: 'Es cuestión de amor',                           anchor: 'Las finanzas son una cuestión de amor' },
  { title: 'Invierte sin temor en el Reino',                anchor: 'Una de las mayores bendiciones que hemos encontrado en el proceso' },
  { title: 'Tiempo de guerra',                              anchor: 'En el Curso Perspectivas (Movimiento Cristiano Mundial)' },
  { title: 'Todos tenemos algo para dar',                   anchor: 'Aunque se piense que no hay nada para dar' },
  { title: 'Trajeron sus alcancías',                        anchor: 'Damos el curso Rumbo a una iglesia misionera' },
  { title: 'Hombres aprensivos a levantar fondos',          anchor: 'Los hombres ocupan la mayoría de los puestos ministeriales remunerados' },
  { title: 'No hay recursos',                               anchor: 'A lo largo de mi vida cristiana he oído muchas veces a líderes decir' },
  { title: '¡No somos pobres!',                             anchor: 'Tenemos manos para construir, animar y proveer' },
  { title: '¿Cómo movilizar a las personas a dar para las misiones?', anchor: '• Enseña principios y procedimientos de la mayordomía cristiana' },
  { title: 'Uniendo fuerzas para enviar misioneros',        anchor: 'Una red fraterna de iglesias en Perú se juntó hace 17 años' },
  { title: 'Unidos por la misión',                          anchor: 'Roger Vergara, pastor de ACYM Pueblo Libre, nos comparte algunos pasos' },
  { title: 'p19 · el ejemplo de Pablo con los corintios',   anchor: 'El apóstol Pablo, al dirigirse a los corintios' },
  { title: 'El dinero no es el enfoque',                    anchor: 'Nydia Schmidt ha sido parte del ministerio Wycliffe desde 1999' },
  { title: 'A Dios le importa más tener el 100% de mi corazón que darme el 100% de mi sustento', anchor: 'Cuando decidí servir en el ministerio a tiempo completo' },
  { title: 'Deben “vivir por fe”',                          anchor: 'Vivir por fe es confiar en que Dios proveerá' },
  { title: 'Pedir dinero y depender de Dios',               anchor: 'Levantar finanzas para mí siempre ha sido un reto' },
  { title: 'Mi primer socio es Dios',                       anchor: 'Después de haber entendido que levantar fondos es para llevar a cabo' },
  { title: 'Los que siguen en la batalla',                  anchor: 'Al salir del Ecuador como misioneros, Guy y Linda Muse' },
  { title: 'Pastor: entrena a los candidatos',              anchor: 'Las iglesias y/o agencias deben entrenar a los nuevos candidatos' },
  { title: 'Cómo van nuestras finanzas',                    anchor: 'Dios ha obrado por Su iglesia, por Su gente, y por ellos mismos' },
  { title: 'Falta de constancia y compromiso',              anchor: 'Hay casos en que iglesias prometen apoyarlos' },
  { title: 'Un promotor representa al misionero',           anchor: 'Algunas personas no pueden acercarse a otros y pedir apoyo financiero' },
  { title: 'Un cambio desde el corazón',                    anchor: 'El apoyo a los misioneros no es un tema nuevo' },
  { title: 'Levantar sustento es un asunto de Dios',        anchor: 'El curso basado en el libro "Pedido Divino"' },
  { title: 'Consideraciones de presupuesto',                anchor: 'Velamos por un fondo previsional de pensiones' },
  { title: 'Presupuesto promedio',                          anchor: 'Consultamos varias agencias misioneras acerca de un presupuesto promedio' },
  { title: 'Quetzales, colones y dólares',                  anchor: 'En 1996 cuando iniciamos el proceso de salida al campo misionero' },
  { title: 'Lo que nos hubiera gustado saber',              anchor: 'Todo candidato a misiones se encontrará en algún punto' },
  { title: 'No se trataba de mí',                           anchor: 'Elvira Lezameta es una peruana que salió en setiembre' },
  { title: 'Puntos para considerar al levantar finanzas',   anchor: 'Hay muchísimas estrategias, muchas maneras de hacerlo' },
  { title: 'Debes ser visible',                             anchor: 'No podemos recaudar fondos si no tenemos credibilidad con el pastor' },
  { title: 'Nadie me dijo cuánto dolería',                  anchor: 'Cuando decidí ser misionero, sabía que levantar fondos sería un trabajo duro' },
  { title: '¿Quién es la base?',                            anchor: 'La base para el levantamiento de fondos es la dependencia total en Dios' },
  { title: 'Esperar vale la pena',                          anchor: 'Se dice que el levantamiento de fondos es una de las partes más difíciles' },
  { title: 'La comparación no permite el contentamiento',   anchor: 'Una actitud que se disfraza a menudo es la de comparación financiera' },
  { title: 'Reunamos fondos con estrategia',                anchor: 'Mauricio Acuña regresó a Costa Rica para platicar directamente' },
  { title: 'Capacitación necesaria',                        anchor: 'Una observación importante fue el bajo porcentaje general de capacitación' },
  { title: 'Ningún lugar de América Latina es tan pobre como para no ofrendar', anchor: 'Sumpango es un pueblo' },
  { title: 'Mitos sobre finanzas en misión',                anchor: 'No debo hacer nada hasta no tener los fondos' },
  { title: 'Respondiendo con sabiduría y con el corazón',   anchor: 'Cuando se trata de levantar fondos para misiones' },
  { title: 'Dios sabe las necesidades',                     anchor: 'Recientemente tuvimos la oportunidad de experimentar nuevamente' },
  { title: '¡Comunícate con tus ofrendantes!',              anchor: 'Dios no ha llamado solo a individuos a las misiones' },
  { title: 'Manteniendo el apoyo una vez en el campo',      anchor: 'Conforme pasa el tiempo las iglesias y los hermanos van olvidando' },
  { title: 'Para durar en el campo',                        anchor: 'Desde un punto de vista práctico, el problema del factor de apoyo' },
  { title: '¿Puedo trabajar para mi sustento?',             anchor: '¡Por supuesto! Siempre y cuando utilices tu trabajo' },
  { title: 'p42 · motivos correctos y equivocados',         anchor: 'Motivos correctos' },
];

export default {
  revistaId: '6DZPuxoeSBw2rnUvhAhdTY',
  coverAssetId: '26u7XVJFre2xGffvKSBS9U',
  date: '2022-12-01',
  skipPages,
  rowPages: new Set(),
  live,
  articles,
  /**
   * Anchored only to keep their text out of the article before them: p19's
   * sidebar on Pablo and the Corinthians belongs to no headline; p28's
   * «Presupuesto promedio» is a price table, one figure per frame; p42's
   * «Motivos correctos» / «Motivos equivocados» are two-word labels above
   * their lists, and the short-frame rule takes the labels and leaves the
   * two lists reading as one.
   */
  dropArticles: new Set([
    'p19 · el ejemplo de Pablo con los corintios',
    'Presupuesto promedio',
    'p42 · motivos correctos y equivocados',
  ]),
  /** p33's only photograph belongs to «Esperar vale la pena». */
  coverHero: new Set(['La comparación no permite el contentamiento']),
  noHeroSkip: new Set(),
  heroOverride: {
    // This edition illustrates half its pages with stock cut-outs on white
    // — piggy banks, coin stacks, a globe on banknotes. They out-score the
    // page's real photographs (see the warning score.mjs prints), so the
    // photograph is named outright.
    'Tiempo de guerra': 'doc-13_3.jpg',
    'Trajeron sus alcancías': 'doc-15_5.jpg',
    'Los que siguen en la batalla': 'doc-23_7.jpg',
    'Cómo van nuestras finanzas': 'doc-24_4.jpg',
    'Falta de constancia y compromiso': 'doc-24_5.jpg',
    'Mitos sobre finanzas en misión': 'doc-37_5.jpg',
    // p35's photograph is black and white, which scores as greyscale.
    'Capacitación necesaria': 'doc-35_3.png',
  },
  furniture: /^(Ruth Lévano|Evelyn Subuyuj|Merari Garc[ií]a|Luigi Sarmiento|Johanna Bernuy|Jessica Bastidas|Suzette Romero|Ruth Huarote|Sociedad Internacional Misionera|Oficina de Latinoamérica|Desde el escritorio del equipo VAMOS|Tema: Fondos misioneros|Debemos ser realistas, transparentes|Es la Iglesia qui[eé]n env[ií]a|Para dar una ofrenda|Revistas? recomendadas?|Recursos? recomendados?|Cursos? recomendados?|Video recomendado|Es un ejercicio para mostrar que sí hay dinero|Este mes publicaremos contenido|El curso "RUMBO a una iglesia misionera" completo|Para más información o las personas interesadas|Juanita Vilchez, misionera peruana en Asia|Extraído y adaptado del Episodio|Estudia los cursos en línea|1\. Perspectiva bíblica)/i,
};
