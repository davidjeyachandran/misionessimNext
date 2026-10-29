/**
 * VAMOS — «La movilización misionera», diciembre 2013
 * (revista 49DqUNSlOQHaxQRyyrDOwd).
 *
 * A 20-page A4 issue in the 2013 newsletter layout: one or two articles per
 * page with many sidebars, quote boxes, labelled lists and pull quotes set
 * inside the measure.
 */

/** 1 cover (image only) · 20 resource links and adverts. */
const skipPages = new Set([1, 20]);

const articles = [
  { title: 'Movilizando a las iglesias hacia la misión',    anchor: 'Desde hace 20 años La misión no es una actividad más' },
  { title: 'Cada misionero es movilizador',                 anchor: 'Los misioneros que regresan son de mucha ayuda' },
  { title: 'Dispuestos a hacer grandes cosas',              anchor: 'Los cristianos que tienen la visión de contribuir' },
  { title: 'p3 · cita sobre movilizar a cien misioneros',   anchor: 'La persona que puede movilizar a cien misioneros' },
  { title: 'Llamado a multiplicar fuerzas',                 anchor: 'Cada creyente es llamado de tres maneras' },
  { title: 'p3 · oración Trabajemos juntos',                anchor: 'Señor, mueve nuestros corazones' },
  { title: 'Cumplamos la Gran Comisión: mi compromiso con Jesucristo', anchor: 'Hasta lo último de la tierra es una de las cosas' },
  { title: 'p5 · Recibiendo',                               anchor: '• Cursos sobre misiones como Perspectivas' },
  { title: 'p5 · Dando',                                    anchor: 'Compartiendo todo lo recibido' },
  { title: 'Presentando el desafío misionero',              anchor: 'Hace 58 años, el Pastor Andrés Robert' },
  { title: '¿Cuánto se logra con una conferencia misionera?', anchor: 'El Pastor Andrés Robert nos comparte' },
  { title: 'p7 · Un compromiso entre el dador y Dios',      anchor: 'La Promesa de Fe es un compromiso voluntario' },
  { title: 'En la movilización, RAIM la hace re-bien',      anchor: 'La Red de Apoyo Integral al Misionero celebra 20 años' },
  { title: 'En RAIM encontrarás sanas para servir',         anchor: '• Oración semanal.' },
  { title: 'RAIM moviliza a la mujer',                      anchor: 'No solo están movilizando sino que también se cuidan' },
  { title: 'Trajes típicos',                                anchor: 'Casi todos los fines de semana hay pedidos' },
  { title: 'Llámese grupo, ministerio, departamento',       anchor: 'Llámese grupo, ministerio, departamento' },
  { title: 'Hudson Taylor tenía fe en un gran Dios',        anchor: 'Mirando a los millones de no alcanzados' },
  { title: 'La capacitación en la movilización',            anchor: 'Cada movilizador/promotor misionero tiene que conocer' },
  { title: 'Asume el desafío',                              anchor: 'Es importante darse cuenta de cómo Dios puede usar' },
  { title: 'Carácter del movilizador',                      anchor: 'Poseer carácter firme, cultivar una integridad genuina' },
  { title: 'Los pastores son la clave',                     anchor: 'El rol de del pastor en la movilización es clave' },
  { title: 'Pastores: pónganlo en práctica',                anchor: '• Presenten la visión clara del por qué' },
  { title: 'Barreras a brincar en la movilización', anchor: 'Dios le reveló a Moisés su propósito' },
  { title: 'p14 · titular 1. Motivación / Inspiración',   anchor: '1. Motivación / Inspiración' },
  { title: 'Motivación e inspiración',                      anchor: 'El impacto con el mandato de Dios' },
  { title: 'Preparación y entrenamiento',                   anchor: 'En esta fase vemos pasos de rendición' },
  { title: 'p14 · Para los que serán enviados',             anchor: 'Para los que serán enviados como misioneros' },
  { title: 'p14 · Misión',                                  anchor: 'Finalmente, todos los que satisfactoriamente' },
  { title: 'Yo soy hincha ejemplar: fanáticos por la obra', anchor: 'Imagínate que tu país irá a la Copa Mundial' },
  { title: 'Solo Dios despierta a las iglesias',            anchor: 'Dios empezó a trabajar en nuestras vidas sobre la movilización' },
  { title: 'p15 · Hagamos misiones, no solamente hablemos', anchor: 'HAGAMOS MISIONES, NO SOLAMENTE' },
  { title: 'p15 · oración por los movilizadores',           anchor: 'Esto es diferente a la oración por los misioneros' },
  { title: 'p15 · Sin Dios no lo podemos hacer',            anchor: 'Sin Dios no lo' },
  { title: 'Movida: moviendo vidas',                        anchor: 'Más que un evento... muchas vidas en movimiento' },
  { title: 'p16 · Pastores, son muy bienvenidos',           anchor: 'Hace algunos años han instaurado el programa' },
  { title: 'p16 · CIMA 2014 «Supra Life»',                  anchor: 'Consta de dos partes' },
  { title: 'La voz de los movilizadores',                   anchor: 'Para mi comenzó con un sueño' },
  { title: 'Envíame a movilizar',                           anchor: 'Es cuando estás en acción, que vas a descubrir' },
  { title: '¡Dios está movilizando a Honduras!',            anchor: 'Dios nos ha permitido en estos dos años que pasaron' },
];

