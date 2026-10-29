/**
 * VAMOS — «Comunicación integral» (comunicación misionera), diciembre 2011
 * (revista 5KoifDv4jG62shd3UTU9Lv).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * An eight-page 2011 newsletter: A4, two or three columns, many display
 * headlines set as outlined art, and page 5 a collage of short quotes with
 * photo captions.
 */

/** 1 cover (image only) · 5 collage of quotes, captions and before/after photos. */
const skipPages = new Set([1, 5]);

const articles = [
  { title: 'La comunicación como llave',                    anchor: 'La comunicación es la llave que abre puertas' },
  { title: 'Un poco de todo',                               anchor: 'Siempre me asombra ver que los misioneros' },
  { title: 'Lecciones aprendidas de forma dura',            anchor: 'Con una voz monótona y un Powerpoint' },
  { title: 'p3 · columna derecha con citas intercaladas',   anchor: '“Una vez vi a un' },
  { title: 'Muestra en vez de informar',                    anchor: 'La pantalla blanca se burla de ti' },
  { title: 'p4 · cita «No abuses de las letras mayúsculas»', anchor: '“No abuses de las letras mayúsculas' },
  { title: 'p4 · Preparando tu carta',                      anchor: '• Planea usar 3-4 textos chicos' },
  { title: 'Es el mensaje lo que cuenta',                   anchor: 'Jesús dio Su mensaje con una visión' },
  { title: 'Cómo dar una respuesta',                        anchor: 'La gente va a hacerte preguntas' },
  { title: 'La tecnología como herramienta',                anchor: 'La tecnología puede atraer a la gente' },
  { title: 'Escogiendo las herramientas de comunicación',   anchor: 'Cada misionero debe planear qué herramientas' },
  { title: 'Creando un álbum de recortes',                  anchor: 'Un álbum puede llegar a ser tu mejor manera' },
  { title: 'Una buena presentación',                        anchor: '1. Respeta el tiempo que te dan' },
  { title: 'Comunicación de parte de la iglesia',           anchor: 'Uno de los grandes problemas del misionero' },
  { title: 'p8 · pie de página',                            anchor: 'La revista SIM tiene varios temas' },
  { title: 'La seguridad en la comunicación',               anchor: 'Los misioneros deben tener mucho cuidado' },
  { title: 'Un recurso que saldrá pronto',                  anchor: 'Vamos - Manual Interactivo' },
];

export default {
  revistaId: '5KoifDv4jG62shd3UTU9Lv',
  coverAssetId: '3HSduxaAITVyN8zBpxaFX',
  date: '2011-12-01',
  skipPages,
  /** p6: the lead article's second half sits in the right column above the next article. */
  rowPages: new Set([6]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Sidebar prose and a letter-spaced pull quote are interleaved with the
    // prose from «verbos, puedes…» onwards.
    'Muestra en vez de informar',
    // Sidebar «Sin una buena comunicación…» is spliced into the last
    // paragraphs.
    'Comunicación de parte de la iglesia',
    'p3 · columna derecha con citas intercaladas',
    'p4 · cita «No abuses de las letras mayúsculas»',
    'p4 · Preparando tu carta',
    'p8 · pie de página',
    'Un recurso que saldrá pronto',
  ]),
  /** p2 and p6 carry no photograph of their own (the page's photo belongs to the lead article). */
  coverHero: new Set(['Un poco de todo', 'La tecnología como herramienta']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Diciembre|2011|Tema:|Por:|equipo editorial|Directora:|ezine\.|Sandra Chiang|Tu iglesia local|web:|La revista SIM|misionessim\.org|Christina Conti$|Directora de la revista)/i,
};
