import type { Metadata } from "next";
import Link from "next/link";
import { ANALYTICS_ENABLED, ANALYTICS_RETENTION_MONTHS } from "../../lib/analytics";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Qué datos personales recogemos en misionessim.org, para qué los usamos, con quién los compartimos y cómo puedes pedir su eliminación.",
  alternates: { canonical: "/privacidad/" },
};

const CONTACT_EMAIL = "sim.preguntas@sim.org";

/**
 * Covers the two places the site collects data: the Sirve con SIM enquiry form
 * and Google Analytics. Every analytics passage is gated on ANALYTICS_ENABLED
 * from lib/analytics.ts — the same flag the root layout uses to decide whether
 * to load gtag.js — so the policy and the tracking can never drift apart.
 *
 * No cookie banner, deliberately. The site is aimed at Latin America and does
 * not target the EU, so GDPR's Art. 3(2) hooks (offering services to, or
 * monitoring the behaviour of, people in the Union) are not engaged and the
 * ePrivacy consent rule does not bite. If that ever changes — a Spain-facing
 * campaign, an EU office — the fix is Google consent mode with a regional
 * `analytics_storage: 'denied'` default, plus a consent section here.
 *
 * DRAFT — describes what the site actually does today, but it has not been
 * reviewed by anyone qualified. Two things still need confirming: the form
 * processor named under "Para qué los usamos" (it has to match whatever
 * NEXT_PUBLIC_CONTACT_ENDPOINT points at) and the enquiry retention period,
 * which is still a description of intent rather than a stated SIM policy.
 */
