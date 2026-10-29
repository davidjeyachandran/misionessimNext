/**
 * VAMOS — «Misiones en zona de conflicto», abril 2010
 * (revista 1sITprKGaRBvFkKtiajiDH).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 *
 * A four-page 2010 e-zine: two features, an interview and testimonies,
 * with pull quotes set inside the measure.
 */

const skipPages = new Set([]);

const articles = [
  { title: 'Una esperanza en medio de la tragedia',           anchor: 'debajo de una pared' },
  { title: 'Las consecuencias y necesidades en zona de conflicto', anchor: 'timas de la tragedia' },
  { title: 'Llevando el evangelio en medio de la guerrilla',  anchor: 'El precio es alto por llevar' },
  { title: 'Trabajando por amor a Cristo entre los que sufren', anchor: 'La misionera indonesa radicada en Brasil' },
  { title: 'El dolor de una traición',                        anchor: 'Miriam Días Rivera es doctora' },
  { title: 'SIM en la zona de desastre en Chile',             anchor: 'Esta semana ha sido muy ocupada' },
  { title: 'p4 · footer',                                     anchor: 'Tu iglesia local te envía' },
];

export default {
  revistaId: '1sITprKGaRBvFkKtiajiDH',
  coverAssetId: '5cY1YN7A9AKctQZGtWzqVj',
  date: '2010-04-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    'p4 · footer',
    // Haiti pull quotes and the C.S. Lewis epigraph are spliced word by word
    // into the opening feature.
    'Una esperanza en medio de la tragedia',
    // Stendal / Guzmán pull quotes are spliced into the prose.
    'Llevando el evangelio en medio de la guerrilla',
    // Starts mid-word («timas de la tragedia») — the first line is lost in
    // the headline frame.
    'Las consecuencias y necesidades en zona de conflicto',
    // The testimony is split by masthead lines and the second half is
    // headed «TESTIMONIO».
    'El dolor de una traición',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Abril|2010|Misiones en zona|El Dolor De Una Traición|Por:|equipo editorial|Editora:|Tu iglesia local te envía)/i,
};
