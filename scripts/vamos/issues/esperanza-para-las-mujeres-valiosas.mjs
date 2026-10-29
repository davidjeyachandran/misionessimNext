/**
 * VAMOS — «Esperanza para las mujeres valiosas», marzo 2013
 * (revista 1Y2GXbfVw4pmZ5o3cxJIQV).
 *
 * A 13-page A4 issue in the same newsletter layout as «Antes de ir»: one
 * to three articles per page, with sidebars, statistics and pull quotes
 * set inside the measure.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Sanando el corazón',                            anchor: 'Esta es una típica historia en India' },
  { title: 'La promesa del príncipe encantador',            anchor: '“Escapemos juntos”' },
  { title: 'p3 · Príncipe de mentiras',                     anchor: '“¿Por qué todos estos traficantes se llaman Raj?”' },
  { title: 'p3 · «Pero él realmente me ama»',               anchor: 'Cuando las chicas vienen a nosotros' },
  { title: 'Lo que necesitan más',                          anchor: 'Shari había sido tomada de su pueblo' },
  { title: 'Los leprosos del siglo XXI',                    anchor: 'Quizás la gente miserable en este planeta' },
  { title: 'p5 · sidebars ¿Qué es una fístula? / Se busca doctores', anchor: 'Quiere decir una herida que no cierra' },
  { title: 'Quieren tener nueras, pero no hijas',           anchor: '“Es una niña.” Son las 3 palabras' },
  { title: 'Ayudando a los que rescatan',                   anchor: 'En un pueblo en India, Brad vio' },
  { title: 'El regalo de la Jeevan',                        anchor: 'Mientras Clarisa muestra fotos' },
  { title: '«La niña que descuidé ahora se preocupa por mí»', anchor: 'Mi hermano, el niño tan esperado' },
  { title: '25 abortos por minuto en la China',             anchor: 'Sólo en la China hay 13 millones de abortos' },
  { title: 'Princesa rescatada',                            anchor: 'Le pregunté a Dios donde estaba' },
  { title: 'Más acerca de lo que piensas',                  anchor: 'En América Latina y el Caribe, alrededor de 4 millones' },
  { title: 'Aborto forzado de Jianmei',                     anchor: 'Shaanxi, China – Funcionarios del gobierno' },
  { title: 'El valor de la mujer',                          anchor: 'A diferencia de los valores de la mayoría de las sociedades' },
  { title: 'p11 · Para bajar',                              anchor: 'Glorifica - un estudio bíblico' },
  { title: 'Eres una mujer maltratada',                     anchor: 'Cuando alguien te golpea, te insulta' },
  { title: 'El sueño del amor redentor',                    anchor: 'Una incursión está por ocurrir' },
  { title: 'La pobreza tiene rostro de mujer',              anchor: 'La mujer es dos veces más probable' },
  { title: 'Anima que oren',                                anchor: 'El precioso don de Dios de la oración' },
  { title: 'La mujer islámica',                             anchor: 'El Instituto de Ciencias Médicas de Paquistán' },
];

export default {
  revistaId: '1Y2GXbfVw4pmZ5o3cxJIQV',
  coverAssetId: '2x7xnbsihqEmpKDcANbD1W',
  date: '2013-03-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p5 · sidebars ¿Qué es una fístula? / Se busca doctores',
    'p11 · Para bajar',
    // Sidebars («Príncipe de mentiras», «Pero él realmente me ama») with
    // their headings lost.
    'p3 · Príncipe de mentiras',
    'p3 · «Pero él realmente me ama»',
    // The pull quotes «Necesitamos…» are split between the columns and
    // repeated, so the list of what the women asked for reads out of order.
    'Lo que necesitan más',
    // The pull quote «Criar a una…» is spliced into the opening sentence.
    'Quieren tener nueras, pero no hijas',
    // A photo caption is interleaved with the second paragraph.
    'Ayudando a los que rescatan',
    // Infographic sidebar and pull quote run into the end of the second
    // paragraph.
    '25 abortos por minuto en la China',
    // Sidebar items with the headings lost, spliced with unrelated text.
    'Más acerca de lo que piensas',
    // Left-hand sidebar of a page whose headline is spliced in.
    'Eres una mujer maltratada',
    // «Guía del líder / Guía del participante» and a book advert are spliced
    // into the numbered steps.
    // Opens mid-story: the first paragraphs sit in a frame that landed elsewhere.
    '«La niña que descuidé ahora se preocupa por mí»',
    'Anima que oren',
    'La pobreza tiene rostro de mujer',
    'La mujer islámica',
  ]),
  /** Single-block stories whose pages carry no photograph. */
  coverHero: new Set(['Sanando el corazón']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Marzo|2013|Tema:|Por:|Por Adam|Equipo Editorial|Directora:|VAMOS, SIM|web:)/i,
};
