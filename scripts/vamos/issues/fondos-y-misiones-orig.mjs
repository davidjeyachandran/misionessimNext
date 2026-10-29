/**
 * VAMOS — «Fondos y misiones», octubre 2010
 * (revista 43ds3NT4HhM6DS3Q6lj1bU).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A four-page 2010 e-zine on mission funding: one long article per page,
 * with pull quotes and sidebars set inside the measure.
 */

const skipPages = new Set([]);

const articles = [
  { title: 'Poniendo tu corazón en las misiones',             anchor: 'En una zona roja de Caquetá' },
  { title: 'p1 · cabecera y pull quote',                      anchor: 'Octubre 2010' },
  { title: '¿Por qué dar para misiones?',                     anchor: 'La razón principal para ofrendar' },
  { title: 'Plena confianza en la provisión',                 anchor: 'Tal vez piensas que el levantamiento de fondos' },
  { title: 'Ideas para dar',                                  anchor: 'Amar a Dios por sobre todas las cosas' },
  { title: 'Dar engrandece a las iglesias más pequeñas',      anchor: 'La Comunidad Misionera Familia de Dios' },
  { title: 'Un apoyo a conciencia',                           anchor: 'María es una misionera' },
  { title: 'p4 · presentación de Hiram Rivera',               anchor: 'Hiram Rivera, Pastor de COMIFAD' },
  { title: 'p4 · footer',                                     anchor: 'Tu iglesia local te envía' },
  { title: 'p4 · pull quote Hudson Taylor',                   anchor: 'La obra de Dios hecha a Su manera' },
];

export default {
  revistaId: '43ds3NT4HhM6DS3Q6lj1bU',
  coverAssetId: '463yO3dzaSkN59uCGjtQjH',
  date: '2010-10-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p1 · cabecera y pull quote',
    'p4 · presentación de Hiram Rivera',
    'p4 · footer',
    'p4 · pull quote Hudson Taylor',
    // Pull quotes («Me apoyan los miembros de mi iglesia…», «No tenemos
    // permiso para evangelizar al Perú primero») are run into every
    // paragraph of the text.
    '¿Por qué dar para misiones?',
    // María's story is cut mid-sentence («hasta un cambio»): its second
    // half is read after Hiram Rivera's introduction, not after the first.
    'Un apoyo a conciencia',
  ]),
  /** The only image beside «Plena confianza» is a clip-art «Remate para las misiones». */
  coverHero: new Set(['Plena confianza en la provisión']),
  noHeroSkip: new Set(),
  heroOverride: { 'Ideas para dar': 'doc-3_5.png' },
  furniture: /^(Octubre|2010|Tema:|Por:|Directora:|equipo editorial|Tu iglesia local te envía)/i,
};
