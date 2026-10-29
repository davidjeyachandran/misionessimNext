/**
 * VAMOS — «Movilización», agosto 2011
 * (revista 3tkpim1fJ0W6vwl1cb0FsV).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A seven-page 2011 newsletter: A4, mixed one-, two- and three-column
 * pages, pull quotes in a coloured band, an "ideas prácticas" box and the
 * masthead on the last page.
 */

/** 1 cover (a single quote over a photograph). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Lo que nos mueve',                              anchor: 'Un grupo de cinco iglesias pequeñas' },
  { title: 'Movilización es…',                              anchor: '“Movilizar” significa' },
  { title: 'p3 · pull quote Randy Mitchell',                anchor: '“Tenemos que hacer algo práctico' },
  { title: '¿Cuáles son las tareas que debe desarrollar un movilizador?', anchor: '• Compartir información sobre la evangelización' },
  { title: 'El más grande movilizador',                     anchor: 'Dios es el primer movilizador y enviador' },
  { title: 'Apoyando en el envío',                          anchor: 'Provisión es una organización misionera chilena' },
  { title: 'p4 · continuación de El más grande movilizador', anchor: 'Dios siempre se ha movido a través' },
  { title: 'El rol del pastor en la movilización',          anchor: 'Podemos tener muchos candidatos para misioneros' },
  { title: 'Movilizando a la iglesia',                      anchor: 'La iglesia local debe involucrarse' },
  { title: 'p5 · pull quote Josué Oses',                    anchor: 'Yo le he dicho a mi iglesia' },
  { title: 'Testimonio: el tamaño es lo de menos',          anchor: 'Jonathan y Elizabeth Rugna' },
  { title: 'Movilizando profesionales',                     anchor: 'En muchas de las regiones consideradas' },
  { title: 'p6 · rótulo Herramientas',                    anchor: 'Herramientas' },
  { title: 'Herramientas para movilizar',                   anchor: 'Es importante la enseñanza de misiones' },
  { title: 'OCLA: movilizando y capacitando',               anchor: 'OCLA es la Oficina de Conexión' },
  { title: 'p7 · pie de página',                            anchor: 'La revista SIM tiene varios temas' },
  { title: 'Un llamado que no cambia',                      anchor: 'Como iglesia de Jesucristo nada nos debería' },
  { title: 'p7 · ideas prácticas',                          anchor: 'ideas' },
];

export default {
  revistaId: '3tkpim1fJ0W6vwl1cb0FsV',
  coverAssetId: '1oU7Z8SFMy8dp9X7rnHP9r',
  date: '2011-08-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p6 · rótulo Herramientas',
    // Caption «Geof Gunton, misionero australiano…» and pull quote «Sólo el
    // 5% de iglesias latinas…» are interleaved word by word with the prose.
    'Lo que nos mueve',
    // Pull quote «Dios está llamando cada vez más…» spliced into the prose.
    'Movilización es…',
    // Caption «Sergio Galaz» spliced into «Pro- visión».
    'Apoyando en el envío',
    // Pull quote «Cuando enviamos a un misionero…» spliced into the prose.
    'OCLA: movilizando y capacitando',
    'p3 · pull quote Randy Mitchell',
    'El más grande movilizador',
    'p4 · continuación de El más grande movilizador',
    'p5 · pull quote Josué Oses',
    'Herramientas para movilizar',
    'p7 · pie de página',
    'p7 · ideas prácticas',
  ]),
  /** p6 carries only clip art (a ring of keys, a toolbox). */
  coverHero: new Set(['Movilizando profesionales']),
  noHeroSkip: new Set(),
  /** The only photograph on p3 (a man with a storyboard cloth). */
  heroOverride: { '¿Cuáles son las tareas que debe desarrollar un movilizador?': 'doc-3_3.jpg' },
  furniture: /^(Agosto|2011|Tema:|Por:|equipo editorial|Directora:|ezine\.|Sandra Chiang|Tu iglesia local|web:|La revista SIM|misionessim\.org|Hay más de 200 ideas|VAMOS ya está|Haz clic)/i,
};
