/**
 * VAMOS — «Seguridad en el campo», febrero 2013
 * (revista 3QVGZsQ3u5iIGo8OHuQrYD).
 *
 * An 11-page A4 issue in the same two-column newsletter layout as
 * «Antes de ir»: roughly one article per page, with bullet lists, pull
 * quotes and sidebars set inside the measure.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Sobreviviendo en el campo',                     anchor: 'Vemos una película de acción' },
  { title: 'p3 · cita de Elver Luyo (de la p3, cae al final de la p2)', anchor: '“Tu actitud de tranquilidad' },
  { title: 'Primeros auxilios: pueden salvar una vida',     anchor: 'En los momentos de emergencia, en donde el pánico' },
  { title: 'Viaje seguro',                                  anchor: 'La seguridad es un elemento de suma importancia' },
  { title: 'Formando una familia de protección',            anchor: 'Tu equipo misionero, iglesia local u otros misioneros' },
  { title: 'Mujeres precavidas',                            anchor: 'Nora* tomó un taxi' },
  { title: 'Anticipando las emergencias',                   anchor: 'En el campo misionero pueden suceder situaciones imprevistas' },
  { title: '¿Tienes un plan?',                              anchor: 'Planifica y conversa cómo manejarás' },
  { title: 'Ojo, pestaña y ceja',                           anchor: 'Esta es una lista con consejos prácticos' },
  { title: 'Por su nombre',                                 anchor: 'En Diciembre de 1934, un joven matrimonio' },
  { title: 'Una generación de mártires',                    anchor: 'Los misioneros vivirán rechazo' },
  { title: 'Seguridad para la computadora',                 anchor: 'Nota: estas pautas no sólo son' },
  { title: 'Cuidado con la información que compartes',      anchor: 'Vivimos en un mundo globalizado' },
  { title: 'Llamados a la oración',                         anchor: 'Iglesia, como cuerpo de Cristo estamos' },
  { title: 'p11 · prevención y preparación',                anchor: 'Muchos problemas en el campo pueden evitarse' },
  { title: 'p11 · anuncios del curso en línea',             anchor: 'Todas las revistas VAMOS están disponibles' },
];

export default {
  revistaId: '3QVGZsQ3u5iIGo8OHuQrYD',
  coverAssetId: '1VvdXKDGhiThsROqM058cp',
  date: '2013-02-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p11 · anuncios del curso en línea',
    'p3 · cita de Elver Luyo (de la p3, cae al final de la p2)',
    // Sentence cut mid-clause by a pull quote, photo captions and sidebars.
    'Primeros auxilios: pueden salvar una vida',
    // «Sí» / «No» labels lost, so two numbered lists of do's and don'ts
    // read as one contradictory list.
    'Viaje seguro',
    'Formando una familia de protección',
    // Infographic bullets interleaved word by word with the story.
    'Mujeres precavidas',
    // Sidebar text and the next page's headline run into the end.
    '¿Tienes un plan?',
    // Bullet lists under labelled sub-headings; the labels are lost.
    'Ojo, pestaña y ceja',
    // Garbled tail: a URL split across frames lands inside the last paragraph.
    'Por su nombre',
    // Sample email, risk table and sidebars run together.
    'Seguridad para la computadora',
    'Cuidado con la información que compartes',
    'Llamados a la oración',
    'p11 · prevención y preparación',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Febrero|2013|Tema:|Por:|Equipo Editorial|Directora:|VAMOS, SIM|web:)/i,
};
