import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "../_components/PageHero";

export const metadata: Metadata = {
  title: "Sirve con SIM",
  description:
    "¡Hay lugar para ti en SIM! Tus dones, profesión o talentos pueden ser usados para alcanzar con el mensaje de Jesús a los no alcanzados.",
  alternates: { canonical: "/sirve-con-sim/" },
};

const REQUISITOS = [
  { term: "Relación con Dios", text: "Tener una relación íntima y creciente con Dios. Estar viviendo una vida cristiana fuerte y sana." },
  { term: "Recomendación pastoral", text: "Tener una recomendación pastoral y el compromiso de tu iglesia enviadora." },
  { term: "Experiencia en el ministerio", text: "Tener varios años de experiencia en el ministerio, trabajando con una iglesia." },
  { term: "Preparación teológica", text: "Haber cumplido los estudios teológicos necesarios para el puesto ministerial." },
  { term: "Apoyo en oración y finanzas", text: "Estar dispuesto a levantar tu propio equipo de apoyo en oración y sustento económico." },
  { term: "Estado físico y mental", text: "Estar en buen estado físico y mental para trabajar en el campo misionero." },
  { term: "Habilidades y talentos", text: "Tener habilidades, dones, talentos y cualidades para servir en el campo misionero. En algunos casos, contar con una profesión y/u oficio." },
  { term: "Idiomas", text: "Dependiendo del caso, tener un nivel intermedio o superior de inglés y estar dispuesto a aprender otros idiomas." },
  { term: "Comprometido al servicio en equipo con SIM", text: "Estar dispuesto a desarrollar su carácter y colaborar con un equipo ministerial." },
  { term: "Proceso de candidato", text: "Estar dispuesto a completar los procesos y capacitaciones requeridas." },
];

export default function SirveConSimPage() {
  return (
    <main className="page-offset">
      <PageHero
        title="¡Hay lugar para ti en SIM!"
        intro="Tú también puedes servir entre los no alcanzados junto a SIM. ¡Tus dones, profesión o talentos pueden ser usados para alcanzar con el mensaje de Jesús!"
        image={{ src: "/heroes/sirve-con-sim.webp", alt: "Sirve con SIM" }}
      />

      {/* Puestos */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cream">
            Sirve con nosotros
          </p>
          <h2 className="font-heading mt-3 text-3xl font-bold text-white">
            ¡Existen más de 800 puestos para los más de 70 países en donde
            servimos!
          </h2>
          <p className="mt-4 text-white/80">
            Y aun con esto, estamos dispuestos a conversar de cómo tu llamado y
            experiencias podrían ser usadas.
          </p>
          <p className="mt-4 text-white/80">
            Actualmente, somos alrededor de 4000 obreros provenientes de más de
            60 países. Nuestro enfoque es servir entre los no alcanzados, es
            decir, aquellos que nunca han tenido la oportunidad de escuchar el
            Evangelio de Jesucristo.
          </p>
          <p className="mt-4 text-white/80">
            Nuestro propósito es glorificar a Dios al establecer, fortalecer, y
            cooperar con las iglesias alrededor del mundo mientras: evangelizamos
            a los no alcanzados, ministramos a las personas necesitadas,
            discipulamos a los creyentes en su iglesia local y equipamos a las
            iglesias para cumplir con la Gran Comisión.
          </p>
        </div>
      </section>

      {/* Contacto */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-heading text-3xl font-bold text-ink">
          Escríbenos para iniciar la conversación
        </h2>
        <p className="mt-4 text-muted">
          Si tienes un país, grupo étnico, o un ministerio con el que buscas
          servir, escríbenos y conversemos más detalles.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:info@misionessim.org"
            className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            info@misionessim.org
          </a>
          <a
            href="https://chat.whatsapp.com/FfwZVyN09pA49SpPhyITWd"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-brand px-8 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
          >
            Únete a nuestro chat de WhatsApp
          </a>
        </div>
      </section>

      {/* Tu iglesia te envía */}
      <section className="bg-cream/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="font-heading text-3xl font-bold text-ink">
            ¡Tu iglesia te envía!
          </h2>
          <p className="mt-4 text-muted">
            SIM te facilita un equipo ministerial y tu iglesia te envía con apoyo
            económico, en oración y cuidado integral.
          </p>
          <p className="mt-2 text-muted">
            Te recomendamos el curso DANDO PASOS que tenemos gratis en línea.
          </p>
          <a
            href="https://cursos.movilicemos.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Ver cursos
          </a>
        </div>
      </section>

      {/* Requisitos */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-4xl font-bold text-ink">
          Requisitos para servir con SIM
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {REQUISITOS.map((r, i) => (
            <article key={r.term} className="flex gap-4 rounded-lg border border-hairline bg-white p-6 shadow-sm">
              <span className="font-heading flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold text-ink">{r.term}</h3>
                <p className="mt-1 text-sm text-muted">{r.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
