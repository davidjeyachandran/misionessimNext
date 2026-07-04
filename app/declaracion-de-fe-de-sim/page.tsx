import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Declaración de Fe de SIM",
  description:
    "La declaración de fe de SIM: lo que creemos sobre Dios, la Biblia, la humanidad, Jesucristo, la salvación, el Espíritu Santo, la Iglesia y el futuro.",
  alternates: { canonical: "/declaracion-de-fe-de-sim/" },
};

const ARTICLES = [
  {
    title: "Dios",
    text: "Hay un solo Dios que existe eternamente en tres personas: Padre, Hijo y Espíritu Santo. Dios es el creador Todopoderoso, Salvador y Juez que gobierna todas las cosas según su soberana voluntad y lleva a cabo sus propósitos en la creación y en la Iglesia para Su gloria.",
  },
  {
    title: "El Padre",
    text: "Dios el padre es la fuente de todo lo bueno. Él mismo inicia la creación y la redención, las cuales lleva a cabo por medio de Su Hijo y del Espíritu Santo.",
  },
  {
    title: "La Palabra de Dios escrita",
    text: "La Biblia, que se compone del Antiguo y Nuevo Testamentos, es la Palabra de Dios escrita, revela a todos los pueblos Su carácter y propósitos. Es la autoridad última en todos los asuntos pertenecientes a la fe y la conducta. El Espíritu Santo movió a los autores humanos de la Biblia de modo que lo que han escrito es inspirado, totalmente confiable y sin error en todo lo que esta afirma.",
  },
  {
    title: "La humanidad",
    text: "La humanidad es el clímax de la creación terrenal de Dios, portadora de Su imagen, diseñada para tener una relación con Él, y objeto de su amor redentor. Todo ser humano ha pecado. El resultado de esto es culpa, muerte y alienación de Dios y también la desfiguración de cada aspecto de la naturaleza humana. Los seres humanos son incapaces de salvarse a sí mismos del castigo por el pecado, el poder del pecado y el dominio de Satanás.",
  },
  {
    title: "Jesucristo",
    text: "Jesucristo, completamente Dios y completamente hombre, entró en la historia como Salvador del mundo. Fue concebido por el Espíritu Santo, nacido de una virgen, y vivió una vida ejemplar, sin pecado, en perfecta sumisión al Padre y en trato amoroso con los demás. Murió en una cruz, resucitó corporalmente, y ascendió al cielo donde es abogado de su gente y está exaltado como Señor sobre todas las cosas.",
  },
  {
    title: "La salvación",
    text: "La muerte sacrificial de Cristo, en la cual llevó el castigo que merecen los pecadores, es el fundamento único y totalmente suficiente de la provisión de Dios para la salvación para todos pueblos de toda cultura y época, lo cual expresa Su amor y la satisfacción de Su justicia. Por la gracia de Dios, el pecador arrepentido, al confiar solamente en el Señor Jesucristo como Salvador, es reconciliado con Dios, adoptado por el Padre para ser parte de Su familia y recibe la vida eterna.",
  },
  {
    title: "El Espíritu Santo",
    text: "El Espíritu Santo hace que la obra de Cristo sea eficaz en los pecadores, dándoles vida espiritual y haciéndolos parte de la iglesia. El Espíritu Santo habita en todos los creyentes, los empodera para amar, testificar y obedecer a Dios, les otorga dones y los transforma para que sean cada vez más como Cristo.",
  },
  {
    title: "La Iglesia",
    text: "La Iglesia universal se compone de todos aquellos que han nacido del Espíritu. Se expresa localmente en comunidades de creyentes llamados por Dios para adorar, tener compañerismo, proclamar el evangelio y hacer discípulos en todas las naciones, reflejar el carácter de Dios, ser parte de obras de compasión, buscar la verdad y la justicia, y celebrar el bautismo y la cena del Señor.",
  },
  {
    title: "El mundo espiritual",
    text: "Los ángeles santos son seres espirituales que glorifican a Dios, le sirven y ministran a Su pueblo. Satanás es un ser espiritual que fue creado por Dios, pero cayó por su pecado. Él, junto con otros espíritus malignos, es el enemigo de Dios y de la humanidad, ha sido derrotado por la obra de Cristo, está sujeto a la autoridad de Dios y se enfrenta a la condenación eterna.",
  },
  {
    title: "El futuro",
    text: "El Señor Jesucristo regresará en gloria de manera visible a la tierra y logrará la victoria final sobre el mal. Dios hará nuevas todas las cosas. Los muertos serán resucitados y juzgados. Los no creyentes sufrirán el castigo eterno separados de Dios; los creyentes entrarán a una vida de gozo eterno en compañerismo con Dios, y lo glorificarán por siempre.",
  },
];

export default function DeclaracionDeFePage() {
  return (
    <main className="page-offset mx-auto max-w-4xl px-4 py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="transition-colors hover:text-ink">Inicio</Link>
        {" / "}
        <Link href="/nosotros/" className="transition-colors hover:text-ink">Nosotros</Link>
      </nav>
      <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">
        Declaración de Fe de SIM
      </h1>
      <div className="mt-10 space-y-10">
        {ARTICLES.map((a) => (
          <section key={a.title}>
            <h2 className="font-heading text-2xl font-bold text-brand">{a.title}</h2>
            <p className="mt-3 leading-relaxed text-muted">{a.text}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
