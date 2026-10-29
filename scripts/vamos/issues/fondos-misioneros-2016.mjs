/**
 * VAMOS — «Fondos misioneros», febrero 2016
 * (revista 4dfMIElcTDO6mY9OaLXiXC).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * 29 A4 pages in a mosaic layout: two to four items per page, each a
 * headline set small at the top of its column, with pull quotes, callout
 * boxes and verse panels placed inside the measure. Distinct from the 2022
 * «Fondos misioneros» edition (key `fondos-misioneros`).
 */

/**
 * 1 cover · 24 right-attitude / wrong-attitude table (cells become separate
 * frames and the pairing is lost) · 29 resource links and house ads.
 */
const skipPages = new Set([1, 24, 29]);

const articles = [
  { title: 'Extendiendo juntos el Reino de Dios',          anchor: 'Muchas veces en la Iglesia, el hablar de fondos' },
  { title: 'p2 · masthead y cita de otro artículo',      anchor: 'Queremos reflejar la voz de los obreros' },
  { title: '¿Qué es vivir por fe?',                        anchor: 'Vivir por fe es confiar que Dios proveerá' },
  { title: 'p4 · entrevista sin preguntas',                anchor: 'Para mí, es confiar en Dios' },
  { title: 'Confiar en Él',                                anchor: 'Escuchamos seguido que los misioneros' },
  { title: 'Cambiando nuestro paradigma',                  anchor: 'Cambiando nuestro paradigma' },
  { title: 'Hablemos de finanzas',                         anchor: 'Aparte del tema del amor, Jesús' },
  { title: '¿Qué tipo de dador soy?',                      anchor: '¿Qué tipo de dador soy?' },
  { title: '¿Cuál quieres ser?',                           anchor: '¿Cuál quieres ser?' },
  { title: 'Jorge Müller nunca pidió donaciones',          anchor: 'Por medio de la fe y la oración, Jorge Müller' },
  { title: 'Pidiendo bíblicamente',                        anchor: 'Aunque la estrategia de Jorge Müller' },
  { title: '¿Debe un misionero levantar fondos?',          anchor: 'Uno obrero le escribió al Pastor John Piper' },
  { title: 'La ofrenda que a Dios le agrada',              anchor: 'En los dos capítulos de 2 Corintios 8 y 9' },
  { title: '“Me sugirieron dejar de ofrendar”',            anchor: 'Mis primeros meses en Londres' },
  { title: 'Caminos comunes',                              anchor: 'Caminos comunes' },
  { title: 'La Promesa de Fe',                             anchor: 'La Promesa de Fe' },
  { title: 'Financiando las misiones como Iglesia',        anchor: 'Para financiar las misiones necesitamos entender la bendición de la cooperación' },
  { title: 'Nuestra iglesia nos apoya al 100%',            anchor: 'Me llamo Érico y mi esposa Julie' },
  { title: 'Lecciones del campo',                          anchor: 'Algo que nos ayudó a administrar' },
  { title: 'El auto sostenimiento de la iglesia sí es posible', anchor: 'El dinero y las misiones son un asunto más grande' },
  { title: 'El apoyo tiene mil formas',                    anchor: 'Muchas personas piensan que el apoyo' },
  { title: 'No es sólo cuestión de dinero',                anchor: 'Recibimos una carta de un hermano misionero' },
  { title: 'Recoge el dinero de tu misma gente',           anchor: 'Un pastor sudafricano, Nicholás Bhengu' },
  { title: 'Venciendo paradigmas',                         anchor: 'En los comienzos de los años 1970' },
  { title: 'Iglesias unidas levantando fondos',            anchor: 'Muchos candidatos al campo misionero piensan' },
  { title: 'Errores que evitar',                           anchor: 'Qué errores evitar en cuanto a' },
  { title: 'Dando en medio de la pobreza',                 anchor: 'Irene es de una región Indígena' },
  { title: 'Un puñado de arroz',                           anchor: 'Hay muchas maneras de servir a Dios' },
  { title: 'No tengo mucho dinero, pero me gustaría dar',  anchor: 'Te damos ideas prácticas para recaudar' },
  { title: 'p16 · continuación de «Un puñado de arroz»',  anchor: 'subdesarrollados de la India' },
  { title: 'El banco que nunca terminará en bancarrota',   anchor: 'Hay dos problemas principales' },
  { title: 'Un compromiso con Dios, no con el misionero',  anchor: 'Dios no necesita de nuestro dinero' },
  { title: 'p17 · enlace a la herramienta de gastos',      anchor: 'Descarga una herramienta para evaluar' },
  { title: 'Un corazón apasionado por las misiones',       anchor: 'Cuando te comprometes con las misiones' },
  { title: 'Cakes misioneros',                             anchor: 'En el Norte de Londres' },
  { title: '“José el del bar”',                            anchor: 'José llegó a Madrid como misionero' },
  { title: 'p18 · cita «Ayudar a los pobres no es misiones»', anchor: '“Ayudar a los pobres no es misiones' },
  { title: 'Verdades sobre las ofrendas según la Biblia',  anchor: 'Verdades sobre las ofrendas según la Biblia' },
  { title: 'Compromiso y sacrificio',                      anchor: 'Cuando recuerdo el testimonio de la abuelita' },
  { title: 'La Iglesia latina sabe ofrendar',              anchor: 'Por años, en muchos lugares de' },
  { title: 'El dinero es un asunto muy delicado',          anchor: 'El dinero es un asunto muy delicado' },
  { title: 'Panorama de las ofrendas en Latino América',   anchor: 'La primera salida de misioneros latinos' },
  { title: 'No es ofrenda, es sustento',                   anchor: 'Nuestra área de administración' },
  { title: 'Una gira promocional',                         anchor: 'Una Gira Promocional' },
  { title: 'Cuando mi iglesia no tiene una visión misionera', anchor: 'Muchas veces, somos llamados a ir al campo misionero' },
  { title: 'Verlo como ministerio',                        anchor: 'Verlo como ministerio' },
  { title: 'Qué debo enseñar acerca de la ofrenda',        anchor: 'Qué debo enseñar acerca de la ofrenda' },
  { title: 'La ruta correcta para pedir fondos',           anchor: 'La ruta correcta para pedir fondos' },
  { title: 'Listo para responder',                         anchor: 'Listo para responder' },
  { title: 'Secretos para levantar finanzas',              anchor: 'Secretos para levantar finanzas' },
  { title: 'Una singular fiesta del té',                   anchor: 'Una forma de ayudar a que otros hermanos' },
  { title: 'Al estilo latino',                             anchor: 'Levantar fondos misioneros se ve distinto' },
  { title: 'Arma tu presupuesto',                          anchor: 'Arma tu Presupuesto' },
  { title: 'El infaltable presupuesto misionero',          anchor: 'Antes de comenzar a reunir los fondos' },
  { title: 'Presupuesto para misioneros latinos',          anchor: 'Sirviendo en la ventana 10/40' },
  { title: 'Desde la chatarra a la bendición',             anchor: 'El problema no es que no tenemos dinero' },
  { title: 'Puedes hacer contactos para tu misionero',     anchor: 'Puedes hacer contactos para tu misionero' },
  { title: 'Una meta',                                     anchor: 'Una meta' },
  { title: 'Ser misionero bivocacional',                   anchor: 'Los BAM están dirigidos' },
  { title: 'Misionero y quiropráctico',                    anchor: 'En estos últimos años se está haciendo mucho énfasis' },
];

