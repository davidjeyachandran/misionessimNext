/**
 * VAMOS — «Cuidado Integral bíblico y solidario», marzo 2025
 * (revista 5cF4KxVOXpbTwV1F45wOYW).
 *
 * See scripts/vamos/README.md for why article boundaries are declared
 * rather than detected.
 */

/**
 * 1 cover · 3 TOC.
 *
 * 25–46 are not this issue. Its own contents page says so — "25 a 45: en
 * las páginas presentamos varias de nuestras Revistas pasadas" — and every
 * spread there closes with "Lee la revista completa en". They are teaser
 * excerpts from earlier editions, so importing them here would file another
 * edition's writing under this one, and 46 is the back-issue index.
 */
const skipPages = new Set([1, 3, ...Array.from({ length: 22 }, (_, i) => 25 + i)]);

/** Published by hand before this import — never touched. */
const live = new Set([
  'Formas en que la iglesia de envío puede fortalecer a los obreros',
  'Preparación integral para misioneros: cinco áreas esenciales',
]);

const articles = [
  { title: 'Cuidado bíblico y solidario',                   anchor: 'La Biblia nos presenta cerca de 100 versículos' },
  { title: 'Incluso Pablo necesitaba el cuidado integral',  anchor: 'El apóstol Pablo, aún con todos sus logros en la misión' },
  { title: 'El cuidado integral del misionero',             anchor: 'Se refiere a un enfoque holístico para apoyar a los misioneros' },
  { title: 'Cuídense unos a otros',                         anchor: 'Esas frases de “unos a otros” revelan la responsabilidad' },
  { title: 'El cuidado es integral',                        anchor: 'Algunas áreas en que no pensamos como cuidado integral' },
  { title: 'Identificar, lanzar e incluir',                 anchor: 'Identificar y nutrir - La iglesia de Antioquía' },
  { title: 'Acompañándolos',                                anchor: 'Grabé en mi corazón los principios que me han acompañado' },
  { title: 'Temas esenciales para el bienestar de misioneros', anchor: 'El cuidado integral del misionero abarca varios aspectos esenciales' },
  { title: 'No llegamos solos: nuestra experiencia en el campo', anchor: 'Desde hace más de 12 años, Dios nos ha estado preparando' },
  { title: 'Cuidado creativo de los hermanos cercanos',     anchor: 'Quiero enfocarme en el rol de la iglesia existente en el campo' },
  { title: 'Enfrentan estrés, aislamiento y desafíos culturales', anchor: 'Un tema crucial que la iglesia debe conocer más en el cuidado integral' },
  { title: 'Formas en que la iglesia de envío puede fortalecer a los obreros', anchor: 'La mayoría de los misioneros en el estudio enfatizaron' },
  { title: 'Preparación integral para misioneros: cinco áreas esenciales', anchor: 'Mi investigación en 2023 sobre 51 misioneros transculturales' },
  { title: 'Aprendemos acerca del cuidado integral',        anchor: 'Algunos pastores admiten que nunca han recibido un buen cuidado' },
  { title: 'Marca una diferencia en el cuidado',            anchor: 'Hay varias cosas simples pero importantes que pueden marcar' },
  { title: 'El cuidado en las etapas de servicio',          anchor: 'El cuidado integral del misionero se puede dividir en tres etapas' },
  { title: 'Dios nos creó como seres integrales',           anchor: 'Cinthia, guatemalteca, sirviendo en Macedonia del Norte' },
  { title: 'Dependiendo de Dios',                           anchor: 'Estar lejos de la cultura, familia e iglesia local genera diversidad' },
  { title: 'La gracia hace la diferencia',                  anchor: 'Ahora todos hablan de cuidado integral' },
  { title: 'Ayúdales a ubicarse en medio de cambios',       anchor: 'He hablado con obreros que tenían una sola visión en el campo' },
  { title: 'Momentos cortos de soledad',                    anchor: 'Pasé varios momentos en los que me sentí sola' },
  { title: 'Cuidemos de la familia',                        anchor: 'Un tema muy importante en el cuidado integral es la familia' },
  { title: '¡La Iglesia envía personas, no superhéroes!',   anchor: 'Muchos misioneros van al campo con expectativas' },
  { title: 'Como un papá atento de su hijo',                anchor: 'Mi iglesia enviadora siempre estuvo atenta a mis necesidades' },
  { title: 'Renueva mis fuerzas para continuar',            anchor: 'Cuando enfrento momentos de incertidumbre y desgaste emocional' },
  { title: 'Se interesaba por nuestro bienestar',           anchor: 'Una pastora de una iglesia que nos apoya constantemente' },
  { title: 'La guerra espiritual es evidencia de efectividad', anchor: 'Cuando el obrero está patinando por mucho tiempo' },
  { title: 'Requiere colaboración y confidencialidad',      anchor: 'A pesar de que disponemos de una amplia variedad de herramientas' },
  { title: 'Un testimonio saludable de cuidado',            anchor: 'Cuando vino la expulsión en el norte de África en el año 2009' },
  { title: 'Los hermanos me cuidan',                        anchor: 'He sentido el amor de Dios manifestado genuinamente' },
  { title: 'El que cuida de modo perfecto es Dios',         anchor: 'La mayoría de los obreros salieron bajo las promesas' },
  { title: 'Mi rol como cuidador',                          anchor: 'Muchas veces encontramos pensamientos equivocados dentro de las iglesias' },
  { title: 'Preparación esencial para ser un cuidador',     anchor: 'Prepararse para ser un cuidador integral de misioneros' },
];

export default {
  revistaId: '5cF4KxVOXpbTwV1F45wOYW',
  coverAssetId: 'bqSsEf8rlLw8YLqVpbw01',
  date: '2025-03-01',
  skipPages,
  live,
  articles,
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  furniture: /^(Evelyn Subuyuj|Luigi Sarmiento|Geraldyne Velasquez|Jessica Bastidas|Mario Linares|El ejemplo de la iglesia con Pablo|¿Buscas más recursos|Lee la revista completa|Todos están disponibles de forma gratuita)/i,
};
