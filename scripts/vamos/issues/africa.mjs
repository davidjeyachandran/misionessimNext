/**
 * VAMOS — «África», julio 2013
 * (revista 5PCPY0u4ZpzQ96Mqsf7pUD).
 *
 * A 15-page A4 issue in the 2013 newsletter layout, set in small type: one
 * to three articles per page in two columns, with country sidebars and
 * pull quotes set inside the measure.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Dios obrando en el continente que ya no es oscuro', anchor: 'Hace 100 años, África era conocida' },
  { title: 'Discípulos, la más grande necesidad',           anchor: 'En África hay cristianos muy sinceros' },
  { title: 'Sincretismo',                                   anchor: 'La religión africana es muy prevalente' },
  { title: 'p4 · titular Los africanos aman la comunidad', anchor: 'Los africanos aman' },
  { title: 'Los africanos aman la comunidad',               anchor: 'Las decisiones rara vez se toman' },
  { title: 'Sincretismo y tradición',                       anchor: 'El pasado y la tradición son muy importantes' },
  { title: 'La irresistible atracción del Evangelio',       anchor: 'A principios de 1970 el dictador de Somalia' },
  { title: 'Haz al Evangelio relevante',                    anchor: 'Generalmente los kenianos no se resisten' },
  { title: 'Ideal para latinos: Guinea Ecuatorial, Angola y Mozambique', anchor: 'Muchos misioneros latinos sufren por no hablar inglés' },
  { title: 'Angola',                                        anchor: 'A fines de la guerra civil de Angola' },
  { title: 'Mozambique',                                    anchor: 'Mozambique ha disfrutado de paz' },
  { title: 'Guinea Ecuatorial',                             anchor: '¡Es el único país de África que habla español!' },
  { title: 'Los obreros son pocos y la necesidad es mucha', anchor: 'Dios nos está dando una oportunidad maravillosa' },
  { title: 'La mies necesita profesionales',                anchor: 'Los doctores Juan Emilio y Adriana Palacios' },
  { title: 'El conjunto de libros del pastor',              anchor: 'Había viajado la manera' },
  { title: 'SIM nombra a africano como director internacional', anchor: 'El mes pasado, el Dr. Joshua Bogunjoko' },
  { title: 'p11 · seguridad en Nigeria',                    anchor: 'Dado el actual ambiente de seguridad' },
  { title: 'Conociendo un poco de Sudáfrica',               anchor: 'Dios puso en mi corazón hacer un viaje de exploración' },
  { title: 'Confusión en Sudáfrica',                        anchor: 'Siegfried, Director de SIM en Sudáfrica' },
  { title: 'Generación de líderes potenciales en África',   anchor: 'Soy Yubeli Perez' },
  { title: 'Discipulado necesario',                         anchor: 'En el hospital vemos cerca de 1,500' },
  { title: 'Atados a vudú',                                 anchor: 'Los pueblos de Benín y Togo' },
  { title: 'Hablando español en África',                    anchor: 'Tomando el pasaje de Romanos 10:14' },
  { title: 'p14 · nota para pastores',                      anchor: 'Pastores: si desea contribuir' },
  { title: 'Soy árabe y no soy musulmán',                   anchor: 'La gente nos dice que la razón' },
  { title: 'El impacto de dos vidas: del hogar a las naciones', anchor: 'Dios usó a Derek y Marguerite Porter' },
  { title: 'p15 · pie VAMOS, SIM',                          anchor: 'VAMOS, SIM' },
  { title: 'p15 · Para orar',                               anchor: 'Níger es muy resistente' },
  { title: 'p15 · 30 días de oración durante Ramadán',      anchor: 'Un movimiento de oración que coincide' },
];

export default {
  revistaId: '5PCPY0u4ZpzQ96Mqsf7pUD',
  coverAssetId: '2wDqjzbVMIyaUirPdPz2PO',
  date: '2013-07-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p4 · titular Los africanos aman la comunidad',
    'p14 · nota para pastores',
    'p15 · pie VAMOS, SIM',
    // The columns alternate («Uno de los musulmanes y aún no musulmanes que
    // obstáculos alguien se vuelva cristiano…»).
    'Los africanos aman la comunidad',
    // Map labels («e iqu mb») and a sidebar are spliced into the list.
    'Ideal para latinos: Guinea Ecuatorial, Angola y Mozambique',
    // The page footer «Toda persona interesada…» lands inside the first
    // paragraph, whose second half sits in the right-hand column.
    'Mozambique',
    // Interview whose questions are shorter than a text frame, so most of
    // them are lost and the answers read out of order.
    'Los obreros son pocos y la necesidad es mucha',
    'La mies necesita profesionales',
    // The «Globalización y urbanización» paragraph falls out of the middle
    // of this three-section sidebar, and it has no photograph.
    'Confusión en Sudáfrica',
    // Two columns alternate word by word.
    'El conjunto de libros del pastor',
    'p11 · seguridad en Nigeria',
    'p15 · Para orar',
    'p15 · 30 días de oración durante Ramadán',
  ]),
  /** Single-block testimonies on pages whose only photograph belongs to another article. */
  coverHero: new Set(['Soy árabe y no soy musulmán', 'Haz al Evangelio relevante']),
  noHeroSkip: new Set(),
  // doc-15_6 is a striped cloth; doc-15_10 is the photograph of the Porters.
  heroOverride: { 'El impacto de dos vidas: del hogar a las naciones': 'doc-15_10.png' },
  furniture: /^(Discípulos, Hacer la más grande|Guinea Ecuatorial, Angola y Mozambique$|Julio|2013|Tema:|Por:|Por |Equipo Editorial|Directora:|VAMOS, SIM|web:)/i,
};
