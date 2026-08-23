/**
 * VAMOS — «Tu trabajo en el Reino», junio 2022
 * (revista 7jsU0ch5SDyXzAycENshGy).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * Three of this edition's seven live posts are not in this PDF: «El desafío
 * de compartir la fe como químico», «El envío de misioneros: una práctica
 * constante desde la iglesia primitiva», and «10 razones por las que
 * necesitas saber inglés para servir en el campo» — the last of which ran
 * in print three months later, in *Idioma y cultura* (sep 2022), where it
 * is listed as live so it is not imported twice.
 */

/** 1 cover · 3 TOC · 45 back cover (no text frames). */
const skipPages = new Set([1, 3, 45]);

/** Already imported and published by hand — never touched by this import. */
const live = new Set([
  'El trabajo: ¿bendición o maldición?',
  '¿Cómo ser sal y luz en tu trabajo?',
  '10 Devocionales en YouVersion sobre Trabajo y Fe',
]);

const articles = [
  { title: 'Comisionando a toda la congregación',          anchor: 'Los ministros profesionales a menudo ven el domingo' },
  { title: 'Sigue siendo la Iglesia en los días laborales', anchor: 'Jesús envía a Su Iglesia para ser sal y luz en cada lugar' },
  { title: 'El trabajo: ¿bendición o maldición?',          anchor: 'El trabajo forma parte de nuestra vida desde que Dios' },
  { title: 'La Iglesia dispersa de forma intencional',     anchor: 'En nuestra comunidad de fe tenemos hermanos jubilados' },
  { title: 'Ser de servicio a Dios',                       anchor: 'El deseo por servir a través de nuestra profesión' },
  { title: '“¡Qué trágico desperdicio de potencial humano!”', anchor: 'El 98 % de la iglesia no está equipada' },
  { title: 'No separes tu vida',                           anchor: 'Todo profesional debe aprender a través de la Palabra de Dios' },
  { title: 'Pueden tener un impacto',                      anchor: 'En Latinoamérica están entendiendo cada vez más la idea' },
  { title: 'Marcando la diferencia',                       anchor: 'En mi trabajo, he podido marcar la diferencia de ser cristiano' },
  { title: 'Avodah',                                       anchor: 'La palabra hebrea “avodah” se traduce como trabajo' },
  { title: 'Debes tener algo dentro de ti, si quieres que salga de ti', anchor: 'Profesionales: ¿cómo es tu vida devocional personal?' },
  { title: '¿DÓNDE ESTÁ DIOS EL LUNES?',                   anchor: 'La triste verdad es que gran parte de nuestra vida de iglesia' },
  { title: 'Características de un seguidor de Jesús',      anchor: 'Fidelidad – Alguien llegó a pensar que no hacía nada' },
  { title: 'Ser pacificador',                              anchor: 'En una ocasión, en un ambiente bien fuerte de discordia' },
  { title: '¿Cómo glorificar a Dios con mi trabajo?',      anchor: 'Cuando un creyente no tiene definido bíblicamente su cosmovisión' },
  { title: '¿Trabajo secular y ministerio cristiano?',     anchor: 'Una de las más grandes mentiras que hemos creído por años' },
  { title: 'El discipulado es hacer la vida juntos',       anchor: 'Mucha gente piensa que el discipulado es sentarse en un círculo' },
  { title: 'El trabajo a lo largo de las Escrituras',      anchor: 'A lo largo de la Biblia encontramos que el trabajo es creado por Dios' },
  { title: 'Levantando emprendedores en misión',           anchor: 'Los profesionales pueden ser un nexo para llegar a otros' },
  { title: 'Olvídate de la forma en que piensas sobre el evangelismo', anchor: 'Es necesario enseñar a las iglesias que el evangelismo se ve diferente' },
  { title: 'Dios puso su escritorio al lado tuyo',         anchor: 'Carla no conoce a Dios' },
  { title: 'Mostrando a Jesús más que un mensaje',         anchor: 'Los profesionales que contestaron una encuesta con 130 latinos' },
  { title: '¿Cómo ser sal y luz en tu trabajo?',           anchor: 'Nuestro lugar de trabajo es probablemente donde estamos la mayoría' },
  { title: 'No siempre la oración de un pecador',          anchor: 'En muchos casos, caminas junto a ellos y están llegando a la fe' },
  { title: 'Misión en el campo militar',                   anchor: 'Un trabajo como el militar presenta retos poco usuales' },
  { title: 'No es como mis abuelos',                       anchor: 'Empezar una horita feliz, evangelizar de casa en casa' },
  { title: 'Invítales a ver tu fe en acción',              anchor: 'Jesús dijo “venid y ved” a los primeros discípulos' },
  { title: 'El legado de un emprendimiento',               anchor: 'Desde hace un par de años, he escuchado del impacto' },
  { title: 'Los empresarios de la Biblia: Aquila y Priscila', anchor: 'Si hablamos de un ejemplo real de cómo hacer parte de la misión de Dios' },
  { title: 'Múdate: una vida encarnada',                   anchor: 'Múdate es un movimiento se trata de profesionales cristianos' },
  { title: 'Hacer una diferencia es fácil',                anchor: 'Luis Rodas y Liss de Rodas son socios fundadores de Grupo Macro' },
  { title: 'p24 · columna derecha revuelta',               anchor: 'somos mayordomos de todo esto que Dios nos ha dado' },
  { title: 'Apoyo a que emprenda',                         anchor: 'Compartiendo Conocimiento es una plataforma digital' },
  { title: 'Es una oportunidad para la iglesia',           anchor: 'Nosotros creemos que en el mercado es donde la iglesia necesita' },
  { title: 'Queremos que nos pastoreen y entiendan',       anchor: '• Que el enfoque no sea solo la iglesia local' },
  { title: 'Salir como soldados a la batalla',             anchor: 'Luis y Liss Rodas, matrimonio de empresarios, recuerdan' },
  { title: '¿Cómo mejorar la relación con tu Iglesia?',    anchor: 'Es una bendición para las Iglesias contar entre la grey' },
  { title: 'Me he sentido pastoreado',                     anchor: 'En mi caso, gracias a Dios, yo me he sentido pastoreado' },
  { title: 'Los profesionales también necesitan ser mentoreados', anchor: 'Tristemente las iglesias no aceptan la idea de apoyar' },
  { title: 'No hay una separación',                        anchor: 'Durante años he visto que no hay una separación' },
  { title: 'El papel de la iglesia',                       anchor: 'es discipular, equipar y liderar a cada miembro' },
  { title: 'Considera nuevo vocabulario para enseñar',     anchor: 'Necesitamos reconocer que es posible que sea necesario redefinir' },
  { title: 'Comisionarlos como enviados',                  anchor: 'Considere tener servicios de comisión para laicos' },
  { title: 'Cualquier profesión se presta para servir',    anchor: 'Muchos piensan que solo se puede servir a Dios si estudian' },
  { title: 'Oportunidades de ganar un salario en otro país', anchor: 'Actualmente aproximadamente unos 100 médicos están sirviendo con SIM' },
  { title: 'Círculos de sociedad para Cristo',             anchor: 'Eunice Rodiles fue misionera tradicional y levantó fondos' },
  { title: 'p34 · columna izquierda revuelta',             anchor: 'Las misiones Mostramos el Reino bivocacionales' },
  { title: 'Que nos entiendan',                            anchor: 'Sería bueno que los pastores entiendan la dinámica del misionero' },
  { title: 'Formando latinos para que usen su profesión',  anchor: 'FIT Global (Formación Integral de Trabajadores Globales)' },
  { title: 'p35 · recursos recomendados',                  anchor: 'Recursos por Phillip Walker y Renita Reed' },
  { title: 'Un brazo firme de misericordia',               anchor: 'Desde muy chico, Dios puso en su corazón un llamado para servir en África' },
  { title: 'Surgen nuevas formas de servicio',             anchor: 'Es importante tener siempre presente que el crecimiento y maduración' },
  { title: 'Intencionalidad en el campo',                  anchor: 'En países dentro del continente asiático es complicado pensar' },
  { title: 'Scatter Global',                               anchor: 'Creemos que firmemente que cada parte de ti fue diseñada' },
  { title: 'Mejor economía y fe',                          anchor: 'Alfredo, paraguayo, quien sirve en Asia con su negocio desde el año 2004' },
  { title: 'Ellos están deslumbrados por el español',      anchor: 'Hoy son cada vez más las personas que buscan aprender español' },
  { title: 'Una mente misional',                           anchor: 'Hace algunos años R. C. Sproul decía' },
  { title: 'Un profesor de español comparte su fe en Asia', anchor: 'La forma en que un creyente puede compartir sobre Jesús' },
  { title: 'Un concurso de villancicos en Asia',           anchor: 'Cuando comenzamos a trabajar como profesores de español' },
  { title: 'Posiciones con SIM',                           anchor: 'SIM espera colocar más profesionales en el campo misionero' },
  { title: 'Indicador crítico',                            anchor: 'El indicador crítico en tu llamado a ser profesional' },
  { title: 'En el camino es el ministerio',                anchor: 'Las personas “a lo largo del camino” eran parte integral' },
  { title: 'Tent International',                           anchor: 'Es una fraternidad de centros que movilizamos y equipamos' },
  { title: 'NER: Negocios en la Extensión del Reino',      anchor: 'El ministerio NER tiene por objetivo servir a la iglesia del Señor' },
  { title: 'Señorío en lo profesional/empresarial',        anchor: 'Hay muchos profesionales y empresarios que creen en el Señor' },
  { title: 'No solo se trata de finanzas',                 anchor: 'Las iglesias enviadoras tienen que sumarse a la visión global' },
  { title: '10 Devocionales en YouVersion sobre Trabajo y Fe', anchor: 'Negocios con Dios - 12 días' },
];

