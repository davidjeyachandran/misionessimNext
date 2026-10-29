/**
 * VAMOS — «Guerra espiritual», junio 2011
 * (revista 26LBHQe8w8JAaYfDVUkIfb).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A seven-page 2011 newsletter: A4, two or three columns, display-type
 * headlines split across lines, pull quotes set inside the measure.
 */

const skipPages = new Set([]);

const articles = [
  { title: 'La guerra espiritual',                          anchor: 'Frente a la casa de Roberto y Rosita' },
  { title: 'Un arma letal',                                 anchor: 'Una de las armas de guerra más poderosas' },
  { title: 'Tres frentes de combate',                       anchor: 'tres frentes de combate' },
  { title: 'La batalla en nuestra mente',                   anchor: 'El campo de batalla preferido por nuestro enemigo' },
  { title: 'Y eso no es todo…',                             anchor: 'El diablo toma sus anteriores ataques' },
  { title: 'p5 · titular Las armas de esta guerra',         anchor: 'Las Armas de esta' },
  { title: 'Las armas de esta guerra',                      anchor: 'La iglesia primitiva vio la experiencia' },
  { title: 'p5 · Debemos recordar que las armas…',          anchor: 'Debemos recordar que “las armas' },
  { title: 'p5 · pull quote armadura de Dios',              anchor: 'Vístanse de toda la armadura' },
  { title: 'p6 · ideas prácticas',                          anchor: 'ideas' },
  { title: 'Consejos prácticos para la lucha',              anchor: 'Estos son consejos que los misioneros' },
  { title: 'Tu eres un guerrero y es «tiempo de combatir»', anchor: 'Hemos sido llamados a ser guerre-' },
  { title: 'p7 · pie de página',                            anchor: 'La revista SIM tiene varios temas' },
];

export default {
  revistaId: '26LBHQe8w8JAaYfDVUkIfb',
  coverAssetId: '37cEtXEcamboGEULnZ3hFq',
  date: '2011-06-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p5 · titular Las armas de esta guerra',
    // The pull quote «Mi corazón…» (Spurgeon) is spliced word by word into
    // the second half, and page 1 ends on «Pero la verdad es que esto no
    // es así…», so neither half stands alone.
    'La guerra espiritual',
    // Opens with a detached drop cap («h» / «ay una gran batalla»).
    'Tres frentes de combate',
    // Points a) to d) are split across three columns and read out of order,
    // with a) cut mid-word across the gutter.
    'La batalla en nuestra mente',
    // Two columns of prose are interleaved with pull quotes and a caption.
    'Tu eres un guerrero y es «tiempo de combatir»',
    'p5 · Debemos recordar que las armas…',
    'p5 · pull quote armadura de Dios',
    'p6 · ideas prácticas',
    'p7 · pie de página',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Junio|2011|Tema:|Por:|equipo editorial|Directora:|ezine\.|Sandra Chiang|Tu iglesia local|web:|La revista SIM|misionessim\.org|Hay más de 200 ideas|VAMOS ya está|Haz click aquí|Soto Jomayra)/i,
};
