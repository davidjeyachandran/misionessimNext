import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ora",
  description:
    "La historia de SIM es una historia de oración. Súmate en clamor junto a miles de cristianos en el mundo.",
  alternates: { canonical: "/ora/" },
};

// Monthly prayer motives — the legacy page is edited monthly in Elementor;
// this content ships in code for day 1 (per the migration decision) and is a
// candidate for a Contentful type later.
const MOTIVOS = [
  {
    title: "Ora por Carolina",
    text: "Carolina López ha servido con SIM desde el año 2006 en Asia y Europa, y ahora forma parte del equipo de liderazgo de SIM Latinoamérica. Súmate en oración por ella y sus nuevos desafíos.",
    image: "/pages/ora-carolina.jpeg",
  },
  {
    title: "Ora por Venezuela",
    text: "A la luz de los devastadores terremotos que han afectado a Venezuela, nos sumamos en oración por consuelo y fortaleza para las familias afectadas, por los rescatistas, personal médico y autoridades y por la iglesia en Venezuela.",
    image: "/pages/ora-venezuela.avif",
  },
  {
    title: "Ora por la Conferencia misionera",
    text: "Este mes tendremos una Conferencia con diferentes líderes de SIM Latinoamérica en Lima, Perú. Ora por este tiempo compartiendo con líderes, pastores e interesados en la misión global.",
    image: "/pages/ora-conferencia.jpeg",
  },
];

const SUMATE = [
  "Además, por el equipo de liderazgo de la oficina de SIM Latinoamérica.",
  "Principalmente con las agencias e iglesias enviadoras desde y en Latinoamérica.",
  "Especialmente, por aquellos que sirven actualmente en el campo.",
  "Aquellos que han sido enviados, cuidados y sostenidos por sus iglesias, con la bendición de Dios.",
];

const RECURSOS_ORACION = [
  {
    title: "365 Tarjetas de oración por grupos no alcanzados",
    href: "https://movilicemos.org/recursos/no-alcanzados/tarjetas-de-oracion-para-365-dias",
  },
  {
    title: "Té de oración para orar por mujeres musulmanas",
    href: "https://movilicemos.org/recursos/oracion/te-de-oracion-para-mujeres",
  },
  {
    title: "Guía de oración para niños por África occidental",
    href: "https://movilicemos.org/recursos/trabajando-con-ninos/oracion-por-africa-occidenta",
  },
];

const FULANI = [
  {
    title: "Un oasis de esperanza para los niños fulani",
    text: "La esperanza del evangelio está siendo ofrecida a una comunidad muy especial en Benín: los talibés, niños pequeños —principalmente del pueblo fulani— que mendigan en las calles.",
    image: "/pages/fulani-oasis.jpg",
    href: "/blog/2025-10/un-oasis-de-esperanza-para-los-ninos-fulani/",
  },
  {
    title: "Vivir entre los fulani: El viaje lleno de gozo de Christine",
    text: "Christine se unió a una comunidad fulani en África Occidental hace cuatro años, movida por amor. Ella comparte su experiencia con las mujeres que la ayudaron a integrarse.",
    image: "/pages/fulani-christine.jpg",
    href: "/blog/2025-10/vivir-entre-los-fulani-el-viaje-de-alegria-de-christine/",
  },
  {
    title: "La Buena Noticia se extiende de un fulani a toda una aldea fulani",
    text: "Obed* quería profundizar en su fe musulmana. Él es fulani, parte de un grupo nómada que cuenta con 45 millones de personas en más de 20 países de África Occidental y Central.",
    image: "/pages/fulani-aldea.jpg",
    href: "/blog/2025-10/la-buena-noticia-se-extiende-de-un-fulani-a-toda-una-aldea-fulani/",
  },
];

