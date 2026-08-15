import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "../_components/PageHero";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Convencidos de que nadie debe vivir y morir sin haber escuchado las buenas nuevas, creemos que Él nos llamó a hacer discípulos del Señor en comunidades donde es menos conocido.",
  alternates: { canonical: "/nosotros/" },
};

const PILLARS = [
  {
    title: "Cruzamos barreras",
    text: "Cruzamos barreras para proclamar a Cristo, expresando Su amor y compasión entre aquellos que viven y mueren sin Él.",
    image: "/pages/nosotros-cruzamos.jpg",
  },
  {
    title: "Trabajamos en equipo",
    text: "Trabajamos en conjunto con las iglesias para cumplir la misión de Dios entre culturas tanto local como global.",
    image: "/pages/nosotros-equipo.jpg",
  },
  {
    title: "Hacemos discípulos",
    text: "Hacemos discípulos que confían y obedecen a Jesús, y llegan a integrarse a iglesias Cristo céntricas.",
    image: "/pages/nosotros-discipulos.jpg",
  },
  {
    title: "Facilitamos la participación",
    text: "Facilitamos la participación en ministerios transculturales de aquellos a quien Dios está llamando.",
    image: "/pages/nosotros-facilitamos.jpg",
  },
];

const ICONS = ["/pages/ico-cora.png", "/pages/ico-flor.png", "/pages/ico-msg.png"];

const AREAS = [
  {
    title: "Evangelismo, plantación y crecimiento",
    text: "SIM está comprometida a testificar desarrollando lazos de amistad con personas. Luego que la semilla de la Palabra de Dios ha sido sembrada y ha dado fruto, el discipulado continúa a través de la iglesia local donde el nuevo creyente puede crecer espiritualmente.",
  },
  {
    title: "Ayuda Médica",
    text: "SIM está involucrada en varios hospitales y clínicas públicos y particulares. Doctores, enfermeras y otros profesionales médicos capacitan trabajadores locales al cuidado de salud comunitaria, incluso la enseñanza y prevención del SIDA.",
  },
  {
    title: "Formación Teológica",
    text: "La Iglesia local necesita a líderes. Por eso enviamos hombres y mujeres a enseñar en los seminarios, institutos bíblicos, y programas de Educación Teológica por extensión.",
  },
  {
    title: "Educación",
    text: "Los profesores imparten clases a niños de la comunidad local y a los hijos de misioneros. Se realiza en escuelas de SIM o en colegios del gobierno. Esta interacción diaria provee muchas oportunidades de presentar el Evangelio a los estudiantes.",
  },
  {
    title: "Lingüística, Traducción y Alfabetización",
    text: "SIM está dedicado a la expansión del evangelio a través de lingüística, traducción bíblica, y programas de alfabetización. Por medio del esfuerzo de misioneros y nacionales, muchos están experimentando el gozo y la libertad de poder leer y conocer la Palabra de Dios en su propio idioma.",
  },
  {
    title: "Medios de comunicación",
    text: "Ministerios de televisión, video y radio han ayudado a transformar miles de vidas para Cristo. Estos ministerios, así como el material impreso de SIM, llevan en sí mismos el medio más vital de todo: la Palabra de Dios.",
  },
  {
    title: "Administración, Negocios y liderazgo",
    text: "Muchos talentos diferentes - incluyendo administración, servicios financieros, y de personal - permiten a SIM alcanzar personas para Cristo y ayudan en el desarrollo de la Iglesia en todo el mundo.",
  },
  {
    title: "Servicio Técnico",
    text: "Especialistas en computadoras, electricistas, ingenieros mecánicos y electrónicos. Todos estos dones en el mundo de hoy, son herramientas muy útiles para la extensión del Reino de Dios.",
  },
  {
    title: "Trabajo con niños y jóvenes",
    text: "Es estratégico trabajar con los niños y jóvenes en todo lugar. Muchas veces se puede alcanzar a toda la familia por los hijos primero. SIM está comprometida a invertir en los futuros líderes.",
  },
  {
    title: "Desarrollo y Rescate",
    text: "Cuando la crisis ha pasado, los misioneros de SIM proveen entrenamiento en agricultura, ganadería, y asistencia en el inicio de pequeños negocios. Esto se hace para que las comunidades se encaminen a una estabilidad de largo plazo.",
  },
];

