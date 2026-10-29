/**
 * VAMOS — «SIDA», diciembre 2010
 * (revista 3OZwXURGTehPEfUQYxyrfa).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A six-page 2010 e-zine: a cover feature that jumps to p2, short
 * features, testimonies and an interview, with pull quotes and sidebars
 * set inside the measure.
 */

const skipPages = new Set([]);

const articles = [
  { title: 'La respuesta al mal del SIDA',                    anchor: 'enía sólo ocho años de edad' },
  { title: 'p1 · sidebar cuatro estrategias',                 anchor: 'Servir a la iglesia y a otros asociados' },
  { title: '¡Despierta!, es hora de actuar',                  anchor: 'Sabemos que Jesucristo es la respuesta al dolor' },
  { title: 'Entrevista a Diane Marshall',                     anchor: 'Diane Marshall es consultora de SIM' },
  { title: 'Como cristiano puedes dar una respuesta práctica', anchor: 'Como cristiano puedes dar una respuesta práctica' },
  { title: 'p3 · sidebar ora',                                anchor: 'ora' },
  { title: 'Amor y ayuda práctica los llevará a Dios',        anchor: 'Nery Torres, misionera peruana' },
  { title: 'Ministrando con amor',                            anchor: 'En una casa de Costa Rica' },
  { title: 'Mike y Jacky Hammond, coordinadores en Malawi',   anchor: 'Mike es un ingeniero químico' },
  { title: 'p4 · pull quote Patrick Dixon',                   anchor: 'No se puede cambiar a todo el mundo' },
  { title: 'Historias asombrosas',                            anchor: 'El ministerio “Esperanza para el SIDA” está siendo' },
  { title: 'p5 · Un nuevo tipo de voluntarios',               anchor: 'Zimbabwe: Farai' },
  { title: 'p5 · Que los pequeños no dejen de soñar',         anchor: 'Los hermanitos Wiseman' },
  { title: 'p5 · pull quote Costas',                          anchor: 'La fe Cristiana es el compromiso' },
  { title: 'Responder con valentía',                          anchor: 'Dios es misericordioso y está pendiente' },
  { title: 'p6 · preguntas para discutir',                    anchor: 'Mira en tu barrio o en tu ciudad' },
  { title: 'p6 · foro',                                       anchor: 'Visita el foro de nuestra pag. web' },
  { title: 'Los latinos podemos responder',                   anchor: 'Myriam y David Trott' },
  { title: 'p6 · masthead',                                   anchor: 'Para bajar la revista SIM' },
  { title: 'La prevención es parte de la lucha',              anchor: 'Era un viaje corto de misiones' },
  { title: 'p6 · footer',                                     anchor: 'Tu iglesia local te envía' },
];

export default {
  revistaId: '3OZwXURGTehPEfUQYxyrfa',
  coverAssetId: '7M9HgEXl4K0L3niAxb7e5Y',
  date: '2010-12-01',
  skipPages,
  /** p3 sets the Nery Torres testimony across two columns that read left to right. */
  rowPages: new Set([3]),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p1 · sidebar cuatro estrategias',
    'p3 · sidebar ora',
    'p4 · pull quote Patrick Dixon',
    'p5 · Un nuevo tipo de voluntarios',
    'p5 · Que los pequeños no dejen de soñar',
    'p5 · pull quote Costas',
    'p6 · preguntas para discutir',
    'p6 · foro',
    'p6 · masthead',
    'p6 · footer',
    // The drop cap «T» of «Tenía sólo ocho años» is a separate frame, so the
    // article opens «enía sólo ocho años», and its text ends with a stray
    // «.. continúa en la página 2».
    'La respuesta al mal del SIDA',
    // The caption «(Nery es la tercera)» is run into the middle of a sentence.
    'Amor y ayuda práctica los llevará a Dios',
  ]),
  /** p6 carries no photograph at all. */
  coverHero: new Set(['Responder con valentía', 'Los latinos podemos responder', 'La prevención es parte de la lucha']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Diciembre|2010|Tema:|Por:|ENTREVISTA|OPORTUNIDADES|Directora:|equipo editorial|Tu iglesia local te envía)/i,
};
