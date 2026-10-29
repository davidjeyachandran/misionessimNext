/**
 * VAMOS — «Biocupacionales», agosto 2010
 * (revista 1AkwZt0quakbx6U8m6TSGq).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A four-page 2010 e-zine: a cover story, a three-column spread of short
 * pieces and a definitions page, with pull quotes set inside the measure.
 */

/** 3 sets the criteria A/B/C in side-by-side cells and the B1-B5 types across a column break. */
const skipPages = new Set([3]);

const articles = [
  { title: 'Profesionales con llamado se busca a las misiones', anchor: 'Yerko Clavero es un skater chileno' },
  { title: 'Una familia fuera de serie',                      anchor: 'Jim y Beth han sido biocupacionales' },
  { title: 'p2 · pull quote Hans Ziefle',                     anchor: 'Una profesión no es el camino' },
  { title: 'Trabajar y predicar van de la mano',              anchor: 'El significado de buena ética de trabajo' },
  { title: 'Atrévete a ser diferente',                        anchor: 'Un profesional que recibe el llamado' },
  { title: 'p2 · pull quote hacedores de tiendas',            anchor: 'Los hacedores de tiendas' },
  { title: '¿Dónde comenzar?',                                anchor: 'Si crees que Dios te está llamando' },
  { title: 'p4 · masthead y pull quotes',                     anchor: 'Para bajar la revista SIM' },
  { title: 'Enseñando inglés y encendiendo un fuego',         anchor: 'David de Canadá comenzó' },
  { title: 'p4 · footer',                                     anchor: 'Tu iglesia local te envía' },
];

export default {
  revistaId: '1AkwZt0quakbx6U8m6TSGq',
  coverAssetId: '3bACtWB8JUTt8IpqN1H6g1',
  date: '2010-08-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p2 · pull quote Hans Ziefle',
    'p2 · pull quote hacedores de tiendas',
    'p4 · masthead y pull quotes',
    'p4 · footer',
    // The pull quote «Los biocupacionales son discípulos…» is spliced
    // word by word into the bulleted list.
    '¿Dónde comenzar?',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  /** Both photographs are on the page but score as greyscale or are taken by the neighbouring article. */
  heroOverride: {
    'Atrévete a ser diferente': 'doc-2_4.jpg',
    'Enseñando inglés y encendiendo un fuego': 'doc-4_3.jpg',
  },
  furniture: /^(Agosto|2010|Tema:|Por:|TESTIMONIO|Directora:|equipo editorial|Tu iglesia local te envía)/i,
};
