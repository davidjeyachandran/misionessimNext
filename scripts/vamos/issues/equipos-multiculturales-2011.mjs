/**
 * VAMOS — «Equipos multiculturales», julio 2011
 * (revista 66HJUsEfap4VJzU0ZtTFjx). Key carries the year because the 2023
 * edition is `equipos-multiculturales`.
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * An eight-page 2011 newsletter: A4, two or three columns, pull quotes and
 * sidebars set beside the prose, an "ideas prácticas" box on the last page.
 */

/** 1 cover (image only) · 5 table of warm and cold cultures whose labels are lost. */
const skipPages = new Set([1, 5]);

const articles = [
  { title: 'Diferentes pero unidos',                        anchor: 'No es la primera vez que los latinos e indios' },
  { title: 'Un sentido de comunidad',                       anchor: 'La clave para la supervivencia de equipos' },
  { title: 'Mostrando el cuerpo de Cristo',                 anchor: 'Un equipo multicultural ejemplifica mejor' },
  { title: 'p3 · pull quote Naciones Unidas',               anchor: 'Ustedes son como las Naciones Unidas' },
  { title: 'Conociéndonos y comprendiéndonos',              anchor: 'Es la hora del almuerzo y en la casa' },
  { title: 'p4 · cuadro ¿Bíblico o cultural?',              anchor: 'Este pequeño cuadro te dará unos ejemplos' },
  { title: 'Seamos bilingües',                              anchor: 'El equipo de SIM en Perú estaba en su reunión' },
  { title: 'p6 · rótulo Testimonio',                       anchor: 'Testimonio' },
  { title: 'Lo que dicen de nosotros',                      anchor: 'Debbie, misionera taiwanesa' },
  { title: 'Concentrado en ser un colaborador',             anchor: 'Tenemos la tendencia de juzgar al otro' },
  { title: 'Una iglesia de diversidad',                     anchor: 'Unos misioneros peruanos de la Alianza' },
  { title: 'p8 · pie de página',                            anchor: 'La revista SIM tiene varios temas' },
  { title: 'p8 · pull quote Mi recomendación',              anchor: 'Mi recomendación para un integrante' },
  { title: 'p8 · ideas prácticas',                          anchor: 'ideas' },
];

export default {
  revistaId: '66HJUsEfap4VJzU0ZtTFjx',
  coverAssetId: '3t0BhokV9TG8YNb08Iu9Hz',
  date: '2011-07-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p6 · rótulo Testimonio',
    // Photo caption «Debbie» is spliced into the middle of a sentence.
    'Mostrando el cuerpo de Cristo',
    // Three pull quotes are interleaved word by word with the prose.
    'Concentrado en ser un colaborador',
    // Pull quote «Si quieres trabajar en unidad…» is spliced into the prose.
    'Una iglesia de diversidad',
    'p3 · pull quote Naciones Unidas',
    'p4 · cuadro ¿Bíblico o cultural?',
    'p8 · pie de página',
    'p8 · pull quote Mi recomendación',
    'p8 · ideas prácticas',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Julio|2011|Tema:|Equipos Multiculturales$|Por:|equipo editorial|Directora:|ezine\.|Sandra Chiang|Tu iglesia local|web:|La revista SIM|misionessim\.org|Hay más de 200 ideas|VAMOS ya está|Haz click aquí|Un ministro de educación)/i,
};
