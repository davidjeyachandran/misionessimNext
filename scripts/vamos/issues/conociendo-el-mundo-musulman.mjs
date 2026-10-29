/**
 * VAMOS — «Conociendo el mundo musulmán», febrero 2015
 * (revista 3gEIks52pc6W1iaxentdVO).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * 44 A4 pages in a dense two-column mosaic: body text at 11pt, a headline
 * set large above each item, and boxes, pull quotes and lists placed beside
 * and inside the columns. Several columns are single text frames that the
 * extractor cannot cut apart.
 */

/** 1 cover · 44 back cover. */
const skipPages = new Set([1, 44]);

const articles = [
  { title: 'Más que sólo un tema, una realidad',            anchor: 'Los musulmanes ya son una realidad entre nosotros' },
  { title: 'p2 · notas de la redacción y datos de contacto', anchor: 'Conexiones” es un material de estudio' },
  { title: 'Luz para el mundo musulmán',                    anchor: 'Los musulmanes no piensan que el Islam comenzó' },
  { title: 'Un vistazo rápido al Islam',                    anchor: 'La palabra Islam significa' },
  { title: 'Las principales divisiones del Islam',          anchor: 'Sunitas' },
  { title: 'No todos los musulmanes son iguales',           anchor: 'Tenemos que entender que los musulmanes son diferentes' },
  { title: 'Soy musulmán, y no soy terrorista',             anchor: 'De hecho, la ley religiosa islámica ordinaria' },
  { title: 'Las cinco creencias del Islam',                 anchor: '1. Alá, un dios, el creador' },
  { title: 'El Corán y la Biblia',                          anchor: 'Para los musulmanes el Corán es la guía' },
  { title: 'Ramadán: la “Navidad” musulmana',               anchor: 'En Ramadán se celebra las primeras revelaciones' },
  { title: 'p6 · segunda columna de «El Corán y la Biblia»', anchor: 'Los musulmanes no entienden el Corán' },
  { title: 'p6 · segunda columna de «Ramadán»',             anchor: 'durante el Ramadán. Todos los musulmanes' },
  { title: '¿Es Alá, el Dios verdadero?',                   anchor: 'Alá tiene 99 nombres' },
  { title: '¿Quién es Jesús (Isa al Masih) en el Islam?',   anchor: '1) Jesús es sólo un profeta' },
  { title: 'Entendiendo las barreras',                      anchor: '• Un sentimiento de superioridad' },
  { title: 'Mitos de los musulmanes hacia los cristianos',  anchor: '1. Todo occidental es cristiano desde que nace' },
  { title: '¿Por qué alcanzar a los musulmanes?',           anchor: 'El mayor problema de' },
  { title: '10 razones para amar a los musulmanes',         anchor: '1. Dios ama a los musulmanes' },
  { title: 'Todo comienza con un «Heme aquí» genuino',      anchor: 'Alcanzar a los perdidos comienza con una decisión' },
  { title: 'Factores que hacen que los cristianos no compartan su fe', anchor: 'escribe y se muestra en las noticias' },
  { title: 'Yendo al mundo musulmán',                       anchor: 'Cuando vayas al campo, habrá situaciones diversas' },
  { title: 'Se busca: gente ordinaria para un trabajo extraordinario', anchor: 'Los obreros tienden a ser un grupo de gente tenaz' },
  { title: '¿Estoy listo…?',                                anchor: 'El Dr. Jonathan Lewis, autor de libro' },
  { title: 'El perfil de obrero',                           anchor: 'En cuanto al perfil del candidato obrero' },
  { title: 'p18 · caja «visión misionera»',                anchor: 'Así como nosotros, hace más de 2000 años' },
  { title: 'Un envío responsable',                          anchor: 'La labor de la iglesia no acaba sólo con enviar' },
  { title: 'La iglesia debe tener en cuenta algunas cosas', anchor: 'Lupe, sirviendo en España' },
  { title: 'Seguridad en el campo',                         anchor: 'La seguridad es un Ser un obrero' },
  { title: 'Seguridad desde el campo',                      anchor: 'Hoy en día, el obrero debe en muchos casos mantenerse' },
  { title: 'Protegiendo mi seguridad virtual',              anchor: '• Correos electrónicos no cifrados' },
  { title: 'La iglesia ayuda en la seguridad',              anchor: 'Las iglesias enviadoras necesitan' },
  { title: 'Lo que sí puedes hacer',                        anchor: 'Llegó un tiempo donde empecé a recibir obreros' },
  { title: 'Tres clamores',                                 anchor: 'CLAMOR significa un ardiente llamado' },
  { title: 'Un pueblo lleno de temor',                      anchor: 'Muchos de quienes escriben sobre el tema del Islam' },
  { title: 'Dios me parecía tan lejano',                    anchor: 'Más a todos los que lo recibieron' },
  { title: 'Donde Cristo ya no es anunciado',               anchor: 'Un total de 54 millones de musulmanes' },
  { title: 'p18 · fragmento de infografía',               anchor: 'Sólo existen Dos grandes grupos' },
  { title: '5 cosas que debes saber de los musulmanes',     anchor: '1. No puedes ser un buen musulmán' },
  { title: 'A la vuelta de la esquina',                     anchor: 'Es mediodía y te encuentras caminando' },
  { title: 'Mezquitas en Latinoamérica',                    anchor: 'En todas las capitales y ciudades de Latinoamérica' },
  { title: 'Islam en Latinoamérica',                        anchor: 'Las estadísticas dicen que hay más de 5 millones' },
  { title: 'Latinos musulmanes',                            anchor: '• Son todos aquellos latinos convertidos' },
  { title: 'Ventajas de alcanzar a los musulmanes en Latinoamérica', anchor: 'Dios quiere usarnos para alcanzar a los musulmanes' },
  { title: 'Construyendo puentes',                          anchor: '1. Siempre empiece por la oración' },
  { title: 'Contacto cercano',                              anchor: 'La manera más efectiva para ayudar' },
  { title: 'Próxima islamización: Latinoamérica',           anchor: 'América Latina parece ser el' },
  { title: 'Los 10 mandamientos para compartir tu fe con los musulmanes', anchor: '1. Use la Palabra de Dios' },
  { title: 'Mentira y verdad, no crean media verdad',       anchor: 'Nos dicen: “Hoy en día la mayoría de latinos' },
  { title: 'Siendo un embajador de Cristo',                 anchor: 'Un embajador representa a un país' },
  { title: 'El método del camello',                         anchor: 'Existe un método de presentación del Evangelio efectivo' },
  { title: 'Nos casamos y se vuelve cristiano…',            anchor: 'Han pasado algunos casos en el campo' },
  { title: '¿Sabías que el nombre de bebé más popular es…?', anchor: 'Mahoma (en todas sus variantes' },
  { title: 'Más que apologética es experimentar el amor de Dios', anchor: 'Nací en una familia con 2 culturas' },
  { title: 'No es un juego',                                anchor: 'Me encontraba liderando un grupo de latinos' },
  { title: 'Dejé el Islam porque estudié la vida de Mahoma', anchor: 'Nabeel Qureshi fue un ex musulmán devoto' },
  { title: 'Dios es amor cercano',                          anchor: 'Para los musulmanes la perspectiva de Dios' },
  { title: 'Discipulado, la pieza faltante',                anchor: 'El discipulado es mucho más que predicar' },
  { title: 'Más que sueños',                                anchor: 'Cada vez más musulmanes relatan sueños' },
  { title: 'Estate siempre preparado para responder',       anchor: 'A menudo, a pesar de nuestros mejores esfuerzos' },
  { title: 'Cuando las piedras claman',                     anchor: 'Soy líder de jóvenes en mi iglesia local' },
  { title: 'Un viento sopla en la casa del Islam',          anchor: 'La obra que Dios está haciendo hoy entre los musulmanes' },
  { title: '¿Tienes la verdad? Entonces, compártela',       anchor: 'Me encontraba en la triple frontera' },
  { title: 'Panorama del Islam: teóricas y prácticas',      anchor: 'Vive una experiencia multicultural' },
  { title: 'Latinos al mundo musulmán',                     anchor: 'Hoy muchos musulmanes están llegando' },
  { title: 'Musulmanes llegan a Jesús como nunca antes',    anchor: 'Los musulmanes devotos rezan el sura 1' },
  { title: 'Un ritmo acelerado',                            anchor: 'En la providencia de Dios, hay una variedad' },
  { title: 'Comprando convertidos',                         anchor: 'Mientras aprendo más y más sobre el Islam' },
  { title: 'Oracaminantes por los musulmanes',              anchor: 'En los años recientes han surgido intercesores' },
  { title: '¿Se puede medir el impacto de una oración?',    anchor: 'Le estaba pidiendo a Dios que me enseñara' },
  // Listed first: a bare «Ora» would otherwise match the headline
  // «Oracaminantes por los musulmanes» on p35 before it reaches p36.
  { title: 'p35 · titular «Oracaminantes»',               anchor: 'Oracaminantes por los Musulmanes' },
  { title: 'p36 · infografía «Ora con fe, esperanza, amor»', anchor: 'Ora' },
  { title: 'Alcanzando a los hijos de Ismael con la oración', anchor: 'Un día salimos para nuestra caminata de oración' },
  { title: 'Se buscan discípulos profesionales',            anchor: 'Dios quiere usar tu profesión' },
  { title: 'Un «Like» por Jesús',                           anchor: '¿Sabías que el segundo país con más usuarios' },
  { title: 'El Evangelio tiene una app',                    anchor: 'Muchos musulmanes viven en Auburn' },
  { title: 'Donde la fe cuesta al máximo',                  anchor: 'Llevar el mensaje de salvación a los musulmanes' },
  { title: 'Detrás del velo, trabajando con mujeres',       anchor: 'Las mujeres obreras tienen grandes retos' },
  { title: 'La realidad de la mujer en el Islam',           anchor: '• Restricciones de Vestir' },
  { title: 'Ventajas de las obreras solteras',              anchor: 'La eficacia de las mujeres en misiones' },
  { title: 'Té de oración por mujeres musulmanas',          anchor: 'Dios ama a las mujeres musulmanas' },
  { title: 'Lágrimas al norte de África',                   anchor: 'Era un viernes cualquiera por la tarde' },
  { title: 'Errores al tratar de llegar a los musulmanes',  anchor: 'El Islam no es sólo una religión' },
  { title: 'p43 · recursos',                                anchor: 'Bibliotecas (Una lista de recursos' },
];