export default {
  revistaId: '4dfMIElcTDO6mY9OaLXiXC',
  coverAssetId: '13ufJSJLynic6eWKdKQN2k',
  date: '2016-02-01',
  skipPages,
  rowPages: new Set([13, 17, 21]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p2 · masthead y cita de otro artículo',
    'p4 · entrevista sin preguntas',
    'p16 · continuación de «Un puñado de arroz»',
    'p17 · enlace a la herramienta de gastos',
    'p18 · cita «Ayudar a los pobres no es misiones»',
    // Infographic text («¿Sabías cuánto habla Dios en la Biblia…?») is
    // interleaved word by word with the opening paragraph.
    'Hablemos de finanzas',
    // The three given types are set in a box whose label is lost.
    '¿Qué tipo de dador soy?',
    '¿Cuál quieres ser?',
    // Each paragraph describes a plan whose name is a heading that the
    // short-frame rule removes, so the plans cannot be told apart.
    'Caminos comunes',
    // Three sub-headings («Pacto con Dios», «Tres tipos de donadores»…) are
    // lost, leaving paragraphs that start mid-thought.
    'La Promesa de Fe',
    // Two couples' tips under one credit, one split mid-sentence («de Lunes a»
    // / «Viernes»), with the attribution repeated.
    'Lecciones del campo',
    // The «Misioneros normalmente tienen 3 a 10 iglesias…» sidebar is
    // spliced word by word into the prose.
    'Iglesias unidas levantando fondos',
    // The article's right column lands in another item (see p16 below), so
    // it ends mid-sentence («los estados más»).
    'Un puñado de arroz',
    // Pull quote splits a sentence between columns and the byline is set as
    // a one-word-per-line column.
    'Compromiso y sacrificio',
    // Two interleaved pull quotes («El diezmo no es nuestro…») and a second
    // column that alternates with the first.
    'La Iglesia latina sabe ofrendar',
    // The figures table lost its subtitle («Sirviendo en la ventana 10/40»)
    // and the «Otras recomendaciones» label.
    'Presupuesto para misioneros latinos',
    // «BAM» is never defined, the lead box is missing, and link prompts are
    // run together.
    'Ser misionero bivocacional',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Fondos misioneros Febrero|Directora:|Equipo Editorial|Estamos al servicio|Coordinadores de tu región|Región |Oficina de Conexiones|VAMOS,)/i,
};
