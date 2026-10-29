/**
 * VAMOS — «Salud física», junio 2012
 * (revista 2HRj4fvMvooF9igScdX4OZ).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * An 11-page A4 issue, one article per page, a magazine headline above
 * each. Every page sets pull quotes, photo captions and sidebars inside the
 * measure, so most of the text layer is spliced.
 */

/** 1 cover (image only) · 4 self-assessment grid · 11 resource links and house ads. */
const skipPages = new Set([1, 4, 11]);

const articles = [
  { title: 'Buena salud para estar en el campo de batalla', anchor: 'Todo siervo de Dios es tan susceptible' },
  { title: 'El equilibrio en nuestras vidas',               anchor: 'Los seguidores de diferentes religiones' },
  { title: 'Esos pequeños detalles',                        anchor: 'Por la emoción de estar cumpliendo tu llamado misionero' },
  { title: 'p5 · sidebars Cuidado con tu peso / La regla más sencilla', anchor: 'Alcanzar un peso saludable' },
  { title: 'Prevenir para no lamentar',                     anchor: 'Luis y su familia' },
  { title: 'La enfermedad no apagó mi llamado',             anchor: 'Mirtha Espino,' },
  { title: 'Él está en control',                            anchor: 'Cuando el cáncer atacó a mi padre' },
  { title: 'Que la enfermedad no te detenga',               anchor: 'La enfermedad no debe ser una razón' },
  { title: 'Utilizó a otros para cuidarme',                 anchor: 'Mi equipo había salido del país por visa' },
  { title: 'p9 · sidebar Haz tu propia investigación',     anchor: 'Tu Estado Físico:' },
  { title: 'Aquel que te llamó sabe qué es lo mejor para ti', anchor: 'En medio de una enfermedad, muchas' },
];

export default {
  revistaId: '2HRj4fvMvooF9igScdX4OZ',
  coverAssetId: '1xh1SCndzfio90ajodqCbh',
  date: '2012-06-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p5 · sidebars Cuidado con tu peso / La regla más sencilla',
    'p9 · sidebar Haz tu propia investigación',
    // Pull quote «Cuando un misionero llega…» with the speaker's caption
    // spliced in, and a second pull quote ending «Dr. Allen George Dr. Allen.».
    'Buena salud para estar en el campo de batalla',
    // Sidebar of medicine tips and a pull quote (with caption «Dra. Myriam
    // Hughes») set in the middle of the prose.
    'El equilibrio en nuestras vidas',
    // The «Mirtha Espino hecho la obra misionera» caption is spliced into a
    // sentence, and the «¡Mantente activo!» sidebar trails the text.
    'Prevenir para no lamentar',
    // Caption «Drs. Allen y Amy George» interrupts a sentence mid-clause.
    'Que la enfermedad no te detenga',
    // Captions («Dorothea Kirkendall, misionera…», «Fiona Hahn») split two
    // sentences, and the «En casos extremos» sidebar is run into the end.
    'Aquel que te llamó sabe qué es lo mejor para ti',
  ]),
  /** The page's only photograph belongs to the left-hand testimony. */
  coverHero: new Set(['Él está en control']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Junio|2012|Que la Enfermedad No te Detenga|Tema:|Por:|Equipo Editorial|Directora:)/i,
};
