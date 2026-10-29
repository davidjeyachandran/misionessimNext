/**
 * VAMOS — «Volviendo a casa», enero 2011
 * (revista 3lgdtxsbgeUosZzrlQQDmu).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A five-page 2011 newsletter: A4, two or three columns, sidebars and pull
 * quotes set beside the prose, "ideas prácticas" box on one page.
 */

const skipPages = new Set([]);

const articles = [
  { title: 'Ayudando al misionero a reintegrarse',  anchor: 'Si alguna vez estuviste fuera de tu país' },
  { title: 'Readaptándome a mi cultura',            anchor: 'Jorge Aguirre, misionero de la Alianza' },
  { title: 'p2 · continuación de Ayudando al misionero', anchor: 'Estos sentimientos son completamente normales' },
  { title: 'Sorpréndelos al recibirlos',            anchor: 'Asegúrate de que haya un pequeño grupo' },
  { title: 'Ten en cuenta',                         anchor: 'Los misioneros tienen periodos en los que' },
  { title: 'Consejos para la iglesia',              anchor: 'Algunos misioneros dan sus consejos' },
  { title: 'p3 · ideas prácticas para involucrarte', anchor: 'Oración: • Ora diariamente' },
  { title: 'p3 · entrevista Ayudémoslos a sanar el corazón', anchor: 'Jessie Scarrow de Ritchey es misionera' },
  { title: '¿Cuál es el problema?, sólo está volviendo a casa', anchor: 'Tal vez te estés preguntando' },
  { title: 'p4 · Debrief',                          anchor: 'debrief' },
  { title: 'Cómo puedes manejar el choque de reintegrarte', anchor: 'En la última fila de las bancas' },
  { title: 'p5 · pie de página',                    anchor: 'La revista SIM tiene varios temas' },
];

export default {
  revistaId: '3lgdtxsbgeUosZzrlQQDmu',
  coverAssetId: '5dCcHTNbpiRTHttlGaznXy',
  date: '2011-01-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Page 1 ends «continúa en la página 2»; the right-hand testimony sits
    // between it and its continuation, so the article stops mid-argument.
    'Ayudando al misionero a reintegrarse',
    // The interview's answer is set in a wider frame than its heading, so
    // the question and the answer land in the wrong order.
    'p3 · entrevista Ayudémoslos a sanar el corazón',
    'p5 · pie de página',
    'p2 · continuación de Ayudando al misionero',
    'Sorpréndelos al recibirlos',
    'Ten en cuenta',
    'Consejos para la iglesia',
    'p3 · ideas prácticas para involucrarte',
    'p4 · Debrief',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Enero|2011|Tema:|Por:|equipo editorial|Directora:|ezine\.|Sandra Chiang|Tu iglesia local|web:|La revista SIM|misionessim\.org|VOLVIENDO A CASA|Hay más de 200 ideas|VAMOS ya está)/i,
};
