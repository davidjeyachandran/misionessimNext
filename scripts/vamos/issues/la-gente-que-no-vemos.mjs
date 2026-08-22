/**
 * VAMOS — «La gente que no vemos», septiembre 2024
 * (revista 6oeh4InYoC0A9zCYGaBtWu).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected. Nothing from this edition was published by hand, so
 * there is no `live` set.
 */

/** 1 cover · 3 TOC · 32 back cover (no text frames). */
const skipPages = new Set([1, 3, 32]);

const articles = [
  { title: 'El trajín diario nos traiciona',                anchor: 'Hay en nuestro mundo personas, que por una u otra razón, son ignoradas' },
  { title: 'Quiero ver con tus ojos, corazón',              anchor: 'Cuando leemos los Evangelios, vemos ejemplo tras ejemplo' },
  { title: 'Los marginados e ignorados',                    anchor: 'SIM surgió como asociación misionera y sigue sirviendo' },
  { title: 'Solo nos queda obedecer',                       anchor: 'Me llamó la atención un grupo de migrantes haitianos' },
  { title: '¿Cómo crecemos en compasión?',                  anchor: 'Durante sus años sirviendo con SIM en lugares difíciles, Carolina' },
  { title: 'Disposición sacrificial para servir',           anchor: 'Muchas veces leemos o escuchamos la parábola del buen samaritano' },
  { title: 'Una vida rendida a Dios',                       anchor: 'Así como Jesús había venido para buscar y salvar' },
  { title: 'Iglesia: defiende al débil y al huérfano',      anchor: 'Un ciclo perverso es el que deja a muchos niños abandonados' },
  { title: 'Míralos y abrázalos',                           anchor: 'Cristo abrazó a la humanidad en la cruz' },
  { title: 'Es un privilegio mostrarles el perdón de Dios', anchor: 'Llevarles esperanza a las mujeres en riesgo es muy gratificante' },
  { title: 'Llevando la reconciliación a las ciudades',     anchor: 'Para cambiar la pobreza, no solo necesitamos de la ayuda social' },
  { title: 'Nuestro gozo es la respuesta',                  anchor: 'Sirvientes en cooperación' },
  { title: 'Siempre vamos a tener a los pobres entre nosotros, ¿no?', anchor: 'Mucha gente se toma solo un versículo y lo saca de contexto' },
  { title: 'No podían ocultar su pecado',                   anchor: 'En tiempos de Cristo, las prostitutas y los recaudadores de impuestos' },
  { title: '¿Qué dice la Biblia sobre la pobreza, la compasión y la igualdad?', anchor: 'Dios establece leyes especiales a favor de los pobres y las viudas' },
  { title: 'Jesús ve con amor y compasión',                 anchor: 'He comprendido que a través de lo que hago' },
  { title: 'Ya no es ajeno, estamos sin excusa',            anchor: 'Particularmente, en Venezuela, los rostros de los que están en situación de calle' },
  { title: 'La Iglesia y el gobierno son responsables',     anchor: 'Aunque la Iglesia y el gobierno son dos instituciones constituidas por Dios' },
  { title: '¿Qué hacer con los mendigos?',                  anchor: 'En toda iglesia debemos tener conciencia de la necesidad material' },
  { title: '«Le debo mi vida»',                             anchor: 'La Gran Comisión se está volviendo la gran omisión' },
  { title: 'Un kilo de amor',                               anchor: 'Levanta una misión para tu iglesia' },
  { title: 'Avivamiento en el cementerio de los misioneros', anchor: 'Níger (África Occidental) es conocido como el cementerio de los misioneros' },
  { title: 'Merecen tener la oportunidad de servir',        anchor: 'Esta es la historia de Alicia, una niña con síndrome Down' },
  { title: 'Vayan pronto',                                  anchor: 'Jesús dijo' },
  { title: '«Yo dependo de las fuerzas del Dios que no se cansa»', anchor: 'Una silla de ruedas no puede limitar un corazón comprometido' },
  { title: 'Los hizo perfectamente sordos',                 anchor: 'Hemos conversado con Telma Pineda, guatemalteca' },
  { title: 'Un grupo no alcanzado: los sordos',             anchor: 'Personalmente mis ojos se abrieron al ser expuesto a personas sordas' },
  { title: '«Dios me llamó para servir a la comunidad sorda del Perú»', anchor: 'En un inicio mi mamá no podía concebir' },
  { title: 'Corazones Unidos',                              anchor: 'Esta labor es principalmente evangelística y misionera' },
  { title: 'Guía de oración y lectura para desarrollar la compasión', anchor: 'Aquí hay diez cosas por las cuales podrías orar' },
  { title: 'Las naciones tocan a la puerta',                anchor: 'El pastor José Antonio Altamirano nos cuenta cómo ha participado la iglesia' },
  { title: 'No vemos el problema de salud emocional',       anchor: '¿Sabías que, según el estudio Cultura Juvenil Global' },
  { title: 'Amar a los marginados',                         anchor: 'La Clínica Doro, en Sudán del Sur, ya atendía a una comunidad enorme' },
  { title: 'Cuidados cuando la vida llega a su fin',        anchor: 'Al ayudar a las personas a prepararse para la muerte' },
  { title: 'Compasión como Jesús tenía',                    anchor: 'Cuando Jesús estuvo en la tierra, Su ministerio lo dedicó a alcanzar' },
  { title: 'Cultivar la compasión',                         anchor: '¿Cómo podemos desarrollar la cualidad bíblica de la compasión' },
  { title: 'Movilizar a otros a ver y accionar',            anchor: 'Nos toca actuar como los profetas para esta' },
  { title: 'Enfrenta los miedos para movilizarlos',         anchor: 'Sus ojos no ven, su corazón no se mueve' },
];

export default {
  revistaId: '6oeh4InYoC0A9zCYGaBtWu',
  coverAssetId: '2IWRcMEDfqvxFlP156jxZN',
  date: '2024-09-01',
  skipPages,
  /** p5 runs the lead feature across both columns above a second article. */
  rowPages: new Set([5]),
  live: new Set(),
  articles,
  /**
   * p31 sets its sidebar as a narrow label column inside the measure, so
   * this one frame interleaves with the body word by word. Anchored only to
   * keep that text out of «Cultivar la compasión», then dropped.
   */
  dropArticles: new Set(['Movilizar a otros a ver y accionar']),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  /**
   * p29's own photograph is a black-and-white portrait, which scores as
   * greyscale furniture, so the article below it steals the right-hand
   * photo and «Compasión como Jesús tenía» is left with none.
   */
  heroOverride: {
    'Cuidados cuando la vida llega a su fin': 'doc-29_4.png',
  },
  furniture: /^(Evelyn Subuyuj|Luigi Sarmiento|Geraldyne Velasquez|Jessica Bastidas|Sociedad Internacional Misionera|Oficina de Latinoamérica|Desde el escritorio del equipo VAMOS|Tema: La gente que no vemos|Hay en nuestro mundo personas que son ignoradas|Para dar una ofrenda|Revistas? recomendadas?|Ver el episodio completo|Encuentra más información sobre|Ponte en contacto con|la inclusión de las personas con condición de discapacidad)/i,
};
