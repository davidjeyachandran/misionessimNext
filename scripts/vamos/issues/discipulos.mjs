/**
 * VAMOS — «Discípulos que hacen discípulos», junio 2025
 * (revista 6t7oK2Z8dpL1DyuvgDiNlf).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 */

/**
 * 1 cover · 3 TOC · 35 back cover. 8 is the discipleship-process diagram,
 * whose numbered labels extract as loose digits; 16 sets its subheadings in
 * a narrow column that interleaves with the body, shredding the prose.
 */
const skipPages = new Set([1, 3, 8, 16, 35]);

/** Published by hand before this import — never touched. */
const live = new Set([
  '4 razones por las que los cristianos no discipulan',
  'Discipulado en el Norte de África',   // → discipulado-en-el-desierto…
  '10 cualidades de un discipulador',
]);

const articles = [
  { title: 'Jesús redefinió el discipulado',                anchor: 'Jesús redefinió el discipulado en Mateo 28' },
  { title: 'La Gran Comisión NO es opcional',               anchor: 'La Gran Comisión es el llamado más importante que existe en la tierra' },
  { title: 'La respuesta yace en la falta de discipulado',  anchor: 'Si Jesús sólo usó a 12 para impactar al mundo' },
  { title: 'Pasión, perspectiva, prioridades y perseverancia', anchor: 'La principal barrera para un discipulado efectivo' },
  { title: 'Es todo lo que hacemos',                        anchor: 'El propósito de cada reunión, cada programa y cada actividad' },
  { title: 'Dejar todo otro tipo de actividad',             anchor: 'Para nosotros trabajar es extender el Evangelio' },
  { title: 'Jesús pide más',                                anchor: 'Sus discípulos buscan' },
  { title: 'Efecto dominó del discipulado',                 anchor: 'Jesús es nuestro ejemplo como Discipulador' },
  { title: 'Una fuerza discipular',                         anchor: 'El pastor Jorge Lonzi, sirve en Argentina' },
  { title: 'Empoderando y equipando',                       anchor: 'El discipulado cristiano es un proceso integral' },
  { title: 'El discipulado es presencia',                   anchor: 'Cuando Gio, quien ahora es director de la oficina de SIM Latinoamerica, sirvió en Asia' },
  { title: 'Pasos claves en el discipulado',                anchor: 'Hacer discípulos de Cristo es una misión fundamental' },
  { title: 'El ejemplo de Jesús',                           anchor: 'Jesús hizo discípulos a través de una combinación de enseñanza' },
  { title: '4 razones por las que los cristianos no discipulan', anchor: 'Hay muchas razones para explicar la falta de discipulado' },
  { title: 'Lucas 10 como manual de discipulado',           anchor: 'Nuestro equipo en la Asia empezó a trabajar en base a Lucas' },
  { title: 'Amor y paciencia es discipular',                anchor: 'Elvis Espinoza con experiencia de tres años trabajando en la plantación' },
  { title: 'Ver a Cristo en nuestra vida',                  anchor: 'Ser un discípulo fiel y amar al Señor' },
  { title: 'Consejos a los discipuladores',                 anchor: 'Es importante saber qué es lo que estamos haciendo' },
  { title: 'Músicos pescadores de hombres',                 anchor: 'Mi vida cambió radicalmente cuando Cristo me llamó' },
  { title: 'Ser semejante a Jesús',                         anchor: 'El discipulado aporta a la vida del creyente' },
  { title: 'No siempre es enseñar',                         anchor: 'Dejar que ellos hagan su reflexión' },
  { title: 'Dios se deleita en incluirnos',                 anchor: 'El discipulado es ayudarles a acercarse más a Cristo' },
  { title: 'Discipulado en el Norte de África',             anchor: '¡Es el mejor momento del año!' },
  { title: 'El discipulado no es sinónimo de lecciones bíblicas', anchor: 'La primera experiencia de Carlos Abarca' },
  { title: 'La iglesia local es el laboratorio perfecto',   anchor: 'La mejor manera de hacer discípulos es a través del aprendizaje' },
  { title: 'Discipulando a las tribus urbanas',             anchor: 'Si buscamos discipular a indigentes' },
  { title: '10 cualidades de un discipulador',              anchor: '1) Ama a Dios sobre todas las cosas' },
  { title: 'Somos un canal',                                anchor: 'Mi esposa y yo estamos haciendo un discipulado con los muchachos profesionales' },
  { title: 'Enseña para un cambio de vida',                 anchor: 'Debemos siempre orar mientras hacemos discípulos' },
  { title: '4 claves para hacer que los jóvenes sean discípulos', anchor: 'Esta generación no ha tenido la oportunidad de caminar' },
  { title: 'Guiando los niños en su fe',                    anchor: 'El discipulado del corazón de un niño requiere intencionalidad' },
  { title: 'Discipular es multiplicarse',                   anchor: 'El discipulado no es simplemente un programa más dentro de la iglesia' },
  { title: '¿Cómo crear una cultura de discipulado?',       anchor: 'Aquí tenemos puntos claves a tener en cuenta según cada etapa' },
  { title: 'El cambio hacia una cultura de discipulado comienza en mí', anchor: 'Uno de los aspectos fundamentales de la cultura de discipulado' },
  { title: 'Que ellos discipulen a otros',                  anchor: 'En el discipulado de creyentes de trasfondo musulmán' },
  { title: 'Aprender de otros líderes',                     anchor: 'Sigo siendo discípulo, necesito gente que me aconseje' },
  { title: 'Usando el deporte para evangelizar y discipular', anchor: 'Pobreza, conflictos, pandillas, adicción' },
  { title: 'Movimientos de hacer discípulos',               anchor: 'Este modelo está asociado con los Movimientos de Hacer Discípulos' },
  { title: 'Comparta vida, no simplemente información',     anchor: 'El cuerpo de Cristo tiene personas con mucha experiencia de todo tipo' },
  { title: 'Un encuentro especial en el Congreso de COMIBAM', anchor: 'Es emocionante pasar momentos con Rudy Girón' },
  { title: 'Discípula como Cristo',                         anchor: 'La formación de discípulos es un mandato bíblico' },
  { title: 'Señor, hazme un multiplicador',                 anchor: 'Un equipo viajó a India para discipular creyentes' },
  { title: '¿Cuándo celebramos el efecto del movimiento misionero latino?', anchor: 'A veces creemos que el gran triunfo es cuando un misionero sale al campo' },
];

export default {
  revistaId: '6t7oK2Z8dpL1DyuvgDiNlf',
  coverAssetId: '3bbpaqWynpeFfNpGU9Mpck',
  date: '2025-06-01',
  skipPages,
  live,
  articles,
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Evelyn Subuyuj|Luigi Sarmiento|Geraldyne Velasquez|Jessica Bastidas|Merari García|El discipulado es la herramienta más poderosa|Servimos a largo plazo|Haz discípulos construyendo|¿Tienes llamado para norte de África)/i,
};