export default {
  revistaId: '3gEIks52pc6W1iaxentdVO',
  coverAssetId: '3sKyongGjAPDUczw5WkkHL',
  date: '2015-02-01',
  skipPages,
  rowPages: new Set([18, 35, 40]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p43 · recursos',
    'p6 · segunda columna de «El Corán y la Biblia»',
    'p6 · segunda columna de «Ramadán»',
    // Bullet glyphs sit one item out of place, including mid-sentence («y • el
    // segundo importante»).
    'Un vistazo rápido al Islam',
    'p2 · notas de la redacción y datos de contacto',
    'p18 · caja «visión misionera»',
    'p18 · fragmento de infografía',
    'p35 · titular «Oracaminantes»',
    'p36 · infografía «Ora con fe, esperanza, amor»',
    // The «Sunitas…» sidebar continues into a second frame that lands in
    // the same article; isolated so the main text ends cleanly.
    'Las principales divisiones del Islam',
    // Words from sidebars and pull quotes run through the prose
    // («El mayor problema de La forma de alcanzarles…»).
    '¿Por qué alcanzar a los musulmanes?',
    // Starts mid-sentence: the list's lead-in and item labels are lost.
    'Factores que hacen que los cristianos no compartan su fe',
    // Competency grid: each cell is a frame of its own, so the rows read
    // as one run of unrelated phrases.
    'El perfil de obrero',
    // A photo caption («Lupe, sirviendo en España») is fused to the first
    // sentence and a pull quote is cut off mid-quote.
    'La iglesia debe tener en cuenta algunas cosas',
    // Three columns of prose interleaved word by word.
    'Seguridad en el campo',
    // Sub-headings («Un clamor que viene del infierno») are spliced into
    // the text and two pull quotes are interleaved.
    'Tres clamores',
    // A pull quote is cut into the middle of a quoted paragraph.
    'A la vuelta de la esquina',
    // Trait order is scrambled across a box and the «Un embajador de Cristo
    // es…» labels are lost.
    'Siendo un embajador de Cristo',
    // Each answer is detached from its objection, whose heading is lost.
    'Estate siempre preparado para responder',
    // Ad for a course, with pull quotes interleaved word by word.
    'Panorama del Islam: teóricas y prácticas',
    // Four columns of prose and pull quotes interleaved.
    'Se buscan discípulos profesionales',
    'Donde la fe cuesta al máximo',
    // Two-column table: the paired cells alternate line by line.
    'La realidad de la mujer en el Islam',
    // Point 1's label lands after the ministries list; that list is run
    // into the middle of the article.
    'Errores al tratar de llegar a los musulmanes',
  ]),
  /** Second item on a page whose only photograph belongs to the first. */
  coverHero: new Set([
    'Dios me parecía tan lejano',
    'Los 10 mandamientos para compartir tu fe con los musulmanes',
    'No es un juego',
    'Alcanzando a los hijos de Ismael con la oración',
  ]),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Conociendo el Mundo|Febrero|2015|Directora:|Equipo Editorial|VAMOS,)/i,
};
