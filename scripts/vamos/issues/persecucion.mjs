/**
 * VAMOS — «Persecución», mayo 2014
 * (revista 3M6ABJ9nKraeU3tifPZNdU).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * The PDF has a real text layer (docs/PROGRESS.md once called it a scan —
 * wrong). This is the oldest issue run through the pipeline: A4, 23 pages,
 * short single-topic articles, a magazine headline above each.
 */

/** 1 cover · 22 prayer requests (a list of one-liners) · 23 resource links. */
const skipPages = new Set([1, 22, 23]);

const articles = [
  { title: 'No surge por casualidad',                       anchor: 'Al igual que en los tiempos' },
  { title: '¿Por qué no estamos siendo perseguidos?',       anchor: 'A muchos hermanos cuando' },
  { title: 'La persecución continúa para que la Iglesia despierte', anchor: 'Cuando inicia la persecución, despierta la' },
  { title: 'La persecución empieza por el discipulado',     anchor: 'Jesús no mintió cuando dijo que el discipulado cuesta' },
  { title: 'Perseguidos, más no desamparados',              anchor: 'Si los hombres aborrecieron' },
  { title: '¿Por qué padecen persecución los discípulos de Cristo?', anchor: '1. Por Cristo, por justicia' },
  { title: 'Los números son necesarios',                    anchor: 'Cada año desde 1997' },
  { title: 'La Iglesia secreta',                            anchor: 'Los creyentes que viven en naciones hostiles' },
  { title: 'Si no fuera un verdadero cristiano…',           anchor: 'Recientemente tuve el privilegio' },
  { title: 'Se necesitan más obreros',                      anchor: 'Todavía hay una gran necesidad' },
  { title: '¿Vives lo que lees?',                           anchor: 'Hoy en día, en nuestra Iberoamérica' },
  { title: 'La persecución silenciosa',                     anchor: 'Durante el siglo XX fueron martirizados' },
  { title: 'Biblias para los que no tienen una',            anchor: 'Estamos colaborando con varias agencias' },
  { title: 'Los niños también sufren',                      anchor: 'En India fue encontrado' },
  { title: '¡Yo soy perseguido, chico!',                    anchor: 'Aunque la situación en Cuba' },
  { title: 'Uno con ellos',                                 anchor: 'Como discípulos de Cristo, podemos ayudar' },
  { title: 'Una voz de aquellos que no la tienen',          anchor: 'La Voz de Los Mártires (VOM) es una misión' },
  { title: 'Puertas Abiertas, detrás de las puertas cerradas', anchor: 'Puertas Abiertas, es una entidad cristiana' },
  { title: 'Preparándote para el sufrimiento',              anchor: 'La Biblia enseña algunas palabras' },
  { title: 'Perseguidos por descuido de uno',               anchor: 'El trabajo en países restringidos tiene' },
  { title: 'De bombardero a maestro de la Biblia',          anchor: 'En cierto punto, era más fácil matar' },
  { title: 'Torturado y rescatado en el escape',            anchor: 'La diferencia entre mi vida en Corea del' },
  { title: 'Perdonando a los asesinos',                     anchor: 'El profesor norteamericano, Ronnie Smith' },
  { title: 'He decidido seguir a Cristo, no vuelvo atrás',  anchor: 'Hubo una familia en una aldea de la India' },
  { title: 'Un solo cuerpo, una sola oración',              anchor: 'El Día mundial de la oración' },
  { title: 'Las buenas nuevas acerca de las malas noticias', anchor: 'En los siglos pasados los obstáculos' },
  { title: 'p8 · un pescado con mucho significado',          anchor: 'El símbolo de Ichthys' },
  { title: 'p16 · escribe una carta',                        anchor: '¿Quieres escribir a algún misionero' },
  { title: 'p17 · compartiendo a Cristo en el camino',       anchor: 'Nuestro amigo Musa' },
  { title: 'p18 · conoce, ora y actúa',                      anchor: 'Ser cristiano es un reto enorme' },
  { title: 'p19 · no hubo venganza, hubo perdón',            anchor: 'Ted es un joven pastor' },
];

export default {
  revistaId: '3M6ABJ9nKraeU3tifPZNdU',
  coverAssetId: '12XjQz5jNkHvBkKeRyrA4B',
  date: '2014-05-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  /**
   * Anchored only to keep their text out of a neighbour. The 2014 layout
   * sets pull quotes and sidebars inside the measure, so the text layer
   * splices them into the prose; these are left out rather than imported
   * broken (see README, "Pages worth skipping").
   */
  dropArticles: new Set([
    'p8 · un pescado con mucho significado',
    'p16 · escribe una carta',
    'p17 · compartiendo a Cristo en el camino',
    'p18 · conoce, ora y actúa',
    'p19 · no hubo venganza, hubo perdón',
    '¿Por qué no estamos siendo perseguidos?',
    'La persecución continúa para que la Iglesia despierte',
    '¿Por qué padecen persecución los discípulos de Cristo?',
    'Si no fuera un verdadero cristiano…',
    'Perseguidos por descuido de uno',
    'De bombardero a maestro de la Biblia',
    'Torturado y rescatado en el escape',
    'Perdonando a los asesinos',
    'He decidido seguir a Cristo, no vuelvo atrás',
    'Preparándote para el sufrimiento',
    'No surge por casualidad',
    '¡Yo soy perseguido, chico!',
    'Un solo cuerpo, una sola oración',
    'Las buenas nuevas acerca de las malas noticias',
    'La Iglesia secreta',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Perseguidos, Más No Desamparados|Mayo|2014|Tema:|La Persecución|Por Gino Ferruzo|Foto referencial|Continuado)/i,
};