export default {
  revistaId: '49DqUNSlOQHaxQRyyrDOwd',
  coverAssetId: '2ITCvTnWz6sfP6DEVPx8ya',
  date: '2013-12-01',
  skipPages,
  rowPages: new Set(),
  live: new Set(),
  articles,
  dropArticles: new Set([
    // Pull quote «Desde hace 20 años…» is spliced into the first sentence.
    'Movilizando a las iglesias hacia la misión',
    // Pull quotes and the sub-headings are spliced into the paragraphs
    // («Parece que sólo un pequeño Ps. Jorge V…»).
    'Cumplamos la Gran Comisión: mi compromiso con Jesucristo',
    // A pull quote repeats a sentence with the speaker's name spliced in.
    'En la movilización, RAIM la hace re-bien',
    // Pull quotes («Las mujeres tienen mucha creatividad.») and a speaker's
    // name interleaved with the paragraphs.
    'RAIM moviliza a la mujer',
    // Sub-headings lost and the right-hand column picks up mid-sentence
    // («actitudes y el pesimismo…»), so the labelled list misreads.
    'Carácter del movilizador',
    // Bullets from two columns alternate line by line.
    'Pastores: pónganlo en práctica',
    // Ends mid-sentence: the right-hand continuation is isolated below.
    'Movida: moviendo vidas',
    // Several pull quotes, captions and names spliced into one paragraph.
    'Envíame a movilizar',
    // The columns alternate («es tan importante Si Dios te llama, Él…»).
    'La voz de los movilizadores',
    'p3 · cita sobre movilizar a cien misioneros',
    'p3 · oración Trabajemos juntos',
    'p5 · Recibiendo',
    'p5 · Dando',
    'p7 · Un compromiso entre el dador y Dios',
    'p14 · Para los que serán enviados',
    'p14 · Misión',
    'p14 · titular 1. Motivación / Inspiración',
    'p15 · Hagamos misiones, no solamente hablemos',
    'p15 · oración por los movilizadores',
    'p15 · Sin Dios no lo podemos hacer',
    'p16 · Pastores, son muy bienvenidos',
    'p16 · CIMA 2014 «Supra Life»',
  ]),
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Diciembre|2013|Tema:|Movilización$|Por:|Por Cecilia|Equipo Editorial|Directora:|VAMOS, SIM|web:)/i,
};