export default function OraPage() {
  return (
    <main className="page-offset">
      {/* Hero */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cream">
            ¡Únete en oración!
          </p>
          <h1 className="font-heading mt-3 text-4xl font-bold text-white md:text-5xl">
            Motivos de oración de este mes
          </h1>
          <p className="mt-4 text-lg text-white/80">
            La historia de SIM es una historia de oración. Súmate en clamor
            junto a miles de cristianos en el mundo.
          </p>
        </div>
      </section>

      {/* Motivos del mes */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {MOTIVOS.map((m) => (
            <article key={m.title} className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-white shadow-sm">
              <Image
                src={m.image}
                alt={m.title}
                width={512}
                height={340}
                className="h-52 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-heading text-xl font-bold text-ink">{m.title}</h2>
                <p className="mt-3 text-sm text-muted">{m.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SIM a través de la Oración */}
      <section className="bg-cream/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-bold text-ink">
              SIM a través de la Oración
            </h2>
            <p className="mt-4 text-muted">
              La historia de SIM es una historia de oración. Mientras una madre
              de Sudán oraba, Dios llamó al hijo de esta mujer y a sus dos amigos
              a formar SIM.
            </p>
            <a
              href="https://www.youtube.com/watch?v=fHHGEC23OTk"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Mira el video aquí
            </a>
          </div>
          <Image
            src="/pages/ora-video.png"
            alt="SIM a través de la oración — video"
            width={1024}
            height={573}
            className="w-full rounded-lg object-cover shadow-md"
          />
        </div>
      </section>

      {/* Sumarte a orar */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <Image
          src="/pages/ora-sumate.jpg"
          alt="Personas orando"
          width={768}
          height={699}
          className="w-full rounded-lg object-cover shadow-md"
        />
        <div>
          <h2 className="font-heading text-3xl font-bold text-ink">
            ¿Quieres sumarte a orar por SIM Latinoamérica?
          </h2>
          <ul className="mt-6 space-y-4">
            {SUMATE.map((item) => (
              <li key={item} className="flex gap-3 text-muted">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ora 1002 */}
      <section className="bg-navy">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cream">
              Guía de oración
            </p>
            <h2 className="font-heading mt-2 text-4xl font-bold text-white">Ora 1002</h2>
            <p className="mt-4 text-white/80">
              Esta campaña de oración ORA 1002 está basada en Lucas 10:02
              &ldquo;Les dijo: «Ciertamente, es mucha la mies, pero son pocos los
              segadores. Por tanto, pidan al Señor de la mies que envíe segadores
              a cosechar la mies&rdquo;.
            </p>
            <p className="mt-4 text-white/80">
              Únete a cientos de creyentes orando para llevar estas grandes
              necesidades delante de Dios, y así clamar por más obreros. Pon en
              práctica esta campaña de manera personal, en tu grupo pequeño o
              como iglesia.
            </p>
            <p className="mt-4 font-semibold text-white">
              ¡Haz una pausa para orar 1 minuto al día a las 10:02 de la mañana
              y/o de la noche, pidiendo por más obreros para el campo misionero!
              ¿Te unes?
            </p>
          </div>
          <Image
            src="/pages/ora-1002.png"
            alt="Campaña de oración ORA 1002"
            width={640}
            height={640}
            className="w-full rounded-lg object-contain"
          />
        </div>
      </section>

      {/* Recursos sobre la oración */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-3xl font-bold text-ink">
          Recursos sobre la oración
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {RECURSOS_ORACION.map((r) => (
            <a
              key={r.title}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-hairline bg-white p-6 shadow-sm transition hover:border-brand hover:shadow-md"
            >
              <h3 className="font-heading text-lg font-bold text-ink transition-colors group-hover:text-brand">
                {r.title}
              </h3>
              <span className="mt-3 inline-block text-sm font-semibold text-brand">
                Conoce más →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Fulani */}
      <section className="bg-cream/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            ¿Te sumas a orar por el grupo nómada más grande del mundo?
          </p>
          <h2 className="font-heading mt-2 text-4xl font-bold text-ink">
            Oremos por los Fulani
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {FULANI.map((f) => (
              <article key={f.title} className="group flex flex-col gap-3">
                <Link href={f.href} className="relative block aspect-[3/2] overflow-hidden rounded-md">
                  <Image
                    src={f.image}
                    alt={f.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </Link>
                <h3 className="font-heading text-lg font-bold leading-snug text-ink">
                  <Link href={f.href} className="transition-colors hover:text-brand">
                    {f.title}
                  </Link>
                </h3>
                <p className="text-sm text-muted">{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
