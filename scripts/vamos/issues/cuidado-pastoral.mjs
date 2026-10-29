/**
 * VAMOS — «Cuidado pastoral», marzo 2011
 * (revista 510YlBAown9qQ3QVl6AJ6i).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A five-page 2011 newsletter: A4, two-column, with sidebars and a
 * three-column testimony on page 2.
 */

/** 2 article in two columns interleaved with a three-column testimony. */
const skipPages = new Set([2]);

const articles = [
  { title: 'Un equipo con el que puedes contar',            anchor: 'Las cartas están listas y toda la iglesia' },
  { title: 'Tú eres tu primera defensa',                    anchor: 'Tú, eres el principal guardián' },
  { title: 'p3 · sidebar Facilita tu cuidado pastoral',     anchor: '• Debes estar dispuesto a recibir' },
  { title: 'p3 · sidebar El equipo ideal',                  anchor: 'No esperes situaciones de emergencia' },
  { title: 'Formando un equipo de apoyo alrededor del misionero', anchor: 'Neal Pirolo escribe en su libro' },
  { title: 'Un misionero atendido será un misionero más efectivo', anchor: 'Carlotita es una misionera' },
  { title: 'p5 · ideas prácticas y pull quote',             anchor: 'ideas' },
  { title: 'Leyendo entre línea',                           anchor: 'Las cartas de oración no te cuentan' },
  { title: 'p5 · pie de página',                            anchor: 'Tu iglesia local te envía' },
];

export default {
  revistaId: '510YlBAown9qQ3QVl6AJ6i',
  coverAssetId: '69K1ZaZoe628do2tZbKXHe',
  date: '2011-03-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Pull quotes «Necesité tiempos de consejería…» and «Ninguna iglesia
    // enviadora…» are spliced word by word into the prose.
    'Un equipo con el que puedes contar',
    'Tú eres tu primera defensa',
    'p3 · sidebar Facilita tu cuidado pastoral',
    'p3 · sidebar El equipo ideal',
    'p5 · ideas prácticas y pull quote',
    'p5 · pie de página',
  ]),
  /** p5 carries only a notebook clip art, a book ad and silhouettes. */
  coverHero: new Set(['Leyendo entre línea']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Marzo|2011|Tema:|Por:|cuidado pastoral$|equipo editorial|Directora:|ezine\.|Sandra Chiang|Tu iglesia local|web:|La revista SIM|misionessim\.org|Hay más de 200 ideas|VAMOS ya está|Carlotita, misionera lista)/i,
};
