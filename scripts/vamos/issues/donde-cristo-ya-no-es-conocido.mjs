/**
 * VAMOS — «Donde Cristo ya no es conocido» (misiones a Europa),
 * septiembre 2011 (revista 4rahyxfooEwddEKdRuAUWb).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A seven-page 2011 newsletter: A4, two or three columns, display-type
 * headlines (some set as outlined art), sidebars and a statistics chart.
 */

/** 1 cover (a single quote over a photograph). */
const skipPages = new Set([1]);

const articles = [
  { title: 'También nos llamó a Europa',                    anchor: 'Melanie tiene 15 años y nació en Grecia' },
  { title: 'Un pasado glorioso',                            anchor: 'Europa fue la cuna del protestantismo' },
  { title: 'Una triste realidad',                           anchor: 'Según el movimiento misionero Back to Europe' },
  { title: 'Latinos en Europa',                             anchor: 'Cleverson Alemida es un misionero brasilero' },
  { title: 'La ventana 40/70',                              anchor: 'Europa es parte de lo que llamamos la Ventana' },
  { title: 'Otro tipo de sacrificio',                       anchor: 'No podemos pensar que una cultura fuertemente' },
  { title: 'Consideraciones para ir a Europa',              anchor: '• Tener una profesión u oficio' },
  { title: 'Siendo creativos para evangelizar en Europa',   anchor: 'Hay oportunidades misioneras para enviar' },
  { title: 'Corazones humildes y convicciones fuertes',     anchor: 'Los misioneros latinos que quieren servir en Europa' },
  { title: 'Una nueva generación que busca otras cosas',    anchor: 'Hay una generación de jóvenes europeos' },
  { title: 'SIM en Europa',                                 anchor: 'Hasta hace unos meses, el trabajo de SIM' },
  { title: 'p7 · pie de página y barras laterales',         anchor: 'La revista SIM tiene varios temas' },
];

export default {
  revistaId: '4rahyxfooEwddEKdRuAUWb',
  coverAssetId: '25VxjhRBCkleXmXsxWm6Jn',
  date: '2011-09-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Statistics chart labels, two pull quotes and a caption are interleaved
    // with the prose in three columns.
    'Una triste realidad',
    // Pull quote «Pero si el misionero está preparado…» spliced into the prose.
    'Otro tipo de sacrificio',
    'Consideraciones para ir a Europa',
    'p7 · pie de página y barras laterales',
  ]),
  /** The two sidebars on p2 and p6 sit on pages whose only photograph is another article's. */
  coverHero: new Set(['Un pasado glorioso', 'Corazones humildes y convicciones fuertes']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Septiembre|2011|Tema:|Por:|equipo editorial|Directora:|ezine\.|Sandra Chiang|Tu iglesia local|web:|La revista SIM|misionessim\.org|Hay más de 200 ideas|VAMOS ya está|Haz clic)/i,
};