export default {
  revistaId: '7jsU0ch5SDyXzAycENshGy',
  coverAssetId: '7cuzRn4yxF2R3eGw8dEItD',
  date: '2022-06-02',
  skipPages,
  /**
   * Each of these runs an article across the spread with a second item
   * below it, so the default column order files the spread's right half
   * inside whatever sits underneath.
   */
  rowPages: new Set([25, 26, 35, 40, 44]),
  live,
  articles,
  /**
   * p24's right column and p34's left column each set two typeset columns
   * inside a single frame, which the text layer reads as one line
   * alternating between them; p35's right half is a list of resource links.
   */
  dropArticles: new Set([
    'p24 · columna derecha revuelta',
    'p34 · columna izquierda revuelta',
    'p35 · recursos recomendados',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Jessica Bastidas|Ruth Lévano|Johanna Bernuy|Ruth Huarote|Suzette Romero|Claudina Silva|Daniel Castoldi|Andrés Mena|Evelyn Subuyuj|Miriam Lagos|Merari Garc[ií]a|Cristhian López|Luigi Sarmiento|Luigi Zelote|Orlando Morales|Sociedad Internacional Misionera|Oficina de Latinoamérica|Desde el escritorio del equipo VAMOS|Tema: Tu trabajo en el Reino|Usando los días laborales para Su gloria|Es la Iglesia qui[eé]n env[ií]a|Para dar una ofrenda|Revistas? recomendadas?|Recursos? recomendados?|Cursos? recomendados?|Publicaciones recomendadas|Sitios web recomendados|Libro recomendado|Video( y recurso)? recomendados?|5 % No siento haber hecho una diferencia|www\.openbolivia\.net|Negocios para Transformación|V Congreso “Profesión en Misión”|Nuestra Visión es crear una plataforma|Un curso en línea para pastores|1\.CÓMO EL EVANGELIO LLEGÓ|Devocionales en YouVersion)/i,
};
