/**
 * VAMOS — «Latinos en adaptación, sus retos y resilencia», diciembre 2024
 * (revista 3Lvakq672aT0Ur3HM5Fydg).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected. Nothing from this edition was published by hand, so
 * there is no `live` set.
 */

/**
 * 1 cover · 3 TOC.
 *
 * 5, 13 and 27 set a pull quote or a bullet label in a narrow column that
 * interleaves with the body, so the extracted prose reads as two texts
 * spliced together. p5 also runs again as a back-issue teaser inside the
 * March 2025 edition, where it is skipped for the same reason.
 */
const skipPages = new Set([1, 3, 5, 13, 27]);

const articles = [
  { title: 'Abrumadora y emocionante a la vez',             anchor: 'El primer día en una nueva cultura puede ser una experiencia abrumadora' },
  { title: 'La adaptación de los latinos en el campo misionero', anchor: 'En general, los latinos han mostrado una capacidad notable' },
  { title: 'Etapas de la adaptación transcultural',         anchor: 'Adaptarse al campo significa estar preparados para aprender' },
  { title: 'Adaptarse es renunciar a nosotros mismos',      anchor: 'Adaptarse en el campo significa estar preparados para aprender' },
  { title: 'Consejos para tu primer año',                   anchor: 'El primer año en el campo misionero es el año de' },
  { title: 'Humillarnos ante Dios',                         anchor: 'A los misioneros les tomará tiempo para su adaptación' },
  { title: 'No nos arrepentimos de haber dicho «Heme aquí, envíame a mí»', anchor: 'Recientemente, Leonardo y Carolina empezaron a servir' },
  { title: 'Valora y acepta las diferencias',               anchor: 'Es lógico que adaptarse a una nueva cultura sea difícil' },
  { title: '¿Cómo manejo el estrés y la frustración en el campo?', anchor: '• Cambiar de campo misionero, empezar de cero' },
  { title: 'Nadie se puede resistir al amor',               anchor: 'La adaptación a la cultura en España ha sido un desafío' },
  { title: 'Listos para la cancha',                         anchor: 'En los deportes, hay que tener un buen carácter' },
  { title: 'Toda la vida misionera pone a prueba nuestro carácter', anchor: 'Como hijos de Dios tenemos un modelo de carácter maduro' },
  { title: 'Sacudir para poder trabajarlo',                 anchor: 'La vida de una persona es como un vaso de agua con sedimento' },
  { title: 'Características importantes para el servicio',  anchor: 'estar dispuesto a ceder y aprender de la diversidad' },
  { title: 'Dios nos puede usar',                           anchor: 'Todos luchamos con diferentes aspectos en cuanto a nuestra personalidad' },
  { title: '¿Listo?',                                       anchor: 'Los candidatos misioneros llenan aplicaciones' },
  { title: 'Ser antes que hacer',                           anchor: 'Conocer nuestra identidad es una de las cosas más valiosas' },
  { title: 'Características de un buen misionero',          anchor: 'Es importante que aprendamos a depender de Dios y no de nuestros propios recursos' },
  { title: 'Tenemos que prepararnos para la persecución',   anchor: 'La persecusión se da con las personas locales' },
  { title: 'Plenamente preparado',                          anchor: 'El candidato misionero no debe buscar atajos para llegar al campo' },
  { title: 'Quítate las máscaras y evaluemos nuestro carácter', anchor: 'Lamentablemente, la mayoría de nosotros, aunque estamos en Cristo' },
  { title: 'Toda iglesia es un centro de formación de obreros', anchor: 'La iglesia hace un gran aporte a las misiones cuando es intencional' },
  { title: 'Contaba con mi iglesia',                        anchor: 'En uno de mis viajes, tuve un accidente' },
  { title: 'El rol de la iglesia',                          anchor: 'Las iglesias enviadoras tienen un papel clave en la preparación' },
  { title: 'La iglesia y su rol en el cuidado del misionero', anchor: 'Mientras los misioneros cumplen su parte la expansión del evangelio' },
  { title: 'Hay que haber servido en casa',                 anchor: 'Un obrero que ha servido mucho en su iglesia local' },
  { title: 'Ser flexible e invertir',                       anchor: 'Mi primer año en Colombia fue muy bueno' },
  { title: 'La agencia ayuda en la adaptación',             anchor: 'He dedicado mucho tiempo de mi carrera misionera al apoyo de nuevos obreros' },
  { title: 'Preparación integral incluye a las agencias misioneras', anchor: 'La selección y preparación de los obreros para el campo misionero' },
  { title: 'Hay que empezar con el idioma puente',          anchor: 'Sin capacitación muchos misioneros toman mucho más tiempo' },
  { title: 'Una experiencia de corto plazo antes de salir a largo plazo', anchor: 'Una joven tenía llamado a África y se interesó' },
  { title: 'Las luchas pequeñas se agrandan en el campo',   anchor: 'Aparte de preparación teológica, hay que hacer una evaluación sincera' },
  { title: 'Una pareja latina que viajó a una cultura fría', anchor: 'A ellos les faltaba preparación y pulir su carácter' },
  { title: 'Tu intimidad con Dios',                         anchor: 'será fundamental para formar en ti el carácter de Cristo' },
  { title: '¿Qué hacemos con el riesgo?',                   anchor: 'Si pudiera sentarse 10 minutos con cada obrero misionero' },
  { title: 'Cursos de seguridad obligatorios',              anchor: 'Los misioneros de SIM deben realizar cursos de seguridad' },
  { title: 'Consideraciones para estar más seguro',         anchor: '• Lea los documentos de seguridad y protección' },
  { title: 'Todos deben tener un plan de contingencia',     anchor: 'Es una forma de identificar qué «riesgos» podrían obstaculizar' },
  { title: 'Consejos de seguridad para el viaje',           anchor: '• Evite conductas que puedan ponerlo a usted' },
  { title: 'Prevención y preparación ante el riesgo',       anchor: 'Prevención y preparación • Conozca el riesgo en su área' },
  { title: 'La gestión de riesgos',                         anchor: 'HAZ FRENTE AL PELIGRO guía a los obreros transculturales' },
  { title: 'La importancia de la ciberseguridad para los obreros', anchor: 'En la era digital actual, la ciberseguridad es una preocupación crítica' },
  { title: 'Usando software original, correo seguro y ciberseguridad', anchor: 'Usar software original es esencial por varias razones' },
  { title: '15 años de la Revista VAMOS',                   anchor: 'REVISTA VAMOS ha bendecido al movimiento misionero de América Latina' },
];

export default {
  revistaId: '3Lvakq672aT0Ur3HM5Fydg',
  coverAssetId: '6jfrqvDCojPd7NnH1oZKiH',
  date: '2024-12-01',
  skipPages,
  live: new Set(),
  articles,
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Ruth Huarote|Evelyn Subuyuj|Luigi Sarmiento|Geraldyne Velasquez|Jessica Bastidas|Las dificultades y situaciones en el campo|Descargarlo aquí|Para más información|112 ediciones)/i,
};
