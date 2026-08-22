/**
 * VAMOS — «Carácter misionero», septiembre 2025 (revista 5Rrku2gJjGQKglafbt8AMQ).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 */

/**
 * 1 cover · 3 TOC · 34 back cover.
 *
 * The rest are pages the text layer cannot be trusted on, all of them the
 * same failure: a worksheet grid or a narrow label column whose words
 * interleave with the body, so the extracted prose is shredded. p9
 * («Características de un misionero») sets its subheadings in a side
 * column; 12 is the Johari window; 17 and 29 are tables; 33 is a two-column
 * advert. Left out rather than imported broken.
 */
const skipPages = new Set([1, 3, 9, 12, 17, 29, 33, 34]);

/** Published by hand before this import — never touched. */
const live = new Set([
  'La dependencia del Señor me moldea',      // → moldeada-por-el-senor-lecciones-de-caracter-en-asia
  'El carácter se pone a prueba en Prisma',
]);

const articles = [
  { title: 'Cuando el servicio revela el corazón',          anchor: 'Todos hemos oído de personas de las cuales se dice' },
  { title: '¿Quién eres cuando nadie te ve?',               anchor: 'El carácter es la suma de cualidades positivas y defectos morales' },
  { title: 'Se esfuerzan por formar carácter',              anchor: 'Los candidatos misioneros llenan formularios' },
  { title: 'Se buscan obreros humildes y flexibles',        anchor: 'Se han realizado muchas entrevistas a misioneros latinos' },
  { title: 'Se revela en el servicio',                      anchor: 'El carácter de un cristiano se forja en lo secreto' },
  { title: '¿Qué hay en tu taza?',                          anchor: 'Imagina este escenario, estás sosteniendo una taza de café' },
  { title: 'Sacudir para poder trabajarlo',                 anchor: 'La vida de una persona es como un vaso de agua con sedimento' },
  { title: 'Lo que aún falta fortalecer en los misioneros latinos', anchor: 'Los líderes de campos misioneros reconocen muchas cualidades valiosas' },
  { title: 'Toda la vida misionera pone a prueba nuestro carácter', anchor: 'Como hijos de Dios, tenemos un modelo de carácter maduro' },
  { title: 'Características importantes para el servicio misionero', anchor: '• Flexibilidad y disposición' },
  { title: 'Quitémonos las máscaras y evaluemos nuestro carácter', anchor: 'Lamentablemente, muchos de nosotros, incluso estando en Cristo' },
  { title: 'Rasgos del carácter cristiano auténtico',       anchor: 'El carácter del discípulo está descrito en el Sermón del Monte' },
  { title: 'Nuestro modelo de carácter',                    anchor: 'Jesús era un varón perfecto y el más grande modelo' },
  { title: 'El Señor obra en la vulnerabilidad compartida', anchor: 'Muchas veces, como obreros, sentimos que todos tienen los ojos puestos' },
  { title: 'Resiliencia en acción: viviendo y sirviendo con esperanza', anchor: 'La resiliencia es la capacidad que tiene una persona' },
  { title: 'Ser aprendiz transforma tu carácter',           anchor: 'Más que un requisito impuesto por tu agencia o iglesia' },
  { title: 'Listos para la cancha',                         anchor: 'En el fútbol, todos queremos el mejor equipo' },
  { title: 'Fruto del Espíritu',                            anchor: 'Pero el fruto del Espíritu es amor, gozo, paz' },
  { title: 'Donde se forja el carácter',                    anchor: 'El carácter se revela en cómo reaccionamos sin pensar' },
  { title: 'La perseverancia es parte esencial del caminar con Cristo', anchor: 'La perseverancia es parte esencial del caminar con Cristo' },
  { title: 'Esperó catorce años antes de servir en la India', anchor: 'La perseverancia es preparación,” afirma Jyoti' },
  { title: 'La dependencia del Señor me moldea',            anchor: 'Vasti, boliviana, lleva dos años en Asia' },
  { title: 'Dar y recibir críticas',                        anchor: 'Como misionero, parte del carácter que necesitas desarrollar' },
  { title: 'Reconociendo nuestras fallas',                  anchor: 'Como misioneros, es fundamental aceptar que vamos a cometer errores' },
  { title: 'Zonas peligrosas: salud emocional',             anchor: 'Todos necesitamos ser corregidos para evitar problemas' },
  { title: 'Debemos amar a Cristo',                         anchor: 'Ante todo, las iglesias deben buscar candidatos que amen al Rey Jesús' },
  { title: 'Lo que está dentro, siempre sale a la luz',     anchor: 'El fruto del Espíritu nos ofrece una guía clara' },
  { title: 'Formando misioneros con todo el corazón',       anchor: 'En el camino de la formación espiritual y misional' },
  { title: 'Gente tóxica',                                  anchor: 'En cualquier comunidad, hay personas cuyas conductas afectan' },
  { title: 'Transformación de nuestro carácter',            anchor: 'Por lo tanto, todos nosotros, que miramos la gloria del Señor' },
  { title: 'El carácter se pone a prueba en Prisma',        anchor: 'PRISMA es un programa de entrenamiento misionero intercultural' },
  { title: 'Mucho más que un lugar de estudios',            anchor: 'En el 2006, nació ECAMM' },
  { title: 'Vivir la misión más allá del aula',             anchor: 'He tenido el privilegio de acompañar a jóvenes valientes' },
  { title: 'Lo que aprendimos en el Norte de Potosí',       anchor: 'Hace años, viajábamos al Norte de Potosí con jóvenes de Cochabamba' },
  { title: 'Personalidad vs. carácter',                     anchor: 'Personalidad: Son rasgos innatos o naturales' },
  { title: 'El carácter del siervo de Dios',                anchor: 'El carácter del siervo de Dios se forma a lo largo de la vida cristiana' },
  { title: 'Cuando la misión duele y el carácter es puesto a prueba', anchor: 'La misión cristiana no siempre ocurre en contextos receptivos' },
  { title: 'El estrés revela el carácter',                  anchor: 'El estrés no solo pone a prueba nuestro carácter' },
  { title: 'Liderazgo sin carácter es una receta para desastre', anchor: 'Hay una tendencia a complicar demasiado el liderazgo' },
  { title: 'Formando y modelando el carácter de Cristo en la Misión', anchor: 'Objetivo general: Equipar a misioneros para encarnar el carácter de Cristo' },
];

export default {
  revistaId: '5Rrku2gJjGQKglafbt8AMQ',
  coverAssetId: '4B7aVlLFH2i6fzEvORoF2y',
  date: '2025-09-01',
  skipPages,
  live,
  articles,
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Evelyn Subuyuj|Luigi Sarmiento|Geraldyne Velasquez|Jessica Bastidas|Merari García|Una voz desde|El carácter debe trabajarse|Queremos ayudarte a convertir esta revista)/i,
};
