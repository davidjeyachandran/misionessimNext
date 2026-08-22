/**
 * VAMOS — «Regresando a casa», diciembre 2023
 * (revista 59Gkq2xy4ljQK7tpwCZ8Et).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected. Seventeen articles from this edition are already
 * published and are listed in `live` under their magazine headline, which
 * is often not the title the editor gave the live post — «Retorno del
 * misionero» ran as `sindrome-general-de-adaptacion-y-retorno-del-misionero`,
 * «Commúnicate bien» as `como-te-fue`.
 *
 * This edition's `revista.blogPosts` also feeds the «Regresando a casa»
 * learning route in mi-movilicemos. Extending it was signed off by David
 * on 2026-08-23 before this import ran.
 */

/**
 * 1 cover · 3 TOC.
 *
 * 31 is a three-column worksheet grid (emotion / reaction / suggestion):
 * each cell is its own frame and the pairing across a row is lost. 38 is
 * the courses FAQ, an advert rather than an article.
 */
const skipPages = new Set([1, 3, 31, 38]);

/** Already imported and published by hand — never touched by this import. */
const live = new Set([
  'Regreso del campo misionero: No son vacaciones',
  'Son los mismos y a la vez no lo son',
  '¿CÓMO SE SIENTEN?',
  'Las agencias misioneras acompañan al obrero y a su iglesia',
  '«Nunca nadie había hecho esto por mí»',
  'Prácticas para recibir a tu misionero',
  'Debrief: Procesando lo vivido',
  'Mariposas fuertes',
  'Retorno del misionero',
  'Asuntos prácticos que atender antes de partir',
  'Terminando bien',
  'Saliendo bien',
  'TODO ha cambiado',
  'Tu «hogar» cambia',
  'Te toca hacer un «debrief»',
  'Maneja el choque de reintegrarte',
  'Commúnicate bien',
  'Prepara a tu familia para el regreso',
]);

