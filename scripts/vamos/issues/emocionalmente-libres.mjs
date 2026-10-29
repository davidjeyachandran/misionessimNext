/**
 * VAMOS — «Emocionalmente libres», octubre 2012
 * (revista 6UD1JuNegwcISwZVgQ0ROQ).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * An 11-page A4 issue (pp. 2-12), one headline per page, two-column body with pull quotes and sidebars.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Un mar inquieto de emociones', anchor: 'Por un momento es apacible, quieto e inspirador' },
  { title: 'Sano para el campo', anchor: 'Ana* salió hacia un campo misionero muy' },
  { title: 'Zonas peligrosas', anchor: 'Todos luchamos con diferentes aspectos en cuanto' },
  { title: 'Una sana identidad', anchor: 'Cada cierto tiempo, Mayra lucha en su' },
  { title: 'Dios tiene alta estima de nosotros', anchor: 'La Biblia nos enseña a pensar de nosotros mismos' },
  { title: 'Enemigo a la vista: acumulando estrés', anchor: 'Tan pronto como llegaron a Pakistán' },
  { title: 'Cómo disminuirlo: ideas prácticas para combatir el estrés', anchor: 'El nivel de expectativas es clave en la salud' },
  { title: 'Heridas no cerradas', anchor: 'Heridas del pasado, burlas y crítica' },
  { title: 'Destruyendo lo que te daña', anchor: 'Para lograr la destrucción de toda' },
  { title: '¿Pueden los misioneros sufrir depresión?', anchor: 'La respuesta es sí. Cerca de 20 de cada 100' },
  { title: 'Puede sucederle a cualquiera', anchor: 'No lo habían notado, pero su' },
];

export default {
  revistaId: '6UD1JuNegwcISwZVgQ0ROQ',
  coverAssetId: '3Rj6YQVmJgJtZwShxJHJAB',
  date: '2012-10-01',
  skipPages,
  rowPages: new Set([]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // A caption («Familia Marroquín») and the «Dr. Carlos Pinto» attribution are spliced into the middle of sentences.
    'Sano para el campo',
    // Two-column text and a pull quote are interleaved word by word; sentences do not read through.
    'Una sana identidad',
    // Attribution and pull quote («Vivian Ochoa», «clic aquí. combatir el estrés») are spliced into the end of the text.
    'Cómo disminuirlo: ideas prácticas para combatir el estrés',
    // Pull quote («Personalmente… cercanas es una») is interleaved through the middle, so several sentences are cut and rejoined wrongly.
    'Destruyendo lo que te daña',
    // A stray fragment of the page headline («¿Pueden los Misioneros») sits in the middle of the text and the furniture filter cannot remove it.
    '¿Pueden los misioneros sufrir depresión?',
    // Bullet labels are stranded at the end of the previous paragraph, a stray «Zonas Peligrosas» headline sits mid-text and one paragraph breaks mid-sentence.
    'Zonas peligrosas',
  ]),
  coverHero: new Set([]),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Octubre|2012|Tema:|Por:|Equipo Editorial|Directora:|La revista SIM tiene|Encontrarás muchos|misionessim\.org|VAMOS, SIM|Tu iglesia local te envía)/i,
};
