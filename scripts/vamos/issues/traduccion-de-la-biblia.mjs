/**
 * VAMOS — «Traducción de la Biblia», noviembre 2011
 * (revista 6ggxizTKh9Wh5pQzlOM2ig).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * Eight PDF pages, but page 7 is a two-page spread (1205pt wide) holding
 * the six «Vidas transformadas» testimonies side by side. Otherwise A4,
 * two or three columns, photo captions set inside the measure.
 */

/**
 * 1 cover (image only) · 5 «Van de la mano»: one frame spans both columns,
 * so the prose interleaves line by line · 8 numbered tips whose numerals are
 * garbled, address lists and the "ideas prácticas" box.
 */
const skipPages = new Set([1, 5, 8]);

const articles = [
  { title: 'Llegando al corazón',                           anchor: 'Imagina que llega a tu casa una carta' },
  { title: 'Estado actual de la traducción bíblica',        anchor: 'Según investigaciones, se calcula' },
  { title: 'Para toda lengua',                              anchor: 'Todos hemos oído que la Biblia dice' },
  { title: 'Los quechuas del Huallaga',                     anchor: 'Los quechuas de Huallaga, Perú no habían' },
  { title: 'Tu idioma es importante',                       anchor: 'En muchos lugares, la entrada de traductores' },
  { title: 'Trabajo de largo plazo',                        anchor: 'Según los traductores y alfabetizadores' },
  { title: 'La iglesia debe seguir apoyando',               anchor: 'La iglesia juega un papel importante' },
  { title: 'Dificultades en el camino',                     anchor: 'Falta de compromiso: Los' },
  { title: 'Largo caminar',                                 anchor: 'Rodrigo y Carol Barrera' },
  { title: 'El Dios que habla mi idioma',                   anchor: 'Un hombre cakchiquel' },
  { title: 'Cuentas sólo a Dios',                           anchor: 'En mayo del 97, Marilyn Valverde' },
  { title: 'Un abre-latas y cuchara',                       anchor: 'Un hermano, al recibir la Biblia' },
  { title: 'Un verdadero arrepentimiento',                  anchor: 'Una chica escuchó a Carmen' },
  { title: 'La samaritana quechua',                         anchor: 'Una señora quechua, que había sido avergonzada' },
];

export default {
  revistaId: '6ggxizTKh9Wh5pQzlOM2ig',
  coverAssetId: '3ddbfW0t5sva2kZXkbjgJQ',
  date: '2011-11-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Pull quote «El mejor misionero es la Biblia…» (Cameron Townsend) spliced
    // into the prose.
    'Llegando al corazón',
    // Pull quote «Muchas veces es necesario…» spliced into items 4 and 5.
    'Trabajo de largo plazo',
    // Photo caption «David Coombs, misionero del ILV…» and pull quote «Si no
    // quieren ir…» spliced into the closing paragraph.
    'La iglesia debe seguir apoyando',
    'Dificultades en el camino',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  /** The auto pick is a cut-out of three Bibles on white (saturation 87); a photograph of the Quechua readers is on the page. */
  heroOverride: { 'Para toda lengua': 'doc-3_3.png', 'Los quechuas del Huallaga': 'doc-3_4.png' },
  furniture: /^(Noviembre|2011|Tema:|Por:|foto por|Fuente:|En medio del gozo del pueblo|equipo editorial|Directora:|ezine\.|Sandra Chiang|Tu iglesia local|web:|La revista SIM|misionessim\.org)/i,
};