const HISTORY = [
  {
    year: "1893",
    title: "Audaz visión y sacrificio",
    text: "En 1893, Rowland Bingham, Walter Gowans y Thomas Kent, tres jóvenes valientes desembarcaron en Lagos, Nigeria, para comenzar con la Misión al Interior de Sudán con la audaz visión de evangelizar a los 60 millones de personas menos alcanzadas que vivían en lo que entonces era conocido como Sudán en el África subsahariana. Walter y Thomas murieron de malaria dentro de un año.",
  },
  {
    year: "1902",
    title: "Base establecida",
    text: "Un equipo de misioneros enviados por Rowland estableció con éxito una base en el África subsahariana.",
  },
  {
    year: "1980s y 1990s",
    title: "Otros se unen",
    text: "Varias organizaciones misioneras se unieron al trabajo de SIM que nos llevó a cambiarnos de nombre a SIM, la Sociedad Internacional Misionera.",
  },
  {
    year: "2000",
    title: "Los latinos se unen",
    text: "Al observar que Dios estaba levantando una fuerza misionera desde Latinoamérica, SIM buscó la guía del liderazgo de COMIBAM para involucrarse en el desarrollo del movimiento misionero y así se abrieron oportunidades de cooperación, movilización, capacitación, envío y cuidado de obreros Latinos en los campos de trabajo de SIM entre los menos alcanzados.",
  },
];

const VALUES = [
  { term: "Dependemos de Dios", text: "Somos personas de oración. Confiamos en nuestro Dios fiel y afirmamos la verdad de la Biblia." },
  { term: "Diversos", text: "Somos uno en Cristo. Abrazamos, y somos fortalecidos por, la diversidad internacional, interdenominacional y multiétnica de Su iglesia." },
  { term: "Discípulos de Jesús que hacen discípulos", text: "Cruzamos barreras para cumplir la misión de Dios global, urgente e inconclusa." },
  { term: "Centrados en la iglesia", text: "Somos parte de la iglesia de Cristo y juntos plantamos, nutrimos y equipamos iglesias." },
  { term: "Compasivos", text: "Ofrecemos humildemente un servicio compasivo y holístico y una esperanza eterna, a través del conocimiento de Jesucristo." },
  { term: "Comunidad", text: "Vivimos una vida en obediencia a Dios y en relación unos con otros mientras escuchamos, aprendemos, crecemos e innovamos juntos bajo la guía del Espíritu Santo." },
];

const FACTORS = [
  { term: "Motivación y Dedicación", text: "¿Por qué quieres ser misionero? Tu primera preocupación debe ser cumplir el deseo y la voluntad de Dios para tu vida, porque lo amas más que a todo. Podrían venir muchas frustraciones financieras o de cualquier otro tipo." },
  { term: "Conocimiento de las Escrituras", text: "La Biblia es el fundamento de la iglesia cristiana. A través de ella se transmite la fe salvadora, bajo la influencia del Espíritu Santo, al hombre perdido. Además, producen madurez espiritual en el pueblo de Dios, entendimiento práctico de la Palabra de Dios." },
  { term: "Participación en la Iglesia local", text: "Ya que SIM se ha comprometido a ser una agencia misionera que planta y alimenta iglesias, deseamos que tú estés personalmente involucrado en el ministerio de tu iglesia local ahora." },
  { term: "Acceso Creativo", text: "Aunque hay excepciones, la mayoría de los gobiernos requieren que una persona que desea vivir en su país tenga un talento especializado, como preparación académica, un oficio o una habilidad específica. Un título universitario normalmente es ventajoso, pero no siempre es imprescindible." },
  { term: "Relaciones Interpersonales", text: "El servicio misionero implica la formación de relaciones con personas. Esto empieza con los misioneros mismos, quienes a menudo viven, trabajan y adoran cerca de los demás. La habilidad de aceptarse mutuamente a pesar de diferencias fortalece la formación de buenas relaciones con las personas de la comunidad, los creyentes locales y los líderes." },
  { term: "Flexibilidad", text: "Es importante poder aceptar los cambios y enfrentar las limitaciones sin frustrarse. Una mentalidad abierta es indispensable para encajar en una nueva cultura, aprender otro idioma, y trabajar con otros como miembro de un equipo." },
  { term: "Buena Salud", text: "Con la medicina moderna se han disminuido los peligros de la vida misionera, pero la resistencia y buena salud son una ventaja, especialmente en un clima tropical." },
];

/*
 * Live renders these as image tiles with the title always visible and the
 * description revealed on hover. `touch:` restores the description where
 * there's no pointer to hover with — otherwise it's unreachable on phones.
 */
