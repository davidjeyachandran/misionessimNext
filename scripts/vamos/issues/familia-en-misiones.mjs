/**
 * VAMOS — «Familia en las misiones», marzo 2010
 * (revista 4Ya6HvDD30Ob6XGVCESFM6).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A four-page 2010 e-zine: three family testimonies and a tips list,
 * with pull quotes set inside the measure.
 */

/** None: p4's FAQ and forum furniture are cut by anchor and dropArticles. */
const skipPages = new Set([]);

const articles = [
  { title: 'A través de las ondas radiales',                  anchor: 'Todos los sábados una vocecita' },
  { title: 'No olviden que los hijos son parte de las misiones', anchor: 'Si fuiste llamado para ir al campo misionero' },
  { title: 'No hay limitación para servir al Señor',          anchor: 'La Familia Arrunátegui sirve' },
  { title: 'Yo y mi casa serviremos al Señor',                anchor: 'A los 8 años de edad, Marko' },
  { title: 'Las bendiciones de estar donde Dios nos llama',   anchor: 'Para nosotros, es una bendición' },
  { title: 'p4 · FAQ sobre SIM',                              anchor: 'SIM comenzó en 1893' },
];

export default {
  revistaId: '4Ya6HvDD30Ob6XGVCESFM6',
  coverAssetId: '1Jq3OeRM0Xda6A1HLSPlpA',
  date: '2010-03-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p4 · FAQ sobre SIM',
    // The Martínez ministry paragraph and the pull quote are run into the
    // middle of a sentence («esfuerzo y» … «alegría, volcando»).
    'A través de las ondas radiales',
    // The photo caption «Karla y César y sus hijos…» is spliced word by
    // word into the prose.
    'No hay limitación para servir al Señor',
    // The Wunderink caption is run into the last sentence, which then
    // stops mid-clause.
    'Las bendiciones de estar donde Dios nos llama',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Marzo|2010|Familia en las Misiones|Por:|equipo editorial|Editora:|Tu iglesia local te envía|Extractos de Conferencia|Las bendiciones de estar donde Dios nos llama supera)/i,
};