const SECTIONS = [
  {
    title: "Quiénes somos",
    paragraphs: [
      "SIM Latinoamérica es responsable del tratamiento de los datos personales que se recogen en este sitio, misionessim.org. Puedes contactarnos en cualquier momento escribiendo a nuestro correo de consultas.",
    ],
  },
  {
    title: "Qué datos recogemos",
    paragraphs: [
      "Por un lado, los datos que tú nos entregas voluntariamente al completar el formulario de la página Sirve con SIM: tu nombre y apellido, tu teléfono, tu correo electrónico, tu país y el comentario o consulta que decidas escribir.",
      ...(ANALYTICS_ENABLED
        ? [
            "Por otro, cuando navegas por el sitio se recogen de forma automática algunos datos de uso: las páginas que visitas y cuándo, el país y la ciudad aproximada desde los que llegas, el tipo de dispositivo y navegador que usas, y el enlace o buscador que te trajo hasta aquí.",
            "No utilizamos cookies de publicidad, no vendemos estos datos a nadie y no los cruzamos con lo que nos escribes en el formulario.",
          ]
        : [
            "Este sitio no utiliza cookies de publicidad ni de seguimiento, y no creamos perfiles de navegación de quienes lo visitan.",
          ]),
    ],
  },
  ...(ANALYTICS_ENABLED
    ? [
        {
          title: "Cookies y estadísticas de uso",
          paragraphs: [
            "Usamos Google Analytics para entender cómo se usa el sitio: qué contenidos se leen, qué páginas cuesta encontrar y desde qué países nos visitan. Lo hacemos para mejorar el sitio y decidir qué publicar; no lo usamos para mostrarte publicidad ni para venderte nada.",
            "Para poder contarlo, Google Analytics guarda cookies en tu navegador con un identificador aleatorio. Ese identificador permite reconocer tu navegador entre una visita y otra, de modo que varias páginas vistas se cuenten como una sola persona y no como visitantes distintos. No contiene tu nombre ni tu correo electrónico, y no lo unimos a los datos que nos dejas en el formulario de Sirve con SIM.",
            "El tratamiento lo realiza Google por nuestra instrucción, en sus servidores, que están fuera de tu país. Puedes consultar cómo trata Google esta información en sus propias políticas de privacidad.",
            "Puedes impedir esta recogida cuando quieras: borra o bloquea las cookies desde la configuración de tu navegador, o instala el complemento de inhabilitación de Google Analytics que ofrece la propia Google. El sitio seguirá funcionando igual.",
          ],
        },
      ]
    : []),
  {
    title: "Para qué los usamos y con quién los compartimos",
    paragraphs: [
      "Usamos los datos del formulario con un único fin: responder tu consulta y acompañarte en la conversación sobre servir con SIM. No los vendemos, no los cedemos a terceros con fines comerciales y no los usamos para enviarte publicidad que no hayas pedido.",
      "El envío del formulario se procesa a través de un servicio externo de formularios, que transmite tu mensaje a nuestro correo institucional. Ese proveedor trata los datos únicamente por nuestra instrucción y para hacer posible el envío.",
    ],
  },
  {
    title: "En qué nos basamos para tratarlos",
    paragraphs: [
      "Tratamos los datos del formulario sobre la base del consentimiento que otorgas al marcar la casilla antes de enviarlo. Puedes retirar ese consentimiento cuando quieras, sin que ello afecte al tratamiento realizado hasta ese momento.",
      ...(ANALYTICS_ENABLED
        ? [
            "Las estadísticas de uso no dependen de ese consentimiento: las tratamos porque tenemos un interés legítimo en saber cómo se usa el sitio para poder mejorarlo. Puedes oponerte en cualquier momento, del modo que se explica más arriba.",
          ]
        : []),
    ],
  },
  {
    title: "Cuánto tiempo los conservamos",
    paragraphs: [
      "Conservamos tu consulta mientras dure la conversación contigo y por un tiempo razonable después, de modo que podamos retomar el contacto si tú lo pides. Cuando ya no sea necesaria, la eliminamos.",
      ...(ANALYTICS_ENABLED
        ? [
            `Los datos de uso del sitio se conservan durante ${ANALYTICS_RETENTION_MONTHS} meses. Pasado ese plazo se elimina el registro individual de cada visita y solo quedan totales agregados, que no permiten identificar a nadie.`,
          ]
        : []),
    ],
  },
  {
    title: "Tus derechos",
    paragraphs: [
      "Puedes pedirnos en cualquier momento que te digamos qué datos tuyos tenemos, que los corrijamos si están equivocados, o que los eliminemos por completo. Escríbenos y atenderemos tu solicitud.",
    ],
  },
  {
    title: "Enlaces a otros sitios",
    paragraphs: [
      "Algunas páginas enlazan a servicios que no administramos —entre ellos YouTube, Spotify, WhatsApp y los cursos de Movilicemos—. Cuando los abres, pasas a regirte por las políticas de privacidad de cada uno de ellos, no por esta.",
    ],
  },
  {
    title: "Cambios a esta política",
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
        para qué los usamos y cómo puedes pedirnos que los eliminemos.{" "}
        {ANALYTICS_ENABLED ? (
          <>
            Recogemos datos en dos situaciones: cuando nos escribes desde el
            formulario de{" "}
            <Link href="/sirve-con-sim/" className="text-brand underline">
              Sirve con SIM
            </Link>{" "}
            y, de forma automática, mientras navegas por el sitio.
          </>
        ) : (
          <>
            La única parte del sitio que recoge datos personales es el
            formulario de{" "}
            <Link href="/sirve-con-sim/" className="text-brand underline">
              Sirve con SIM
            </Link>
            .
          </>
        )}
      </p>
      <div className="mt-10 space-y-10">
        {SECTIONS.map((s, i) => (
          <section key={s.title}>
            <h2 className="font-heading text-2xl font-bold text-brand">
              {i + 1}. {s.title}
            </h2>
            {s.paragraphs.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </section>
        ))}
        <section>
          <h2 className="font-heading text-2xl font-bold text-brand">
            {SECTIONS.length + 1}. Cómo contactarnos
          </h2>
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