const articles = [
  { title: 'Expectativas no expresadas',                    anchor: 'De todos los momentos de ser misionero, quizás el tiempo de regreso' },
  { title: 'Regreso del campo misionero: No son vacaciones', anchor: 'Algunas agencias misioneras usan la palabra' },
  { title: 'Términos importantes',                          anchor: '¿Qué término usan las agencias para el tiempo de regreso' },
  { title: '¿Pueden los misioneros ser sinceros?',          anchor: 'A menudo, los misioneros temen compartir sus luchas' },
  { title: 'Son los mismos y a la vez no lo son',           anchor: 'El tiempo pasa más rápido de lo pensado' },
  { title: 'Necesitan tiempo',                              anchor: 'Provean de un tiempo de descanso total al misionero' },
  { title: 'Ideas prácticas para recibir a tu misionero',   anchor: 'Hay tres principios bíblicos básicos para hacer de su regreso' },
  { title: '¿CÓMO SE SIENTEN?',                             anchor: 'PÉRDIDA Y CONFUSIÓN' },
  { title: 'Ayuda a tu misionero',                          anchor: '• Como iglesia es importante que cobijen a esa persona' },
  { title: '¿Quién soy yo cuando no estoy sirviendo?',      anchor: 'Para los misioneros, uno de los retos de su reingreso es redescubrir su identidad' },
  { title: 'Las agencias misioneras acompañan al obrero y a su iglesia', anchor: 'Estas son las formas como las agencias pueden ayudar' },
  { title: 'La Iglesia local es un puerto',                 anchor: 'Una iglesia local debe ser un puerto donde los misioneros puedan zarpar' },
  { title: '«Nunca nadie había hecho esto por mí»',         anchor: 'En el proceso de retorno de un obrero, hemos podido encontrar formas' },
  { title: 'FINANZAS están muy conectadas al cuidado integral', anchor: '• Es un estrés continuo levantar y mantener su apoyo financiero' },
  { title: 'El apoyo financiero post retorno',              anchor: 'El apoyo financiero en las iglesias de Latinoamérica parece ser un tema' },
  { title: 'Prácticas para recibir a tu misionero',         anchor: 'Viaje de Reingreso' },
  { title: 'Ayudando al misionero a reintegrarse',          anchor: 'Mientras estabas lejos; las cosas cambiaron en casa' },
  { title: 'Debrief: Procesando lo vivido',                 anchor: 'Debrief es un desahogo de todas las experiencias vividas' },
  { title: '¿Cuál es el problema?, sólo está volviendo a casa', anchor: 'Tal vez te estés preguntando, ¿por qué un misionero puede sentirse tan afectado' },
  { title: 'Cuidado al comentar',                           anchor: '¿Cómo estuvo tu viaje?' },
  { title: 'Mariposas fuertes',                             anchor: 'Una mujer soltera latina regresó del campo misionero' },
  { title: 'Me siento culpable',                            anchor: 'Muchos misioneros que regresan a casa pueden sentir culpa' },
  { title: 'Sorpréndelos al recibirlos',                    anchor: '•Asegúrate de que haya un pequeño grupo en el aeropuerto' },
  { title: 'Ayudémoslos a sanar el corazón',                anchor: 'Jessie Scarrow de Ritchey, consultora de Cuidado Integral' },
  { title: 'El choque cultural también se da al volver',    anchor: 'A su regreso, el obrero experimenta un choque cultural' },
  { title: 'Retorno del misionero',                         anchor: 'Una investigación realizada por la organización Heartstream Resources' },
  { title: 'Yendo a «casa»',                                anchor: 'Después de haber vivido y servido en otra cultura, tu regreso a casa debe ser alegre' },
  { title: 'Tu reingreso',                                  anchor: '• Recuerda en Quién está tu identidad' },
  { title: 'Date tiempo',                                   anchor: 'Es importante darse cuenta de que el reingreso será un tiempo de ajuste' },
  { title: 'Asuntos prácticos que atender antes de partir', anchor: 'Así como los astronautas cuando empiezan a descender' },
  { title: 'Planeando el regreso a casa',                   anchor: 'Definitivamente, planear un regreso a casa después de haber estado en el campo' },
  { title: 'Coordinando el regreso',                        anchor: 'Tu tiempo en casa no tiene que estar completamente planeado' },
  { title: 'Terminando bien',                               anchor: 'Una de las cosas que pueden aumentar tu estrés' },
  { title: 'Preparándote para tu regreso',                  anchor: 'Es obvio para cualquiera que ha pasado tiempo en el campo darse cuenta' },
  { title: 'No quería dejar a las personas que tanto amo',  anchor: 'Muchas veces, el retorno a casa no es el deseo más profundo' },
  { title: 'Sentimientos comunes',                          anchor: 'Una persona que regresa a su cultura de origen puede experimentar diferentes grados' },
  { title: 'Saliendo bien',                                 anchor: 'Ahora “te sientes en casa” en tu país de acogida' },
  { title: 'Recomendaciones para los misioneros que regresan a casa', anchor: '• Si tú estás a punto de salir del campo, busca un mentor' },
  { title: 'TODO ha cambiado',                              anchor: 'Muchas veces los misioneros tienen expectativas tan altas' },
  { title: 'No te sientas ofendido',                        anchor: 'Tal vez piensas que al regresar todas las personas estarán interesadas' },
  { title: 'Tu «hogar» cambia',                             anchor: 'Cuando regresas no encuentras las mismas personas en la iglesia' },
  { title: 'Buscar ser vulnerables',                        anchor: 'Dios quiere que seamos transparentes y que compartamos nuestras luchas' },
  { title: '«Experimenté más soledad que cuando estaba recién llegada al campo»', anchor: 'Soy una persona que ha estado trabajando por unos años en África' },
  { title: 'Te toca hacer un «debrief»',                    anchor: 'Muchos obreros misioneros experimentan niveles significativos de estrés' },
  { title: '¿Con quién hablo?',                             anchor: 'Es una pregunta que todo misionero tiene al volver a casa' },
  { title: 'Autoevaluación',                                anchor: 'Trabaja a través de estos ejercicios de debriefing' },
  { title: 'Maneja el choque de reintegrarte',              anchor: 'En la última fila de las bancas de una iglesia se encuentra Sofía' },
  { title: 'Sentimiento de no pertenencia',                 anchor: 'Te sientes como un espectador queriendo participar' },
  { title: 'Trampas que evitar',                            anchor: 'Te enfrentarás a muchas situaciones difíciles' },
  { title: 'Commúnicate bien',                              anchor: 'La pregunta más común que oirás cuando regreses a casa' },
  { title: 'Mis Presentaciones',                            anchor: 'Escribe un bosquejo para una charla de 30 minutos' },
  { title: 'Sus hijos los necesitan',                       anchor: 'Cuando se planea el tiempo de licencia (HA), los padres pueden ignorar' },
  { title: '¿Cómo los preparo para lo que está por venir?', anchor: 'Nerviosos y asustados. Felices y totalmente dispuestos' },
  { title: 'Tus hijos observan todo',                       anchor: 'Muchos HTC desarrollan una idea errónea de obtener apoyo' },
  { title: 'Ayudando a los adolescentes',                   anchor: 'Debes intentar de ver el regreso a través de los ojos de tu adolescente' },
  { title: 'Prepara a tu familia para el regreso',          anchor: 'Los padres necesitan mucha' },
  { title: 'Creando un álbum',                              anchor: 'Un álbum puede llegar a ser tu mejor manera de presentación' },
];

export default {
  revistaId: '59Gkq2xy4ljQK7tpwCZ8Et',
  coverAssetId: 'bmCKLOnFWhaJwqvsw8N5d',
  date: '2023-12-01',
  skipPages,
  /**
   * Each of these runs an article across both columns with a second, shorter
   * item below it, so the default column order files the spread's right half
   * inside the item underneath.
   */
  rowPages: new Set([17, 18, 23, 24]),
  live,
  articles,
  /** Sidebars set beside an article that owns the page's only photograph. */
  coverHero: new Set([
    'Sentimiento de no pertenencia',
    'Tus hijos observan todo',
  ]),
  noHeroSkip: new Set(),
  /** p33's photograph sits above «Trampas que evitar», not beside it. */
  heroOverride: {
    'Trampas que evitar': 'doc-33_3.jpg',
  },
  furniture: /^(Jessica Bastidas|Ruth Huarote|Evelyn Subuyuj|Merari Garc[ií]a|Luigi Sarmiento|Geraldyne Velasquez|Ruth Lévano|Sociedad Internacional Misionera|Oficina de Latinoamérica|Desde el escritorio del equipo VAMOS|Tema: Regresando a casa|En este tiempo, queremos descansar|Foto de portada|Para dar una ofrenda|Revistas? recomendadas?|Recursos? recomendados?|Ver el material completo|Ver varios recursos|BPN \(Bienestar)/i,
};
