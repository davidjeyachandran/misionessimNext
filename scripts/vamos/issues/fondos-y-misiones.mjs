/**
 * VAMOS — «Misión integral», septiembre 2010
 * (revista 6cbrma4382anEIyLPeR4b2). Key kept as the record's `fondos-y-misiones`.
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A four-page 2010 e-zine: a cover feature that jumps from p1 to p2, an
 * interview and two project profiles, with pull quotes set inside the measure.
 */

const skipPages = new Set([]);

const articles = [
  { title: 'Los pies y las manos del Maestro',                anchor: 'El viento comienza a soplar' },
  { title: 'Buscando el equilibrio',                          anchor: 'Nos resulta sencillo ir con una sonrisa' },
  { title: 'Siendo luz y sal',                                anchor: 'No podemos mantenernos dentro de nuestras congregaciones' },
  { title: 'p3 · lista La misión integral no es',             anchor: '• Mero asistencialismo' },
  { title: 'Mejoró el liderazgo, la confianza y sus ingresos', anchor: 'Paul McCann, economista' },
  { title: 'La Casa Débora',                                  anchor: 'Este programa de la misión SIM' },
  { title: 'Centro Juvenil Makelele',                         anchor: 'La misión SIM en África ofrece esperanza' },
  { title: 'Marcando la diferencia',                          anchor: 'Hacer Misión Integral, es apuntar' },
  { title: 'p4 · masthead',                                   anchor: 'Para bajar la revista SIM' },
  { title: 'p4 · footer',                                     anchor: 'Tu iglesia local te envía' },
];

export default {
  revistaId: '6cbrma4382anEIyLPeR4b2',
  coverAssetId: '2m9Gmx7YWnvVn9XgcInSt2',
  date: '2010-09-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p3 · lista La misión integral no es',
    'p4 · footer',
    'p4 · masthead',
    // The p1 half breaks mid-sentence around a Stott pull quote and a
    // «MANOS, continúa en la página 2» line, and the rest is on p2.
    'Los pies y las manos del Maestro',
    // The questions are too short to survive as frames, so the answers are
    // left unlabelled.
    'Mejoró el liderazgo, la confianza y sus ingresos',
  ]),
  /** The page's one lower photograph sits under Makelele; La Casa Débora has none. */
  coverHero: new Set(['La Casa Débora']),
  noHeroSkip: new Set(),
  heroOverride: {
    'Centro Juvenil Makelele': 'doc-4_6.jpg',
    'Marcando la diferencia': 'doc-4_7.jpg',
  },
  furniture: /^(Septiembre|2010|Tema:|Por:|Directora:|equipo editorial|Tu iglesia local te envía)/i,
};
