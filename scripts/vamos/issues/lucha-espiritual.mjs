/**
 * VAMOS — «Lucha espiritual», marzo 2026 (revista 7xd0QkXDyTnZcSkhiiLw1Y).
 *
 * Boundaries are declared, not detected: each article is anchored by the
 * opening words of its body, matched against the PDF text layer. See
 * scripts/vamos/README.md for why detection alone is not enough.
 *
 * Titles come from the page-3 table of contents where it lists the article,
 * otherwise from the headline as set on the page.
 */

/** 1 cover · 3 TOC · 31 back cover. 27 and 30 are tables — see below. */
const skipPages = new Set([1, 3, 27, 30, 31]);

/**
 * Published by hand before this import — never touched. «Vestida con la
 * armadura cada día» ran as `luz-en-medio-de-la-oscuridad`, rewritten and
 * expanded by the editor, so the magazine headline is what has to be
 * listed here; the slug alone would not collide.
 */
const live = new Set(['Vestida con la armadura cada día']);

const articles = [
  { title: 'Despierta a la realidad espiritual',            anchor: 'Sabemos por las Escrituras que el Reino de Dios' },
  { title: '¡Hay un mundo espiritual real!',                anchor: 'Como creyentes muy pocas veces' },
  { title: 'Todo es espiritual',                            anchor: 'La Palabra de Dios nos recuerda que todo es espiritual' },
  { title: '¿Y si tomáramos en serio que vivimos en un mundo espiritual?', anchor: 'Somos seres espirituales, viviendo en un mundo profundamente espiritual' },
  { title: 'Más allá de las estrategias',                   anchor: 'A veces reducimos el compartir el evangelio' },
  { title: 'No es guerra, nuestro lado ya ganó',            anchor: 'El Pastor Alejandro Taboada del Perú prefiere hablar' },
  { title: 'Los miedos nos atacan',                         anchor: 'La lucha spiritual a menudo se expresa como miedo' },
  { title: 'Una nota de precaución desde el campo: nuestras limitaciones y propósito en la batalla espiritual', anchor: 'Como obrero de campo, creo que los creyentes' },
  { title: 'Resistamos y huirá de nosotros',                anchor: 'Edgardo Surenian, pastor, misionero y profesor' },
  { title: 'El poder que levantó a Jesús vive en nosotros', anchor: 'En Efesios 1:18-20, Pablo ora' },
  { title: 'Ver los muertos vivientes',                     anchor: 'Cuando miramos con los ojos de Dios' },
  { title: '¿Dónde estuvo Dios esta semana… y lo reconociste?', anchor: '¿Has experimentado lo espiritual esta semana?' },
  { title: 'Buscar primero el Reino de Dios',               anchor: 'Busquen primeramente el Reino de Dios' },
  { title: 'El significado de "atar y desatar"',            anchor: 'En las últimas décadas ha surgido una idea popular' },
  { title: 'La autoridad que Cristo le ha otorgado',        anchor: '¿Qué significa para nosotros atar y desatar?' },
  { title: 'Activando el poder del Espíritu Santo en el evangelismo', anchor: 'Durante los años que pasé en Asia aprendí a usar las herramientas' },
  { title: 'Más que vencedores',                            anchor: 'Somos comisionados por el Espíritu, llamados a hacer la Misión' },
  { title: 'Nuestras armas no son carnales, sino poderosas', anchor: 'Esta surge por el enfrentamiento entre el Reino de Dios' },
  { title: 'Por el Espíritu Santo, somos',                  anchor: '• Separados – Apartados para un propósito' },
  { title: 'La batalla espiritual: un estilo de vida',      anchor: 'La batalla espiritual no es un evento aislado' },
  { title: 'Declaración sobre el Espíritu Santo y el mundo espiritual', anchor: 'El Espíritu Santo hace que la obra de Cristo sea eficaz' },
  { title: 'Enfrentamos oposición invisible',               anchor: 'La obra misionera no solo enfrenta desafíos visibles' },
  { title: 'El poder en el nombre de Jesús',                anchor: 'El nombre de Jesús tiene autoridad divina' },
  { title: 'Áreas Liberadas',                               anchor: 'En una región donde los misioneros no podían establecerse' },
  { title: 'Firme en el poder de Dios',                     anchor: 'La batalla espiritual es la decisión del creyente' },
  { title: 'Discernimiento en la batalla espiritual',       anchor: 'La iglesia de hoy aún no ha comprendido plenamente' },
  { title: 'La oración fortalece',                          anchor: 'Mientras los musulmanes a su alrededor celebraban el Ramadán' },
  { title: 'Lucas 10: nuestro manual para caminatas de oración', anchor: 'Basados en Lucas 10 como un manual de trabajo' },
  { title: 'La meta no está en esta tierra',                anchor: 'Dios está reconciliando todas las cosas en Cristo' },
  { title: 'Formados en la batalla: disciplinas espirituales para ti en lucha', anchor: 'El ministerio se hace de rodillas' },
  { title: '4 afirmaciones sobre la lucha espiritual',      anchor: 'La lucha espiritual es el reconocimiento de que somos parte de una batalla cósmica' },
  { title: 'No siempre es ruidosa y visible',               anchor: 'Muchas personas tienden a imaginar la batalla espiritual como algo dramático' },
  { title: 'La actividad demoníaca en el campo misionero',  anchor: 'La espiritualidad del Asia es latente' },
  { title: 'El progreso del peregrino',                     anchor: 'Uno de los libros más vendidos, aparte de la Biblia' },
  { title: 'Una postura ofensiva en la lucha espiritual',   anchor: 'Aunque gran parte del lenguaje bíblico sobre la lucha espiritual' },
  { title: 'No en todo lugar hay demonios',                 anchor: 'No es correcto pensar que se encuentran demonios en todo lugar' },
  { title: 'Combate desde la victoria que ya tienes',       anchor: 'Comúnmente, la lucha espiritual es principalmente ofensiva' },
  { title: 'Sanado por oración',                            anchor: 'Había un muchacho que se acercó en muchas ocasiones pidiendo medicina' },
  { title: 'Salud mental y batalla espiritual',             anchor: 'La relación entre la espiritualidad y la salud mental' },
  { title: 'Prácticas regulares para la protección',        anchor: 'Estas diez prácticas comprobadas te ayudarán' },
  { title: 'El poder cotidiano de la oración',              anchor: 'La oración es una herramienta potente y juega un papel principal' },
  { title: 'Vestida con la armadura cada día',              anchor: 'Colaboro en diferentes ministerios, compartiendo el Evangelio' },
  { title: 'La realidad espiritual del envío',              anchor: '• El rol del Espíritu Santo ha sido omitido' },
  { title: 'Tipos de batalla espiritual y cómo enfrentarlos', anchor: '1. Ataque personal - Batallas internas en la' },
  { title: 'Más allá del conflicto: discernimiento espiritual en la misión', anchor: 'El avance del Evangelio requiere discernimiento espiritual' },
  { title: 'La oración eficaz para los perdidos',           anchor: 'La oración es un regalo tremendo' },
  { title: 'Esenciales para vencer en las batallas espirituales', anchor: 'Como seguidores de Cristo, tenemos todo lo que necesitamos' },
];

export default {
  revistaId: '7xd0QkXDyTnZcSkhiiLw1Y',
  coverAssetId: '2eusFMgMEXBcrZNiYK0HXN',
  date: '2026-03-01',
  skipPages,
  live,
  articles,
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  /** Masthead names and the cover blurb, which sit in their own frames. */
  furniture: /^(Evelyn Subuyuj|Luigi Sarmiento|Geraldyne Velasquez|Jessica Bastidas|Christina Conti|Todo creyente es parte de esta batalla espiritual|Oficina de Latinoamérica)/i,
};
