/**
 * VAMOS — «Hijos de misioneros», abril 2013
 * (revista 5B3FfOYjMcw6d7sOpIQulH).
 *
 * An 11-page A4 issue in the 2013 newsletter layout: one article per page
 * in small type, two columns, with pull quotes and sidebars set inside the
 * measure.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Con más de un pasaporte',                       anchor: 'Recuerdo la confusión que sentía de niña' },
  { title: 'Considerándolos en tu decisión',                anchor: 'Trata de ser grande y valiente' },
  { title: 'Dios puso su sentir',                           anchor: 'En el año 2004 mi papá tuvo la oportunidad' },
  { title: 'Ayúdalos en el proceso',                        anchor: 'Todos los misioneros sufren el choque cultural' },
  { title: 'p5 · sidebar La familia y el equipo',              anchor: 'la Familia El Equipo y' },
  { title: 'Recomendaciones',                               anchor: 'Según diferentes entrevistas a misioneros' },
  { title: 'Considerando la educación',                     anchor: 'Tus hijos están en una etapa de formación' },
  { title: 'Educadas en casa, recompensadas por gracia',    anchor: 'Los esposos Betancourt, misioneros' },
  { title: 'La educación cristiana depende de nosotros',    anchor: '¿Cómo escogieron la opción de escuela' },
  { title: 'Educación que me cambió la vida',               anchor: 'Cuando recién me mudé a India' },
  { title: 'Abuso sexual: responsabilidad de todos',        anchor: 'El abuso sexual infantil es una realidad' },
  { title: 'Salvaguardas para tener en consideración',      anchor: 'Visibilidad • Los adultos deben estar visibles' },
  { title: 'Nos involucramos en la cultura',                anchor: 'Fuimos de Australia a Ecuador' },
  { title: 'p11 · pie VAMOS, SIM',                          anchor: 'VAMOS, SIM' },
  { title: 'Más de una opción',                             anchor: 'Cuando nuestros hijos eran chicos vivíamos' },
  { title: 'p11 · anuncio del curso en línea',              anchor: 'Familia, prepárate bien con este material' },
];

export default {
  revistaId: '5B3FfOYjMcw6d7sOpIQulH',
  coverAssetId: '138jvUgANrcK1GGo9vDuPE',
  date: '2013-04-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p11 · anuncio del curso en línea',
    'p11 · pie VAMOS, SIM',
    // Sidebar «La familia y el equipo» is spliced word by word into one
    // paragraph, with the pull quote and the headline run together.
    'p5 · sidebar La familia y el equipo',
    // Pull quote cut in the middle of a sentence, interleaved with the list.
    'Considerándolos en tu decisión',
    // Three columns of text interleaved line by line.
    'Considerando la educación',
    // Captions («Nicole», «Sandra») are spliced into a sentence.
    'Educadas en casa, recompensadas por gracia',
    // The interview's sidebar (names and ages of the family) is run into
    // the answers.
    'La educación cristiana depende de nosotros',
  ]),
  /** p10 carries only clip art (two cartoon families); no photograph. */
  coverHero: new Set(['Recomendaciones', 'Abuso sexual: responsabilidad de todos', 'Salvaguardas para tener en consideración']),
  noHeroSkip: new Set(),
  // doc-11_9 is clip art; doc-11_6 is the photograph of the Bakon family.
  heroOverride: { 'Nos involucramos en la cultura': 'doc-11_6.png' },
  furniture: /^(Abril|2013|Tema:|Por:|Equipo Editorial|Directora:|VAMOS, SIM|web:)/i,
};
