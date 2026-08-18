import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Qué datos personales recogemos en misionessim.org, para qué los usamos, con quién los compartimos y cómo puedes pedir su eliminación.",
  alternates: { canonical: "/privacidad/" },
};

const CONTACT_EMAIL = "sim.preguntas@sim.org";

/**
 * Written for the Sirve con SIM enquiry form, which is the only place on the
 * site that collects personal data. Live links its consent checkbox at
 * `href="#"` — there has never been a policy page behind it.
 *
 * DRAFT — describes what the site actually does today, but it has not been
 * reviewed by anyone qualified. Two things must be confirmed before this is
 * treated as a legal notice: the form processor named in §3 (it has to match
 * whatever NEXT_PUBLIC_CONTACT_ENDPOINT points at) and the retention period
 * in §5, which is currently a placeholder rather than a stated SIM policy.
 */
const SECTIONS = [
  {
    title: "1. Quiénes somos",
    paragraphs: [
      "SIM Latinoamérica es responsable del tratamiento de los datos personales que se recogen en este sitio, misionessim.org. Puedes contactarnos en cualquier momento escribiendo a nuestro correo de consultas.",
    ],
  },
  {
    title: "2. Qué datos recogemos",
    paragraphs: [
      "Solo recogemos los datos que tú nos entregas voluntariamente al completar el formulario de la página Sirve con SIM: tu nombre y apellido, tu teléfono, tu correo electrónico, tu país y el comentario o consulta que decidas escribir.",
      "Este sitio no utiliza cookies de publicidad ni de seguimiento, y no creamos perfiles de navegación de quienes lo visitan.",
    ],
  },
  {
    title: "3. Para qué los usamos y con quién los compartimos",
    paragraphs: [
      "Usamos esos datos con un único fin: responder tu consulta y acompañarte en la conversación sobre servir con SIM. No los vendemos, no los cedemos a terceros con fines comerciales y no los usamos para enviarte publicidad que no hayas pedido.",
      "El envío del formulario se procesa a través de un servicio externo de formularios, que transmite tu mensaje a nuestro correo institucional. Ese proveedor trata los datos únicamente por nuestra instrucción y para hacer posible el envío.",
    ],
  },
  {
    title: "4. En qué nos basamos para tratarlos",
    paragraphs: [
      "Tratamos tus datos sobre la base del consentimiento que otorgas al marcar la casilla del formulario antes de enviarlo. Puedes retirar ese consentimiento cuando quieras, sin que ello afecte al tratamiento realizado hasta ese momento.",
    ],
  },
  {
    title: "5. Cuánto tiempo los conservamos",
    paragraphs: [
      "Conservamos tu consulta mientras dure la conversación contigo y por un tiempo razonable después, de modo que podamos retomar el contacto si tú lo pides. Cuando ya no sea necesaria, la eliminamos.",
    ],
  },
  {
    title: "6. Tus derechos",
    paragraphs: [
      "Puedes pedirnos en cualquier momento que te digamos qué datos tuyos tenemos, que los corrijamos si están equivocados, o que los eliminemos por completo. Escríbenos y atenderemos tu solicitud.",
    ],
  },
  {
    title: "7. Enlaces a otros sitios",
    paragraphs: [
      "Algunas páginas enlazan a servicios que no administramos —entre ellos YouTube, Spotify, WhatsApp y los cursos de Movilicemos—. Cuando los abres, pasas a regirte por las políticas de privacidad de cada uno de ellos, no por esta.",
    ],
  },
  {
    title: "8. Cambios a esta política",
    paragraphs: [
      "Si cambiamos la forma en que tratamos tus datos, actualizaremos esta página. Te recomendamos revisarla cuando vuelvas a escribirnos.",
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <main className="page-offset mx-auto max-w-4xl px-4 py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="transition-colors hover:text-ink">
          Inicio
        </Link>
        {" / "}
        <span>Política de privacidad</span>
      </nav>
      <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">
        Política de privacidad
      </h1>
      <p className="mt-6 leading-relaxed text-muted">
        Esta política explica qué datos personales recogemos en misionessim.org,
        para qué los usamos y cómo puedes pedirnos que los eliminemos. La única
        parte del sitio que recoge datos personales es el formulario de{" "}
        <Link href="/sirve-con-sim/" className="text-brand underline">
          Sirve con SIM
        </Link>
        .
      </p>
      <div className="mt-10 space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-heading text-2xl font-bold text-brand">{s.title}</h2>
            {s.paragraphs.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </section>
        ))}
        <section>
          <h2 className="font-heading text-2xl font-bold text-brand">9. Cómo contactarnos</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Para cualquier consulta sobre esta política o sobre tus datos,
            escríbenos a{" "}
            <a className="text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