function PillarCard({ pillar }: { pillar: (typeof PILLARS)[number] }) {
  return (
    <article className="group relative aspect-[519/456] overflow-hidden rounded-xl">
      <Image
        src={pillar.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 288px, (min-width: 640px) 46vw, 92vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent transition-colors duration-300 group-hover:from-ink/90 group-hover:via-ink/60" />
      {/* inset-0 + justify-end, not bottom-0: keeps the caption from growing
          past the top of the card once the description expands. */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
        <h3 className="font-heading text-xl font-bold leading-tight text-white xl:text-2xl">
          {pillar.title}
        </h3>
        <p className="mt-2 max-h-0 overflow-hidden text-sm leading-snug text-white/90 opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100 touch:max-h-40 touch:opacity-100">
          {pillar.text}
        </p>
      </div>
    </article>
  );
}

function Faq({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-hairline bg-white px-6 py-4">
      <summary className="cursor-pointer list-none font-heading text-lg font-bold text-ink transition-colors group-open:text-brand">
        {question}
      </summary>
      <div className="mt-3 space-y-3 text-muted">{children}</div>
    </details>
  );
}

export default function NosotrosPage() {
  return (
    <main className="page-offset">
      <PageHero
        title="¿Quiénes somos?"
        intro="Convencidos de que nadie debe vivir y morir sin haber escuchado las buenas nuevas, creemos que Él nos llamó a hacer discípulos del Señor en comunidades donde es menos conocido."
        image={{ src: "/heroes/nosotros.webp", alt: "Equipo de SIM Latinoamérica" }}
      />

      {/* Lo que nos mueve */}
      <section className="bg-cream/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="font-heading text-3xl font-bold text-brand">Lo que nos mueve</h2>
          <p className="mt-5 text-muted">
            Apreciamos y trabajamos, de manera muy cercana, con agencias
            especializadas en la traducción de la Biblia, de alcance radial,
            desarrollo en comunidades, medicina, ministerios de HIV y SIDA, y
            aviación.
          </p>
          <p className="mt-4 text-muted">
            Sin embargo, lo que nos distingue es nuestro interés en la Iglesia.
            Muchos de nuestros misioneros trabajan en la fundación de iglesias en
            áreas pioneras o de forma asociada en iglesias locales en los
            ministerios de discipulado, evangelismo o educación teológica.
          </p>
        </div>
      </section>

      {/* 4 pillars — quote on the left, staggered image tiles on the right */}
      <section className="bg-cream">
        {/* Splits at lg, not md: at 768 the two-up cards would be ~160px wide,
            too narrow for the description to fit once revealed. */}
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-bold leading-snug text-navy">
              Nadie debe vivir y morir sin haber escuchado las buenas nuevas de
              Dios.
            </h2>
            <p className="mt-5 text-muted">
              Impulsados por el gran amor de Dios y con el poder del Espíritu
              Santo, nosotros cruzamos barreras para proclamar a Cristo, hacemos
              discípulos, trabajamos en conjunto con las iglesias y facilitamos
              la participación en ministerios transculturales.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Left column sits lower than the right — the stagger on live. */}
            <div className="space-y-6 sm:mt-12">
              {PILLARS.slice(0, 2).map((pillar) => (
                <PillarCard key={pillar.title} pillar={pillar} />
              ))}
            </div>
            <div className="space-y-6">
              {PILLARS.slice(2).map((pillar) => (
                <PillarCard key={pillar.title} pillar={pillar} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Áreas de servicios */}
      <section className="bg-navy">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-cream">
            Conoce nuestras
          </p>
          <h2 className="font-heading mt-2 text-4xl font-bold text-white">
            Áreas de servicios
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {AREAS.map((area, i) => (
              <article key={area.title} className="rounded-lg bg-white/95 p-6">
                {/*
                 * The source PNGs are cream artwork drawn for live's dark-red
                 * cards; they vanish on these white ones. Paint brand red
                 * through the glyph as a mask rather than tint it with filters.
                 */}
                <span
                  aria-hidden
                  className="block h-12 w-12 bg-brand"
                  style={{
                    maskImage: `url(${ICONS[i % ICONS.length]})`,
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskImage: `url(${ICONS[i % ICONS.length]})`,
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    WebkitMaskSize: "contain",
                  }}
                />
                <h3 className="font-heading mt-4 text-lg font-bold text-ink">{area.title}</h3>
                <p className="mt-2 text-sm text-muted">{area.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Somos SIM</p>
        <h2 className="font-heading mt-2 text-4xl font-bold text-ink">
          Conoce nuestra historia
        </h2>
        <ol className="mt-10 space-y-10 border-l-2 border-brand/30 pl-8">
          {HISTORY.map((item) => (
            <li key={item.year} className="relative">
              <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full bg-brand" />
              <p className="font-heading text-2xl font-bold text-brand">{item.year}</p>
              <h3 className="font-heading mt-1 text-xl font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-muted">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="bg-cream/40">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            ¿Tienes dudas?
          </p>
          <h2 className="font-heading mt-2 text-4xl font-bold text-ink">
            Preguntas frecuentes
          </h2>
          <div className="mt-8 space-y-4">
            <Faq question="1. ¿Cuáles son los valores de SIM?">
              {VALUES.map((v) => (
                <p key={v.term}>
                  <strong className="text-ink">{v.term}:</strong> {v.text}
                </p>
              ))}
            </Faq>
            <Faq question="2. ¿Qué trabajo realizan los misioneros de SIM?">
              <p>
                Lo que nos distingue es nuestro interés en la Iglesia. Muchos de
                nuestros misioneros trabajan en la fundación de iglesias en áreas
                pioneras o de forma asociada en iglesias locales en los
                ministerios de discipulado, evangelismo o educación teológica.
                Trabajamos de manera muy cercana con agencias especializadas en
                la traducción de la Biblia, de alcance radial, desarrollo en
                comunidades, medicina, ministerios de HIV y SIDA, y aviación.
              </p>
            </Faq>
            <Faq question="3. ¿Qué es lo que puedo hacer yo?">
              <p>
                <strong className="text-ink">Ora:</strong> El lema de SIM es
                &ldquo;A través de la Oración&rdquo; porque el orar es una de las
                maneras más poderosas de transformar vidas de la obscuridad a la
                luz, de la desesperación a la esperanza, de la muerte a la vida
                en Cristo. Y todos tenemos el privilegio de la oración. Usted
                puede ser un participante invaluable en misiones simplemente
                &ldquo;A través de la Oración&rdquo;.
              </p>
              <p>
                <strong className="text-ink">Ofrenda:</strong> Existe la
                necesidad de apoyar financieramente a cada misionero, en cada
                país, y en cada ministerio. SIM ha escogido el existir por fe que
                significa que dependemos de Dios y de su gente, únicamente, para
                proveer sostén. Aun unas pocas monedas, usadas con sabiduría,
                pueden hacer una diferencia eterna - increíble, ¿no?
              </p>
              <p>
                <strong className="text-ink">Ve:</strong> Existen tantas
                oportunidades de servicio de corto y largo plazo. Para saber más,
                escríbenos a{" "}
                <a href="mailto:info@misionessim.org" className="text-brand underline">
                  info@misionessim.org
                </a>
              </p>
            </Faq>
            <Faq question="4. ¿Qué factores a considerar antes de ir al campo misionero?">
              <p>
                El servicio misionero en el mundo de hoy comprende una amplia
                variedad de ministerios desarrollados en diversas circunstancias.
                Por lo que los requisitos pueden variar de un campo a otro. Sin
                embargo, hay algunos que son comunes para todos los miembros de
                SIM.
              </p>
              {FACTORS.map((f) => (
                <p key={f.term}>
                  <strong className="text-ink">{f.term}:</strong> {f.text}
                </p>
              ))}
            </Faq>
            <Faq question="5. ¿Cómo se mantienen los misioneros de SIM?">
              <p>
                SIM es una misión de fe, esto significa que los misioneros
                reciben apoyo en oración y de forma financiera de iglesias,
                amigos y otros que creen en sus ministerios.
              </p>
              <p>
                SIM no provee los fondos. Te ayudamos en todo lo que está a
                nuestro alcance, para que puedas llegar al campo de misión. Cada
                misionero levanta sus propios fondos y apoyo de oración.
              </p>
            </Faq>
          </div>
        </div>
      </section>

      {/* Declaración de fe teaser */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">
              Conoce nuestra
            </p>
            <h2 className="font-heading mt-2 text-4xl font-bold text-ink">
              Declaración de fe
            </h2>
            <p className="mt-5 text-muted">
              Hay un solo Dios que existe eternamente en tres personas: Padre,
              Hijo y Espíritu Santo. Dios es el creador Todopoderoso, Salvador y
              Juez que gobierna todas las cosas según su soberana voluntad y
              lleva a cabo sus propósitos en la creación y en la Iglesia para Su
              gloria.
            </p>
            <Link
              href="/declaracion-de-fe-de-sim/"
              className="mt-6 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Conoce más
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["/pages/fe-1.jpg", "/pages/fe-2.jpg", "/pages/fe-3.jpg", "/pages/fe-4.jpg"].map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={320}
                height={220}
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
