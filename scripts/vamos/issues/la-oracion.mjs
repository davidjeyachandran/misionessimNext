/**
 * VAMOS — «La oración», junio 2010
 * (revista 4T27XGNJEAtv23G8YkMwQr).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A four-page 2010 e-zine: a feature, a three-column testimony, practical
 * lists and an interview, with pull quotes and prayer requests set inside
 * the measure.
 */

const skipPages = new Set([]);

const articles = [
  { title: 'Cambiando el mundo con el poder de la oración',   anchor: 'Estaba leyendo el periódico' },
  { title: 'p2 · titular TESTIMONIO',                         anchor: 'TESTIMONIO' },
  { title: 'Ser misioneros por medio de la oración',          anchor: 'Mauricio Sánchez Cardozo y su esposa' },
  { title: 'p2 · peticiones de oración',                      anchor: 'Andrés, Sonia y Abby' },
  { title: 'Llamados a interceder por los misioneros',        anchor: 'Pedir información de las circunstancias' },
  { title: 'Pidamos al Dueño de la mies que envíe obreros',   anchor: 'Hay tanta necesidad de obreros' },
  { title: 'p4 · pull quote Tozer',                           anchor: 'Nadie en esta tierra ha obtenido' },
  { title: 'Seamos agentes de Dios',                          anchor: '¿Qué recomendaciones le daría a una iglesia' },
  { title: 'p4 · footer',                                     anchor: 'Tu iglesia local te envía' },
  { title: 'p4 · presentación de Pablo Bergsma',              anchor: 'Pablo Bergsma, ha servido' },
];

export default {
  revistaId: '4T27XGNJEAtv23G8YkMwQr',
  coverAssetId: 'pMWVb3pgUVGIQXVSDERwL',
  date: '2010-06-01',
  skipPages,
  /** p2 sets one testimony across three side-by-side columns. */
  rowPages: new Set([2]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p2 · peticiones de oración',
    'p2 · titular TESTIMONIO',
    'p4 · pull quote Tozer',
    // The first three tips lost their labels («Conocer nombres»,
    // «Informarse», «Identificarse») and the intro frame is gone, so the
    // list misreads.
    'Llamados a interceder por los misioneros',
    // The caption «Carl Hilgeman Sirviendo en todo el Mundo.» is run into
    // the middle of the quotation.
    'Pidamos al Dueño de la mies que envíe obreros',
    'p4 · footer',
    // The interviewee's introduction is a separate frame read after the
    // questions, so it cannot be put back in front of them.
    'p4 · presentación de Pablo Bergsma',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Junio|2010|Tema:|Por:|TESTIMONIO|ENTREVISTA|Directora:|equipo editorial|Tu iglesia local te envía)/i,
};
