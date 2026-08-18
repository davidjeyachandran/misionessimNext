import { CONTACT_EMAIL } from "./contact";

interface ThankYouProps {
  /**
   * h3 inside the form's section, which already has an h2; h1 on the standalone
   * page the no-JS submit redirects to.
   */
  as?: "h1" | "h3";
  headingClassName?: string;
}

/**
 * The one confirmation message, rendered either as the panel that replaces the
 * form after a fetch submit or as the /sirve-con-sim/gracias/ page that
 * Web3Forms redirects to when JavaScript never ran. Shared so the two can't
 * say different things.
 */
export function ThankYou({ as: Heading = "h3", headingClassName }: ThankYouProps) {
  return (
    <>
      <Heading className={headingClassName}>¡Gracias por escribirnos!</Heading>
      <p className="mt-3 text-muted">
        Recibimos tu consulta y te responderemos a la brevedad. Si es urgente,
        escríbenos directamente a{" "}
        <a className="text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </>
  );
}
