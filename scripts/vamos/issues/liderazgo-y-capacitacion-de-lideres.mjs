/**
 * VAMOS — «Liderazgo y capacitación de líderes», noviembre 2013
 * (revista 1C8t9wk5VELONgPVh98sOp).
 *
 * A 17-page A4 issue in the 2013 newsletter layout: one or two articles per
 * page, with scripture references, tables and pull quotes set inside the
 * measure.
 */

/** 1 cover (image only) · 5 «Liderazgo de titanes», a conflict-escalation diagram whose labels interleave with the text. */
const skipPages = new Set([1, 5]);

const articles = [
  { title: 'El ministerio de liderazgo',                    anchor: 'Hay una pregunta en particular que han hecho' },
  { title: 'Un líder evangélico',                           anchor: 'Es quien dirige y guía la vida de otros' },
  { title: 'Siervos verdaderos',                            anchor: 'Los siervos verdaderos no se quejan' },
  { title: 'Dos lados de un testimonio',                    anchor: 'Cuando se volvió necesario identificar a un nuevo director' },
  { title: 'Para ser un plantador de iglesia, primero tienes que ser un líder eficaz', anchor: 'El misionero debe de compartir con los miembros' },
  { title: 'Un buen líder invierte en otros',               anchor: 'Como misioneros y líderes necesitamos siempre' },
  { title: 'Invierte en líderes potenciales',               anchor: 'Tus líderes potenciales tienen cinco necesidades' },
  { title: 'Crea las oportunidades, invita a otros',        anchor: 'Nuestros líderes, Malcolm y Liz' },
  { title: 'Si yo no lo hago, nada sale bien',              anchor: 'Si queremos lograr que el trabajo de la evangelización' },
  { title: 'Empoderar',                                     anchor: 'El Señor le dijo a Josué' },
  { title: 'p8 · titular Mujer líder',                    anchor: 'Mujer Líder' },
  { title: 'Mujer líder en el campo misionero',             anchor: 'Carmen Ziefle de Alemania' },
  { title: 'Un modelo a seguir para mujeres',               anchor: 'El coraje de las hijas de Zelofehad' },
  { title: 'Consejos para mujeres que temen asumir un liderazgo en las misiones', anchor: 'Cada mujer debe estudiar bien la Palabra' },
  { title: 'Líderes laicos: desarrollando un recurso escondido', anchor: 'Como muchas asociaciones eclesiales' },
  { title: '¿Cómo está el filo de tu hacha?',               anchor: 'Un joven que buscaba trabajo se acercó' },
  { title: 'p10 · ¿Liderazgo o administración?',            anchor: 'Enfoca en Dios Desarrolla' },
  { title: 'p10 · tabla comparativa, columna derecha',     anchor: 'Enfoca en problemas Reacciona' },
  { title: 'Capacitando líderes: el costo de seguir a Cristo', anchor: 'Lucas 14:33, nos dice' },
  { title: 'La iglesia de Tantudji',                        anchor: 'La iglesia de Tantudji en África' },
  { title: 'Pablo: ejemplo de liderazgo',                   anchor: 'En Hechos capítulo 27, Pablo comienza' },
  { title: '¿Recibir o excluir…?',                          anchor: '... No se lo impidan' },
  { title: 'Aquí, yo soy el líder. Aquí, (no) mando yo',    anchor: 'servido por los súbditos' },
  { title: 'Líder anhedónico',                              anchor: 'Pastor de una iglesia en crecimiento' },
  { title: 'Uzías',                                         anchor: 'Uzías experimentó exactamente lo mismo' },
  { title: 'Jamás dejaremos nuestra condición de aprendizaje', anchor: '¿Por qué debemos capacitar a los líderes futuros?' },
  { title: 'Me quedo porque la mies es mucha',              anchor: 'Un pastor bautista en Siria' },
  { title: 'Hermanos, no cesemos de orar',                  anchor: 'Es la mejor cosas que bíblicamente' },
  { title: 'p17 · anuncio del curso en línea',              anchor: 'Si quieres saber más del tema de LIDERAZGO' },
];

export default {
  revistaId: '1C8t9wk5VELONgPVh98sOp',
  coverAssetId: '4YZ0vMWJlZJp8UUY3A7vgT',
  date: '2013-11-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p8 · titular Mujer líder',
    'p10 · tabla comparativa, columna derecha',
    'Hermanos, no cesemos de orar',
    // A pull quote «Todo misionero está en…» is spliced into the opening
    // sentence.
    'El ministerio de liderazgo',
    // Two columns interleave line by line («Cuando Chris y yo estábamos
    // función práctica…»).
    'Dos lados de un testimonio',
    // Interview: most questions are shorter than a text frame and are lost,
    // so the answers read without them.
    'Mujer líder en el campo misionero',
    // The lead-in paragraph is missing, so the piece opens mid-sentence;
    // its second half is run into the author's bio.
    'Líder anhedónico',
    'Uzías',
    // Paragraphs are spliced by an interview question that falls in the
    // middle of a sentence.
    'Jamás dejaremos nuestra condición de aprendizaje',
    // Sidebar words and sub-headings interleaved with the prose.
    '¿Recibir o excluir…?',
    // Starts mid-sentence («servido por los súbditos…») and the columns
    // alternate.
    'Aquí, yo soy el líder. Aquí, (no) mando yo',
    'p10 · ¿Liderazgo o administración?',
    'p17 · anuncio del curso en línea',
  ]),
  /** Single-block pieces on pages whose only picture is clip art or belongs to another article. */
  coverHero: new Set([
    // p17's only photograph shows a mass grave — not a hero image.
    'Me quedo porque la mies es mucha',
    'Siervos verdaderos',
    'Empoderar',
    'Consejos para mujeres que temen asumir un liderazgo en las misiones',
    'Líderes laicos: desarrollando un recurso escondido',
    '¿Cómo está el filo de tu hacha?',
  ]),
  noHeroSkip: new Set(),
  heroOverride: {
    // doc-7_1 is clip art; doc-7_4 is the author's portrait.
    'Si yo no lo hago, nada sale bien': 'doc-7_4.jpg',
  },
  furniture: /^(Noviembre|2013|Tema:|Liderazgo$|Por:|Por Sara|Equipo Editorial|Directora:|VAMOS, SIM|web:)/i,
};
