/**
 * VAMOS — «Conferencias misioneras», junio 2024
 * (revista PSzJaFIl6YXsXXJ5DmUqP).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected. Five articles were published by hand from this
 * edition and are listed in `live` under their magazine headline.
 */

/** 1 cover · 3 TOC · 37 back cover (no text frames). */
const skipPages = new Set([1, 3, 37]);

/**
 * Already imported and published by hand — never touched by this import.
 * «Salen motivados a involucrarse» is the page headline; the contents page
 * calls it «Salen movidos a involucrarse».
 */
const live = new Set([
  'La iglesia dio un giro total',
  'Tiene importancia local y mundial',
  'Una fiesta misionera',
  'Salen motivados a involucrarse',
  '¿Y el teatro y la danza en el culto misionero?',
]);

const articles = [
  { title: 'Su amor nos impulsa',                           anchor: 'Los niños desfilan vestidos con trajes típicos de todo el mundo' },
  { title: 'La mejor estrategia para movilizar',            anchor: 'Es viernes por la noche, es el último día de la conferencia misionera' },
  { title: 'Ventajas de una conferencia misionera',         anchor: 'Una conferencia misionera anual puede llegar a ser una experiencia extraordinaria' },
  { title: 'Tipos de conferencias',                         anchor: 'Además de la conferencia misionera anual de la iglesia, hay muchos otros tipos' },
  { title: 'Metas basadas en la Palabra',                   anchor: 'Las conferencias misioneras pueden surgir desde iglesias locales' },
  { title: 'Las conferencias misioneras entusiasman',       anchor: 'En nuestra primera conferencia sobre misiones, vi de forma personal' },
  { title: 'Ahora misiones es el centro de todo',           anchor: 'Siempre había estado activo en todas las actividades de mi iglesia' },
  { title: 'Algunas conferencias no arrancan',              anchor: 'Se ha comparado a las reuniones misioneras de ciertas iglesias' },
  { title: 'Levantó mi mirada',                             anchor: 'No supe por qué me inscribía en este concilio' },
  { title: 'La iglesia dio un giro total',                  anchor: 'La iglesia Alianza Cristiana y Misionera de San Miguel se unió' },
  { title: 'Es una celebración, no conferencia',            anchor: 'La Iglesia Bautista Vida Nueva Arequipa en el Perú no tiene lo que normalmente' },
  { title: 'Misiones comienza en el lugar donde estás',     anchor: 'La conferencia misionera es una estrategia para dar a conocer a las iglesias' },
  { title: 'Tiene importancia local y mundial',             anchor: 'Una conferencia misionera es el medio más grande para enfocar' },
  { title: 'Inspirados a la acción',                        anchor: 'El año pasado el COBAMIH' },
  { title: 'Cumpliendo tu voto',                            anchor: 'Qué emocionantes son las conferencias misioneras' },
  { title: 'Una fiesta misionera',                          anchor: 'Era una fiesta en donde la mayoría de las veces logramos involucrar' },
  { title: 'Elementos indispensables en una conferencia misionera', anchor: 'La celebración de una conferencia misionera puede ser el evento más impactante' },
  { title: 'La tarea del pastor',                           anchor: 'Una sola persona debe dirigir las reuniones de la conferencia' },
  { title: 'No excluir a nadie',                            anchor: 'Fue después de una conferencia misionera que los jóvenes de la iglesia organizaron' },
  { title: 'Los que ministran',                             anchor: 'Algo muy importante es que los expositores sean personas que puedan transmitir' },
  { title: 'Un buen expositor, ¿cómo escogerlo?',           anchor: 'Tener un conferencista de buena reputación que sea efectiva es la clave' },
  { title: 'Eventos especiales durante la conferencia',     anchor: 'Almuerzos o desayunos en la iglesia' },
  { title: 'Representando a los misioneros',                anchor: 'Mientras que trabajan en el campo misionero, los misioneros tienen una persona' },
  { title: 'Los resultados de tu conferencia misionera',    anchor: 'Los aportes de una conferencia a la visión misionera de la iglesia son muchos' },
  { title: 'Salen motivados a involucrarse',                anchor: 'Impacto Mundial en Ecuador ha hecho 11 Seminarios Internacionales' },
  { title: 'Descubre + experimenta = CIMA',                 anchor: 'CIMA se realiza en forma anual y consta de dos partes' },
  { title: 'Acelerar la acción colaborativa',               anchor: 'El Cuarto Congreso de Lausana para la Evangelización Mundial tendrá lugar en Seúl' },
  { title: 'Aventura misionera infantil',                   anchor: 'A través de eventos propios para niños, nuestro anhelo es que los pequeños' },
  { title: 'Una cultura misionera nace con los niños',      anchor: 'La mejor tierra para sembrar la visión misionera es el corazón de un niño' },
  { title: 'p23 · testimonio de Daniel',                    anchor: 'ingeniero. Recién' },
  { title: '¿Y el teatro y la danza en el culto misionero?', anchor: 'Las artes escénicas son una herramienta poderosa en los cultos misioneros' },
  { title: 'Comisiones para la conferencia',                anchor: '• Comisión de Oración' },
  { title: 'Comisión de oración',                           anchor: 'Esta comisión debe organizarse y funcionar tan pronto como se determine' },
  { title: 'Levantar promesas de fe',                       anchor: 'Hay un elemento en la conferencia misionera que motiva a la iglesia' },
  { title: 'Que no sea solo una experiencia más',           anchor: 'Al cierre de cada Congreso, se desafía a la congregación a renovar' },
  { title: 'Ideas para el seguimiento después de una conferencia', anchor: '• Cursos sobre misiones' },
  { title: 'La generosidad es producto de madurez',         anchor: 'La falta de crecimiento en el área del dar y de la generosidad es muy común' },
  { title: 'Visitando a las aldeas',                        anchor: 'Los participantes del Seminario Movilizadores en Ecuador visitan las aldeas' },
  { title: 'Mapa de compromiso',                            anchor: 'Dale a cada persona una pegatina blanca y pídeles que escriban su nombre' },
  { title: '«Dios empezó por mí»',                          anchor: 'Siempre pensé que no era llamado a las misiones' },
  { title: 'Para que no se apague la llama',                anchor: 'En la conferencia misionera hubo testimonios misioneros impactantes' },
  { title: 'Caminar con los candidatos',                    anchor: 'El Dr. Ralph Winter, editor del curso Perspectivas' },
  { title: 'El seguimiento trae el impacto',                anchor: 'Aunque no podemos, ni debemos generalizar el impacto de la conferencia misionera' },
  { title: '¿Cómo es el seguimiento?',                      anchor: '¿Cómo pueden asegurar que no sea solo una experiencia de unos días?' },
  { title: 'Estrategia divertida pero comprometida',        anchor: 'Lo primero que debemos tener en cuenta y lo más importante en una conferencia misionera' },
  { title: 'Vivir enviado',                                 anchor: 'Hay personas en nuestras iglesias que piensan que las misiones es SOLO VIAJAR' },
  { title: 'Fórum detonante para movilizar a la iglesia',   anchor: 'Cristian Castro, director ejecutivo de COMIBAM, está emocionado con la convocatoria' },
  { title: 'COMIBAM tendrá su quinto Congreso',             anchor: 'COMIBAM tendrá su quinto Congreso en la Ciudad de Panamá' },
  { title: 'p35 · recursos recomendados',                   anchor: 'Un ppt que avanza automáticamente' },
  { title: 'Consejos para una mesa misionera',              anchor: '1. Piensa acerca de tu propósito y diseña tu espacio' },
];

export default {
  revistaId: 'PSzJaFIl6YXsXXJ5DmUqP',
  coverAssetId: '2XMj5NsPYGXoylFN2YZRDn',
  date: '2024-06-01',
  skipPages,
  live,
  articles,
  /**
   * Anchored only to keep their text out of the article above them, then
   * dropped: p23 sets a testimony in a narrow label column that interleaves
   * word by word, and p35 is a page of resource blurbs, not an article.
   */
  dropArticles: new Set([
    'p23 · testimonio de Daniel',
    'p35 · recursos recomendados',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Ruth Huarote|Evelyn Subuyuj|Merari García|Luigi Sarmiento|Geraldyne Velasquez|Ruth Lévano|Jessica Bastidas|Sociedad Internacional Misionera|Oficina de Latinoamérica|Desde el escritorio del equipo VAMOS|Tema: Conferencias Misioneras|Las conferencias misioneras llevan a la transformación|Para dar una ofrenda|Recursos? recomendados?|Revistas? recomendadas?|Recurso recomendado|Arequipa - Nueva Vida|Ecuador - Mundial Impacto|Encuentra más información sobre|Extracto del libro|Fuente:|Descargarlo aquí)/i,
};
