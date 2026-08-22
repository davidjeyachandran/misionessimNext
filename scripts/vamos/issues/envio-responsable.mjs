/**
 * VAMOS — «Envío responsable», diciembre 2025 (revista 31pz1xEkQ5jfmUhAo9vZew).
 *
 * This issue is a recruiting brochure more than a magazine: short
 * testimonies, course adverts and institutional panels outnumber articles,
 * so the 150-word floor drops a large share of the page. That is the rule
 * working, not failing — see scripts/vamos/README.md.
 *
 * The one post already published from this edition, «Consejos si NO quieres
 * ser misionero», does not appear in the PDF at all; the editor wrote it
 * separately. So nothing needs excluding here.
 */

/** 1 cover · 11 what-is-SIM boilerplate · 23 process diagram. */
const skipPages = new Set([1, 11, 23]);

const articles = [
  { title: 'Enviados a los menos alcanzados',              anchor: 'En el libro de Juan 20:21b, Jesús dice' },
  { title: 'El envío responsable de obreros preparados',   anchor: 'Es un privilegio servirle a Dios y tener un propósito mayor' },
  { title: 'Aquí nadie se va, sino que son enviados',      anchor: 'Esas fueron las palabras de uno de los pastores de mi iglesia' },
  { title: '25 años del esfuerzo latino de SIM',           anchor: 'SIMLa celebra 25 años como el esfuerzo latino de SIM' },
  { title: 'Una historia de obediencia',                   anchor: 'En 1893, Rowland Bingham, Walter Gowans y Thomas Kent' },
  { title: 'Somos la danza latina',                        anchor: 'Los latinos son muy queridos por la familia SIM' },
  { title: 'La meta es ver fruto',                         anchor: 'SIM Latinoamérica es una entidad reconocida de SIM Internacional' },
  { title: 'Guiando a los interesados',                    anchor: 'El Dr. Ralph Winter, editor del curso Perspectivas' },
  { title: 'El camino hacia los no alcanzados',            anchor: '¿Alguna vez te has puesto a pensar por qué los no alcanzados' },
  { title: 'Coordinando el envío de latinos a los campos', anchor: 'Actualmente, mi ministerio es la coordinación de los procesos de envío' },
  { title: 'Generando y seleccionando materia prima',      anchor: 'La iglesia local juega un papel importante en el proceso de selección' },
  { title: 'La Iglesia selecciona',                        anchor: 'En la selección de los candidatos, la iglesia debe tomar en cuenta' },
  { title: 'Acompañar con fidelidad y esperanza',          anchor: 'No solo los jóvenes, sino también familias enteras' },
  { title: 'Buscando una misión donde usar nuestros dones', anchor: 'Junto con mi esposa, estábamos en búsqueda de una misión' },
  { title: '5 preguntas que un candidato misionero debe responder con honestidad', anchor: '1. ¿Has cumplido con algo significativo?' },
  { title: 'Manual VAMOS',                                 anchor: 'Diseñado por y para latinos, este recurso gratuito' },
  { title: 'Un espacio enriquecedor para servir',          anchor: 'Decidí servir con SIM porque lo vi como un espacio muy enriquecedor' },
  { title: 'Un despertar por las misiones',                anchor: 'Recuerdo cuando tenía alrededor de 20 años, la iglesia a la que asistía' },
  { title: '¿Por qué debería considerar servir con una agencia misionera?', anchor: 'No es obligatorio ser enviado con una agencia misionera' },
  { title: 'El primer paso',                               anchor: 'En el lenguaje misionero se usa mucho el término' },
  { title: 'Somos la iglesia',                             anchor: 'Participar en una organización misionera no significa dejar de ser Iglesia' },
  { title: 'Unidos para enviar: la IEP y SIM en acción',   anchor: 'SIM significó para la Iglesia Evangélica Peruana' },
  { title: 'Aprendiendo inglés para la obra misionera',    anchor: 'Si piensas ser misionero fuera de Latinoamérica, el inglés' },
  { title: 'CIMA 2025: 23 candidatos de siete países',     anchor: 'Lima, Perú fue el escenario de una experiencia única en junio de 2025' },
  { title: '¿Por qué decidí servir con SIM?',              anchor: 'En mi búsqueda de dirección y claridad en el llamado de Dios' },
  { title: 'Somos una familia más que un equipo',          anchor: 'Somos una familia más que un equipo' },
  { title: 'Pasión por los números al servicio de la misión', anchor: 'Tengo una gran pasión por los números' },
  { title: '¿Cómo debe la iglesia de envío apoyar a sus misioneros?', anchor: 'La iglesia de envío genera y facilita oración, finanzas' },
  { title: 'Empieza conmigo: una visión bíblica del sostenimiento misionero', anchor: 'Para Gio, director de SIM Latinoamérica, el levantamiento de fondos' },
  { title: 'Del campo sin agencia a servir acompañada',    anchor: 'Cuando llegué al campo misionero en India por el año 2003' },
  { title: 'Un coequipero para la iglesia enviadora',      anchor: 'Como pastor he podido ver esto de forma muy cercana en la alianza con SIM' },
  { title: 'Aquí me quedo',                                anchor: 'Doy gracias a Dios por la agencia SIM, y creo que fue Dios quien me llevó' },
  { title: 'Canalizar donaciones para servir en Asia',     anchor: 'En realidad, el motivo por el cual decidí servir con SIM fue por la necesidad' },
  { title: 'Una puerta abierta por los cursos',            anchor: 'Conocí a SIM a través de sus cursos' },
  { title: 'El respaldo del personal de SIM',              anchor: 'Ha sido una bendición ver todo el esfuerzo que el personal de SIM hace' },
  { title: 'Veintidós años sirviendo con SIM',             anchor: 'Mi esposo y yo servimos con SIM desde hace 22 años' },
  { title: 'Pasos para ir al campo misionero',             anchor: '1. Ora con perseverancia' },
  { title: 'La buena preparación',                         anchor: '1. Empieza con la buena evaluación' },
  { title: 'Requisitos para aplicar a SIM',                anchor: 'Tener una relación íntima y creciente con Dios' },
  { title: '¿Por qué servir con SIM?',                     anchor: 'Con más de 130 años de fundada' },
  { title: 'Guiar con cuidado, no desanimar',              anchor: 'Acompañar a quienes están discerniendo su llamado misionero' },
  { title: '¿Por qué el proceso de ir es tan largo, tan complejo?', anchor: 'Porque sabemos que el trabajo entre los no alcanzados lleva tiempo' },
  { title: 'La perseverancia es preparación',              anchor: 'La perseverancia es una preparación costosa' },
  { title: '¡Qué celebración!',                            anchor: 'A veces creemos que el gran triunfo es cuando un misionero sale al campo' },
];

export default {
  revistaId: '31pz1xEkQ5jfmUhAo9vZew',
  coverAssetId: '3I0uktEp6KeMfKhcdvg9PL',
  date: '2025-12-01',
  skipPages,
  live: new Set(),
  articles,
  coverHero: new Set(),
  noHeroSkip: new Set(),
  heroOverride: {},
  /** Course adverts run on nearly every spread and are not articles. */
  furniture: /^(NO SON POR ZOOM|Al terminar este módulo|Lleva los cursos en línea|Inscríbete para recibir|Accede al Manual VAMOS|Comunícate con nosotros|Estudiante del curso)/i,
};
