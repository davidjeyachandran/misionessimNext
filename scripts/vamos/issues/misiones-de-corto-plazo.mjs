/**
 * VAMOS — «Misiones de corto plazo», febrero 2011
 * (revista 4QCQTgu86dTypWh62DvkBk).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A six-page 2011 newsletter: A4, mostly two-column, headlines set in
 * display type, an "ideas prácticas" box and the masthead on the last page.
 */

const skipPages = new Set([]);

const articles = [
  { title: 'Un equipo con propósito',                       anchor: 'Sofía llegó temprano de la universidad' },
  { title: 'No todo es de color de rosa',                   anchor: 'Meredith McAllister, misionera de Texas' },
  { title: 'Una gran experiencia',                          anchor: 'David Sassman, de Northeast Bible Church' },
  { title: 'Aprendamos que…',                               anchor: 'En otros países de habla inglesa' },
  { title: 'De regreso a casa. ¿Y ahora qué?',              anchor: 'El viaje de regreso a casa estará lleno' },
  { title: '¿Qué hace eficaz a un equipo misionero de corto plazo?', anchor: 'Deben ir donde hay necesidad' },
  { title: 'p6 · ideas prácticas para involucrarte',        anchor: 'Oración: www.omf.org' },
  { title: 'Nuestra respuesta',                             anchor: 'La respuesta de nosotros los latinos' },
  { title: 'p6 · pie de página',                            anchor: 'Tu iglesia local te envía' },
];

export default {
  revistaId: '4QCQTgu86dTypWh62DvkBk',
  coverAssetId: '7DBQKL1Uz9IG0W9Jch1KTM',
  date: '2011-02-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Numbered list whose enumerators 1, 2, 5 and 8 are set as separate
    // display-size frames and are lost, so the list misreads (3, 4, 6, 7 only).
    '¿Qué hace eficaz a un equipo misionero de corto plazo?',
    'p6 · ideas prácticas para involucrarte',
    'p6 · pie de página',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Febrero|2011|Tema:|Por:|equipo editorial|Directora:|ezine\.|Sandra Chiang|Tu iglesia local|web:|La revista SIM|misionessim\.org|MISIONES CORTAS|Hay más de 200 ideas|Foto )/i,
};
