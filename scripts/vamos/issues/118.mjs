/**
 * VAMOS Nº 118 — article manifest.
 *
 * Height-based headline detection gets ~80% of the boundaries but bleeds
 * wherever a headline is set as outlined vector art (7 pages) or a pull
 * quote is set at headline size. So boundaries are declared instead: each
 * article is anchored by the opening words of its body, which are matched
 * against the PDF text layer.
 *
 * `title` comes from the editorial Word document where it has the article,
 * otherwise from the page-3 table of contents.
 * `anchor` is the start of the article's first body block, verbatim.
 */
export const SKIP_PAGES = new Set([1, 3, 30, 31, 32]);

/** Already imported and published by hand — never touched by this import. */
export const LIVE = new Set([
  'El llamado: más allá de la tarea',
  'Surfeando las olas en el Norte de África',
  'Una puerta para aprovechar en Alemania',
]);

export const ARTICLES = [
  { title: 'Un llamado macedónico para Latinoamérica',      anchor: 'En el silencio de la noche' },
  { title: 'El llamado macedonio sigue llamando',           anchor: 'Lo que queda por delante en la Misión de Dios' },
  { title: 'El llamado macedonio (Hechos 16:9)',            anchor: 'Es cuando un hombre clamó' },
  { title: '¡El llamado macedónico no se negocia!',         anchor: 'Todos los días Dios llama a la puerta' },
  { title: 'Mantén tu oído afinado',                        anchor: 'Luego de volver a pasar al altar' },
  { title: 'Dios guía en formas inesperadas',               anchor: 'Vemos en Hechos 16 a Pablo' },
  { title: 'Guiados por la necesidad, no por la preferencia', anchor: 'Lo que puedo comprender es que hoy' },
  { title: 'Cuando Dios redirige la misión',                anchor: 'Pienso que hoy el llamado' },
  { title: 'Necesidades urgentes',                          anchor: 'El panorama actual de la misión global' },
  { title: 'El llamado: más allá de la tarea',              anchor: 'Hay muchas versiones sobre el llamado' },
  { title: 'Sé apasionado, pero paciente',                  anchor: 'Escuchas acerca de un grupo étnico' },
  { title: 'Requiere amor de lo Alto',                      anchor: 'El amor por las personas a quienes servimos' },
  { title: 'Norte de África dice: ¡VEN y ayúdanos!',        anchor: 'El ministerio en el Norte de África no es ruidoso' },
  { title: 'Los Nómadas: un pueblo no olvidado por Dios',   anchor: 'Uno de los mayores retos de la obra misionera' },
  { title: 'El Medio Oriente dice: ¡VEN y ayúdanos!',       anchor: 'El Medio Oriente sigue siendo una de las regiones' },
  { title: 'Asia Central dice: ¡VEN y ayúdanos!',           anchor: 'Tenemos muchos grupos de personas en Asia Central' },
  { title: 'Ocho países, nueve idiomas, un solo llamado',   anchor: 'El Señor habló profundamente a mi corazón' },
  { title: 'Un llamado urgente desde Asia Central',         anchor: 'La desintegración de la Unión Soviética' },
  { title: 'Surfeando las olas en el Norte de África',      anchor: 'Era un día ventoso y de invierno' },
  { title: 'Con el corazón dispuesto y los pies en movimiento', anchor: 'Cuando Pablo respondió al llamado macedónico' },
  { title: 'Pasos para servir entre los no alcanzados',     anchor: '1. Tener amor por la región y sus pueblos' },
  { title: 'Cómo servir',                                   anchor: 'Dado que no podemos entrar como obreros religiosos' },
  { title: 'No es para todos',                              anchor: 'Las personas interesadas en plantar su propia iglesia' },
  { title: 'Sudán del Sur dice: ¡VEN y ayúdanos!',          anchor: 'SIM está buscando formar un equipo' },
  { title: 'Flexibilidad en la tarea a realizar',           anchor: 'Cuando vamos al campo, muchas veces' },
  { title: 'Un llamado pendiente en la selva de Chiapas',   anchor: 'Hace seis años, el Señor nos habló' },
  { title: 'Los jóvenes dicen',                             anchor: 'Invertir en las próximas generaciones' },
  { title: 'El llamado de la traducción bíblica',           anchor: 'Aunque el acceso a la Biblia ha crecido' },
  { title: 'La visión de "Pasa a Nor Corea"',               anchor: 'En Corea del Norte, el clamor es un silencio' },
  { title: 'Una puerta para aprovechar en Alemania',        anchor: 'Dios ha abierto una puerta especial en Alemania' },
  { title: 'Ver lo que otros no ven',                       anchor: 'Hace algunos años comencé a familiarizarme' },
  { title: 'Un llamado en el silencio',                     anchor: 'Imaginemos cómo escuchar a quienes llaman' },
  { title: 'Pasa por Mozambique',                           anchor: 'Ven, cumple tu tarea con tus dones' },
  { title: '¡Pasa a Chad!',                                 anchor: 'En este país de mayoría islámica' },
  { title: 'El legado perdurable de Aletta Bell',           anchor: 'Aletta Bell desafió la pobreza' },
  { title: '¡Pasa a las amazonas!',                         anchor: 'El Alto Río Negro de la Amazonía' },
  { title: 'Cuidados paliativos en Medio Oriente',          anchor: 'Les invitamos a terapistas físicas' },
  { title: '¿Y la seguridad? Una conversación necesaria',   anchor: 'Reconocemos con honestidad que algunas áreas' },
  { title: 'Los miedos nos manejan',                        anchor: 'Muchas veces los miedos dirigen' },
  { title: 'Guía de estaciones de oración',                 anchor: 'Intercediendo por obreros y la obra de Dios' },
  { title: 'No se priorizan dones y habilidades',           anchor: 'Por favor, no priorices únicamente dones' },
  { title: 'Volver a la Escritura',                         anchor: 'La movilización hoy requiere volver a la Escritura' },
  { title: '¿Cómo evaluamos la "tolerancia al riesgo" de un candidato?', anchor: 'La tolerancia al riesgo no se trata solo del peligro' },
  { title: 'Las decisiones pasadas son el mejor predictor del comportamiento futuro', anchor: 'Necesitamos hacer preguntas que revelen' },
  { title: '¿Buscas dónde Dios te puede usar?',             anchor: 'Con frecuencia escucho la frase' },
];
