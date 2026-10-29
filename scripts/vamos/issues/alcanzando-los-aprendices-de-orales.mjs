/**
 * VAMOS — «Alcanzando a los aprendices de orales», septiembre 2013
 * (revista 3g0ovimWIifpNfiXtMv5uR).
 *
 * A 16-page A4 issue in the 2013 newsletter layout: one or two articles per
 * page, nearly every page carrying sidebars, numbered lists and pull quotes
 * inside the measure.
 */

/** 1 cover (image only) · 5 «Narración Bíblica Cronológica», three sidebars and a bullet list interleaved · 16 resource links. */
const skipPages = new Set([1, 5, 16]);

const articles = [
  { title: 'Un método que todos deben entender',            anchor: 'Cuando el misionero salga y busque la manera' },
  { title: 'Dos de cada tres personas',                     anchor: 'Las dos terceras partes de las personas del mundo' },
  { title: '¡Todos somos estudiantes verbales!',            anchor: '¿Qué cosas recuerdan del sermón de la semana pasada' },
  { title: 'Comunicadores orales por preferencia',          anchor: 'La Narración Bíblica Cronológica es una manera sencilla' },
  { title: 'El aspecto relacional de la narración',         anchor: 'La iglesia experimenta un crecimiento por los grupos' },
  { title: 'Alcanzar mejor a los jóvenes',                  anchor: 'Hay una capa más relacionada con lo verbal' },
  { title: 'La narración da a los nómadas raíces en el Evangelio', anchor: 'Las delicadas notas de un teclado electrónico' },
  { title: 'Oralidad en el discipulado: llegando más lejos con los aprendices orales', anchor: 'Antes de llegar a Jesús, los aprendices orales' },
  { title: 'Usando fotos con su narración',                 anchor: 'Usando fotos con su narración' },
  { title: 'La Biblia ya está llena de bellos cuadros',     anchor: 'Uno de los pastores de la clase estaba llevando' },
  { title: 'Las palabras que conocemos desde niños',        anchor: 'Las palabras que conocemos desde niños' },
  { title: 'Separando los jaguares de los patos',           anchor: 'Un día, el Pastor Terry estaba enseñando' },
  { title: 'Oralidad y alfabetización a la vez',            anchor: 'AIDIA, un proyecto de Wycliffe en Abancay' },
  { title: 'p8 · Testimonio de Sergio Reinaga',             anchor: 'En la capacitación sobre la Oralidad del Libro sin Palabras' },
  { title: 'Abrahams púrpuras, burros rosados y Dios',      anchor: 'Durante los años que hemos ministrado en Malawi' },
  { title: 'No depende de que sean alfabetizados',          anchor: 'A un comunicador oral no salvo' },
  { title: 'La estrategia sirve para muchos aspectos de ministerio', anchor: 'Evangelismo: Campañas, arenas al aire libre' },
  { title: '¿Cómo los aprendices orales perciben las cosas?', anchor: 'Los analfabetos nombran las figuras geométricas' },
  { title: 'Procesan de forma diferente, una memoria superior', anchor: 'Los comunicadores orales procesan la información' },
  { title: 'Piensa en tu audiencia',                        anchor: 'Los predicadores y los productores de los medios' },
  { title: '¿Por qué usar historias bíblicas?',             anchor: '• Dios nos creó con un gusto para las historias' },
  { title: 'Características de un aprendiz oral',           anchor: 'Son tan inteligentes como los alfabetizados' },
  { title: 'La narración en diez pasos',                    anchor: '1. Seleccione un principio bíblico' },
  { title: 'Adapta a sus preferencias de aprendizaje',      anchor: 'Mary Hawthorne es misionera de la SIM Bolivia' },
  { title: 'p13 · Testimonio de Juanito',                   anchor: 'Testimonio Juanito estaba sentado' },
  { title: 'El discipulado efectivo se une con la narración bíblica', anchor: 'Podrás estar reacio al comienzo' },
  { title: 'Cambió mi forma de pensar',                     anchor: 'Pensaba que la gente que no responde al Evangelio' },
  { title: 'Audio Biblias para Paraguay',                   anchor: 'José es un carpintero de cerca de 50 años' },
  { title: 'Hay una sola historia',                         anchor: 'A través de los siglos la forma de comunicación' },
];

export default {
  revistaId: '3g0ovimWIifpNfiXtMv5uR',
  coverAssetId: '2ZLpecEqdKM7OwQGclxhEx',
  date: '2013-09-01',
  skipPages,
  /** p3: two two-column articles above a second row of single-column ones. */
  rowPages: new Set([3]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p8 · Testimonio de Sergio Reinaga',
    'p13 · Testimonio de Juanito',
    // The pull quote and the sidebar «Oralidad en el discipulado» are
    // interleaved word by word with the first paragraphs.
    'Oralidad en el discipulado: llegando más lejos con los aprendices orales',
    // A list introduced by a colon loses its items; the next paragraph
    // starts mid-sentence.
    'Usando fotos con su narración',
    // The right-hand column carries a sidebar of tips, and the story's
    // second half is spliced into it.
    'Separando los jaguares de los patos',
    // Sub-headings «Alfabetización:» / «Oralidad:» are lost and the right
    // column's continuation lands in the testimonial below.
    'Oralidad y alfabetización a la vez',
    // Sub-heading «Naciones de acceso restringido» lost, so the last
    // paragraph reads as part of the wrong section.
    'La estrategia sirve para muchos aspectos de ministerio',
    // Labels «Los comunicadores orales» / «por escrito» lost from the two
    // bullet lists, and the next page's headline is run into the end.
    'Procesan de forma diferente, una memoria superior',
    // Names («Kyung Sook Kim», «Joni Byker») spliced into two paragraphs.
    'Piensa en tu audiencia',
    // A pull quote «Somos los que tenemos…» and a caption are interleaved
    // with the list.
    'Características de un aprendiz oral',
    // Most of the interview's questions are shorter than a text frame and
    // are lost, leaving answers without their questions.
    'Adapta a sus preferencias de aprendizaje',
  ]),
  /** A single-block list on a page whose photograph belongs to another article. */
  coverHero: new Set(['La narración en diez pasos']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Septiembre|2013|Tema:|Por:|Equipo Editorial|Directora:|VAMOS, SIM|web:)/i,
};
