/**
 * VAMOS — «Redes sociales», agosto 2013
 * (revista 3ki3RqLFRYAjJlrPvXPgE3).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A 17-page A4 issue, one or two articles per page in a two-column grid,
 * with an infographic sidebar on most pages.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'El gran éxito de la era digital',               anchor: 'Hoy, las redes sociales ya son parte de nuestro día' },
  { title: 'Colonizando el internet para Cristo',           anchor: 'Israel García reside no muy lejos de Trujillo' },
  { title: 'Las etnias no alcanzadas, a la distancia de un clic', anchor: 'María forma parte del ministerio Impacto Mundial' },
  { title: 'A bajo precio pero de manera eficaz',           anchor: 'Un estudio del Strategic Research Center' },
  { title: 'Nuestra responsabilidad frente a esta generación', anchor: 'Los jóvenes latinoamericanos aprenden' },
  { title: 'Un pastor suelto en Facebook',                  anchor: 'En la actualidad, ¡si no te encuentran en Facebook' },
  { title: 'Por su Facebook los conoceréis',                anchor: 'Griselda Delgado de República Dominicana' },
  { title: 'Facebook es un éxito en Latinoamérica',         anchor: 'Actualmente Facebook es la red social más importante' },
  { title: 'Las redes sociales al servicio de la evangelización', anchor: 'Especialidades Juveniles Uruguay, es un' },
  { title: 'Siendo efectivo en la evangelización online',   anchor: 'No sólo debemos quedarnos en postear' },
  { title: 'El mundo musulmán y las redes sociales',        anchor: 'Mientras en Latinoamérica muchas veces' },
  { title: 'Durante el Ramadán',                            anchor: 'Los musulmanes son muy activos en el uso' },
  { title: '¡Detente 3 minutos!… y estudia la Palabra de Dios', anchor: 'Hoy en día, las redes sociales son una de las mayores causas' },
  { title: 'La clave del éxito en social media está en la interacción', anchor: 'Nuestra misión como creyentes evangélicos' },
  { title: 'Evangelismo y discipulado online',              anchor: 'Actualmente, la innovación tecnológica' },
  { title: 'Pautas evangelísticas en Facebook',             anchor: '• Agrupa a tus amigos por categorías' },
  { title: 'Impacto y seguimiento',                         anchor: 'Global Media Outreach (GMO), registra' },
  { title: 'Vidas transformadas',                           anchor: 'Nací en una familia hindú' },
  { title: 'Las redes: son herramientas puestas por Dios',  anchor: 'Askenaz, es un ministerio juvenil' },
  { title: 'Pautas para el buen uso de las redes sociales', anchor: 'Cumplir la misión en la actualidad' },
  { title: 'Moviendo vidas por redes sociales y eventos',   anchor: 'MOVIDA (Moviendo Vidas) siembra' },
  { title: 'Facebook, arma de doble filo… el efecto viral', anchor: 'Lola, una misionera en China' },
  { title: 'Llegar a millares de personas desde la computadora', anchor: 'Por experiencia propia he descubierto' },
  { title: 'p9 · pull quote con nombres intercalados',      anchor: 'Queremos ir un paso más allá' },
  { title: 'p17 · cifra de la infografía',                anchor: '1,060 millones' },
  { title: 'Las redes sociales son sociales: no discuta',   anchor: 'Si vas a evangelizar a través de las redes sociales' },
  { title: 'p17 · la Biblia gratis en tu teléfono',         anchor: 'Descarga la Biblia App gratis' },
];

export default {
  revistaId: '3ki3RqLFRYAjJlrPvXPgE3',
  coverAssetId: '1SSIWiXws6TWaWFrJ5dpAB',
  date: '2013-08-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p17 · la Biblia gratis en tu teléfono',
    'p9 · pull quote con nombres intercalados',
    'p17 · cifra de la infografía',
    // Infographic labels («de los usuarios», «son») spliced into the prose.
    'Las etnias no alcanzadas, a la distancia de un clic',
    // Pull quote «El uso de la tecnología es profundamente espiritual…»
    // interleaved word by word with the opening paragraph.
    'Nuestra responsabilidad frente a esta generación',
    // Infographic bullets broken mid-sentence across frames.
    'Facebook es un éxito en Latinoamérica',
    // Caption «Andrés Corrales, de Costa Rica, es director…» interleaved
    // with the closing paragraph.
    'Las redes sociales al servicio de la evangelización',
    // Pull quote «Compartamos entonces cómo Dios está cambiando tu vida»
    // spliced into the bullet list.
    'Siendo efectivo en la evangelización online',
    // A stray «Además,» is spliced into a sentence.
    '¡Detente 3 minutos!… y estudia la Palabra de Dios',
    // Caption «Pastor Wolfgang Streich…» and pull quote interleaved with
    // the closing paragraph.
    'La clave del éxito en social media está en la interacción',
    // Bullet list with a pull quote spliced into two of its items.
    'Pautas evangelísticas en Facebook',
    // Names «a cargo de Edén López» interleaved with a sentence.
    'Las redes: son herramientas puestas por Dios',
    // Caption «Dr. Miguel Ángel Núñez…» interleaved with the prose.
    'Pautas para el buen uso de las redes sociales',
    // Stray «Parte» labels inside the event listing.
    'Moviendo vidas por redes sociales y eventos',
    // Pull quote «Fe y acción, dos elementos que debemos aplicar…» spliced
    // into the prose.
    'Llegar a millares de personas desde la computadora',
  ]),
  /**
 * No photograph on these pages: p2 carries only a globe clip art, p15 a
 * diagram and a «Me gusta» icon, p17 a screenshot of an unrelated Bible app.
 */
  coverHero: new Set([
    'Colonizando el internet para Cristo',
    'Facebook, arma de doble filo… el efecto viral',
    'Las redes sociales son sociales: no discuta',
  ]),
  noHeroSkip: new Set(),
  heroOverride: {
    // The three testimonies' faces rather than the website screenshot; the
    // screenshot fits the GMO results piece instead.
    'Vidas transformadas': 'doc-12_3.jpg',
    'Impacto y seguimiento': 'doc-12_6.jpg',
  },
  furniture: /^(Facebook, arma de doble filo\.\.\.|1,060 millones|Tema:|Por |Directora:|Equipo Editorial|VAMOS, SIM|web:)/i,
};
