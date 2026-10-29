/**
 * VAMOS — «Asia», junio 2013
 * (revista 1Ux5vJta9yNr8trVjYHIso; the edition's WordPress slug is
 * oscuridad-en-los-colores-vibrantes-asia).
 *
 * A 16-page A4 issue in the 2013 newsletter layout: one or two articles
 * per page, three-column pages on p2, many short sidebars.
 */

/** 1 cover (image only) · 5 «Voces del campo», a collage of six unrelated field quotes. */
const skipPages = new Set([1, 5]);

const articles = [
  { title: 'Mucho para dar, mucho para aprender',           anchor: 'Los misioneros latinoamericanos tiene mucho para dar' },
  { title: 'Visas: entrando y quedándose',                  anchor: 'Trabajar en varios lugares en Asia requiere' },
  { title: 'p3 · Compromiso con la visa',                   anchor: 'Somos fieles a la visa que portamos' },
  { title: 'Enorme ventaja',                                anchor: 'Hoy, más del 85% de países asiáticos' },
  { title: 'p3 · cita de Samuel Zwemer',                    anchor: 'Qué importa realmente cuántos caigan' },
  { title: 'Primera vez que oyen las Buenas Nuevas',        anchor: '¿Cómo Dios te llamó para trabajar en la India?' },
  { title: 'p4 · pull quote de Shabi',                      anchor: 'Shabi es mi tutora' },
  { title: '¡Por favor, envíen ayuda!',                     anchor: '¡Por favor, envíen ayuda!”, fue el clamor' },
  { title: 'La Iglesia en China',                           anchor: 'Hay 100,000,000 cristianos chinos' },
  { title: 'p6 · Otras características de la Iglesia en China', anchor: 'Otras características de la Iglesia en China' },
  { title: 'Panorama del Islam: teóricas y prácticas',      anchor: 'Vive una experiencia multicultural' },
  { title: 'Reconciliación para Myanmar',                   anchor: 'La facilitación de leyes de importación' },
  { title: 'De la ira a la Shalom',                         anchor: 'Shalom significa integridad' },
  { title: 'Dios hace grandes cosas en nosotros antes',     anchor: 'Entrar a una nueva cultura es intimidante' },
  { title: 'Camello polo en Mongolia',                      anchor: 'Camello Polo en Mongolia' },
  { title: 'Un camino al corazón de un pueblo',             anchor: 'Las cabras, los caminos, las motocicletas' },
  { title: 'Potenciando la adoración desde el corazón',     anchor: 'Una entrevista con María, una etnomusicóloga' },
  { title: 'Dios es quien transforma los corazones',        anchor: 'Carla, de Ecuador, ya con dos años en India' },
  { title: 'p12 · Consejos para trabajar en India',         anchor: '• Es muy importante tener una salud física estable' },
  { title: 'Aprendiendo el idioma',                         anchor: 'El aprender un lenguaje extranjero' },
  { title: 'Construyendo confianza y puentes',              anchor: 'Escondido en nuestra sala está un grupo' },
  { title: '¿Te gustaría oír una historia?',                anchor: '¿Eres la Didi (hermana mayor)' },
  { title: 'Tailandia es 93-95% budista',                   anchor: 'Hay aún millones de tailandeses' },
  { title: 'p14 · Guía de oración',                         anchor: 'Guía de oración – 52 semanas' },
  { title: 'Mi mundo era mi ciudad',                        anchor: 'Por Efrain Medina' },
  { title: 'p15 · barra lateral',                           anchor: 'Esta es la forma que estoy haciendo para animar' },
  { title: 'Asia envía misioneros también',                 anchor: 'Latinoamérica no es el único área' },
  { title: 'p16 · Un poderoso puñado de arroz',             anchor: 'Por 100 años, la gente' },
  { title: 'p16 · Centro de entrenamiento vocacional',      anchor: 'Entrenar a jóvenes para llegar a ser' },
  { title: 'p16 · Múltiples oportunidades en Asia',         anchor: '• Lingüistas' },
  { title: 'p16 · Sports Friends',                          anchor: 'Nuestra visión es ver un movimiento mundial' },
];

export default {
  revistaId: '1Ux5vJta9yNr8trVjYHIso',
  coverAssetId: '3FSLamkmHlsnThkYvKhqwZ',
  date: '2013-06-01',
  skipPages,
  /** p9 and p14: a two-column article sits above a second, full-width one. */
  rowPages: new Set([9, 14]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Pull quote «Puede ser que para una persona…» is cut mid-sentence and
    // the sidebar headline «Latinos en Asia» is spliced into its second half.
    'Mucho para dar, mucho para aprender',
    // The two columns alternate sentence by sentence («Así que transformación
    // de la gente…»), and a pull quote headline is run into the last line.
    'Un camino al corazón de un pueblo',
    // The interview answer is interrupted by a photo caption before its
    // second half, which continues in the right-hand column.
    'Potenciando la adoración desde el corazón',
    // Sidebar text interleaved word by word with the essay.
    'Mi mundo era mi ciudad',
    // A sidebar about Thailand, under 150 words once its heading is removed.
    'Tailandia es 93-95% budista',
    'p3 · Compromiso con la visa',
    'Camello polo en Mongolia',
    'p3 · cita de Samuel Zwemer',
    'p4 · pull quote de Shabi',
    'p6 · Otras características de la Iglesia en China',
    'p12 · Consejos para trabajar en India',
    'p14 · Guía de oración',
    'p15 · barra lateral',
    'p16 · Un poderoso puñado de arroz',
    'p16 · Centro de entrenamiento vocacional',
    'p16 · Múltiples oportunidades en Asia',
    'p16 · Sports Friends',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Junio|2013|Tema:|Por:|Equipo Editorial|Directora:|VAMOS, SIM|web:)/i,
};
