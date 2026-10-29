/**
 * VAMOS — «Resolución de conflictos», enero 2012
 * (revista 6H115Zsgy0jwre3zMpFB6Q).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * An 8-page A4 issue (pp. 2-9), one headline per article, two-column body
 * with pull quotes and sidebars set inside the measure.
 */

/** 1 cover (image only). */
const skipPages = new Set([1]);

const articles = [
  { title: 'Cuando salen las garras',        anchor: '“Nunca había tenido tantos problemas' },
  { title: 'Aceptando las espinas',          anchor: 'Un misionero no está libre de' },
  { title: '¡Enfrenta los problemas!',       anchor: 'Siempre parece más fácil evitar' },
  { title: 'Tratando el conflicto',          anchor: 'Los conflictos no desaparecen por sí solos' },
  { title: 'Detonadores de conflictos',      anchor: 'Hay muchas razones por las que pueden' },
  { title: 'Clasificando los conflictos',    anchor: 'La siguiente lista es del libro' },
  { title: 'Personalidades desafiantes',     anchor: 'Todos tenemos diferentes' },
  { title: 'Conviviendo con las diferencias', anchor: 'Si quieres llevarte bien con un Sanguíneo' },
  { title: 'Recuerda cómo quieres ser tratado', anchor: 'Muchas veces sabemos las pautas bíblicas' },
  { title: 'Escoge tus batallas',            anchor: '¿Son todos los problemas dignos' },
  { title: 'Tranquilizando las aguas',       anchor: 'Unos consejos prácticos para solucionar' },
];

export default {
  revistaId: '6H115Zsgy0jwre3zMpFB6Q',
  coverAssetId: '6uKVPBlOKt7SyvlDKUSf0Y',
  date: '2012-01-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // The «Aceptando las espinas» sidebar is set into the middle of the story:
    // the opening splits mid-sentence and the sidebar's words are spliced in.
    'Cuando salen las garras',
    // Personality grid: every «Para el Flemático / Colérico…» label is lost,
    // so the advice reads as unattributed.
    'Conviviendo con las diferencias',
    // «Sigue CONFLICTOS» / «de la página 4» jump line is run into the middle
    // of a sentence where the article crosses pages.
    'Detonadores de conflictos',
    // Pull quote spliced word-by-word into the first paragraph.
    'Recuerda cómo quieres ser tratado',
  ]),
  coverHero: new Set(['Tranquilizando las aguas']),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Enero|2012|Resolución de Conflictos|Tema:|Por:|Equipo Editorial|Directora:|Joseph Conrad|Sigue CONFLICTOS|La revista SIM tiene|Encontrarás muchos|misionessim\.org)/i,
};
