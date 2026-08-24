import type { Metadata } from "next";

/**
 * Internal review page: the rebuilt site measured against the live WordPress
 * install. Unlisted — reachable by direct link only.
 *
 * Three things keep it unlisted, and all three matter:
 *  1. `robots: { index: false, follow: false }` below emits the noindex tag.
 *  2. It is absent from `app/sitemap.ts`, whose static list is hand-written.
 *  3. Nothing on the site links here.
 * Deliberately NOT disallowed in robots.txt — blocking the crawl would stop
 * crawlers reading the noindex tag, which is the opposite of what we want.
 *
 * Written in Spanish for a non-technical reader: the measurements are the same
 * ones Lighthouse reports, but named for what a visitor experiences rather
 * than by their metric names, and byte counts are given in MB rather than KiB.
 * Where a technical term is unavoidable it is explained in the line beside it.
 *
 * Figures were measured on 24 August 2026 (Lighthouse 12, mobile, simulated
 * throttling). They are a snapshot, not a live readout — if the page is still
 * up months from now, re-measure before quoting it.
 */
export const metadata: Metadata = {
  title: "El sitio nuevo comparado con el actual",
  description:
    "Comparación medida entre el sitio nuevo de misionessim.org y el sitio actual en WordPress: velocidad, visibilidad en buscadores y enlaces antiguos.",
  alternates: { canonical: "/rebuild-vs-wordpress/" },
  robots: { index: false, follow: false },
};

const MEDIDO_EL = "24 de agosto de 2026";

// ---------------------------------------------------------------------------
// Datos

const CIFRAS = [
  {
    figure: "4 veces",
    label: "más rápido en aparecer la imagen principal",
    sub: "15,2 s → 3,5 s en la portada",
  },
  {
    figure: "7 veces",
    label: "menos peso para descargar en el celular",
    sub: "3,7 MB → 0,5 MB",
  },
  {
    figure: "2 veces",
    label: "más páginas que le ofrecemos a Google",
    sub: "557 → 1.214 direcciones",
  },
  {
    figure: "118",
    label: "ediciones de VAMOS que hoy Google no puede ver",
    sub: "ninguna figura en el listado actual",
  },
];

interface FilaGoogle {
  page: string;
  side: "actual" | "nuevo";
  scores: [number, number, number, number];
}

const GOOGLE: FilaGoogle[] = [
  { page: "Portada", side: "actual", scores: [33, 96, 96, 92] },
  { page: "Portada", side: "nuevo", scores: [90, 100, 100, 100] },
  { page: "Artículo del blog", side: "actual", scores: [31, 94, 96, 100] },
  { page: "Artículo del blog", side: "nuevo", scores: [82, 100, 100, 100] },
  { page: "Edición de VAMOS", side: "actual", scores: [6, 91, 96, 92] },
  { page: "Edición de VAMOS", side: "nuevo", scores: [84, 96, 100, 100] },
];

interface Medida {
  name: string;
  note?: string;
  actual: { value: number; display: string };
  nuevo: { value: number; display: string };
}

const GRUPOS: Array<{ title: string; note?: string; measures: Medida[] }> = [
  {
    title: "La portada",
    measures: [
      {
        name: "Cuánto tarda en verse la imagen principal",
        actual: { value: 15.2, display: "15,2 s" },
        nuevo: { value: 3.5, display: "3,5 s" },
      },
      {
        name: "Cuánto tiempo la página no responde al tacto",
        actual: { value: 1.95, display: "1,9 s" },
        nuevo: { value: 0.13, display: "0,1 s" },
      },
      {
        name: "Cuánto hay que descargar",
        actual: { value: 3.7, display: "3,7 MB" },
        nuevo: { value: 0.5, display: "0,5 MB" },
      },
      {
        name: "Cuántos archivos pide el celular",
        actual: { value: 110, display: "110" },
        nuevo: { value: 59, display: "59" },
      },
    ],
  },
  {
    title: "La página de una edición de VAMOS",
    note: "hoy, la más lenta de todas",
    measures: [
      {
        name: "Cuánto tarda en verse la imagen principal",
        actual: { value: 18.0, display: "18,0 s" },
        nuevo: { value: 3.9, display: "3,9 s" },
      },
      {
        name: "Cuánto tiempo la página no responde al tacto",
        actual: { value: 5.07, display: "5,1 s" },
        nuevo: { value: 0.21, display: "0,2 s" },
      },
      {
        name: "Cuánto se mueve el contenido mientras carga",
        note: "Google lo mide de 0 a 1; por debajo de 0,1 se considera bueno",
        actual: { value: 0.525, display: "0,525" },
        nuevo: { value: 0, display: "0" },
      },
      {
        name: "Cuánto hay que descargar",
        actual: { value: 9.6, display: "9,6 MB" },
        nuevo: { value: 0.5, display: "0,5 MB" },
      },
    ],
  },
  {
    title: "Un artículo del blog",
    measures: [
      {
        name: "Cuánto tarda en verse la imagen principal",
        actual: { value: 18.4, display: "18,4 s" },
        nuevo: { value: 4.2, display: "4,2 s" },
      },
      {
        name: "Cuánto tiempo la página no responde al tacto",
        actual: { value: 2.22, display: "2,2 s" },
        nuevo: { value: 0.22, display: "0,2 s" },
      },
      {
        name: "Cuánto hay que descargar",
        actual: { value: 1.9, display: "1,9 MB" },
        nuevo: { value: 0.4, display: "0,4 MB" },
      },
    ],
  },
];

const POR_QUE = [
  {
    head: "Lo que el celular tiene que descargar",
    body: "Hoy la portada pide 79 archivos de programación y 2 de diseño. La nueva pide 9 y 1. Es la misma portada, con el mismo contenido.",
  },
  {
    head: "Complementos de WordPress",
    body: "El sitio actual usa nueve complementos (Elementor, GiveWP, Yoast y otros). Cada uno agrega trabajo en cada visita. El sitio nuevo no usa ninguno.",
  },
  {
    head: "Trabajo del servidor en cada visita",
    body: "WordPress arma cada página desde cero cada vez que alguien entra, y eso toma entre 1 y 1,8 segundos. Las páginas del sitio nuevo ya están armadas de antemano.",
  },
  {
    head: "Las imágenes",
    body: "Se entregan en el tamaño justo para cada pantalla y en un formato más liviano, y la imagen principal se carga primero, antes que lo demás.",
  },
];

const MAPA: Array<{ label: string; note?: string; actual: string; nuevo: string }> = [
  { label: "Artículos del blog", actual: "335", nuevo: "899" },
  { label: "Ediciones de VAMOS", actual: "118", nuevo: "120" },
  { label: "PDF de la revista", actual: "0", nuevo: "120" },
  { label: "Categorías y etiquetas", actual: "72", nuevo: "66" },
  { label: "Páginas y secciones", actual: "13", nuevo: "9" },
  {
    label: "Plantillas internas de Elementor",
    note: "no deberían estar ahí",
    actual: "9",
    nuevo: "0",
  },
  { label: "Formularios de donación retirados y páginas de autor vacías", actual: "10", nuevo: "0" },
];

const NO_SE_PIERDE = [
  {
    head: "Los enlaces antiguos siguen funcionando",
    body: "Revisamos las 187 direcciones del sitio actual que reciben visitas reales: las 187 llevan al lugar correcto en el sitio nuevo. Incluso las de la época anterior a WordPress.",
  },
  {
    head: "Lo que Google muestra en sus resultados",
    body: "El título, la descripción y la imagen de cada página se generan igual que hoy, para que un resultado de búsqueda se vea igual o mejor.",
  },
  {
    head: "Funciona aunque falle algo",
    body: "Todas las páginas se ven completas sin depender de programación adicional. En el sitio actual, la franja de la Audiorevista aparece en blanco cuando eso falla.",
  },
  {
    head: "Artículos repetidos",
    body: "Encontramos 36 artículos duplicados y los archivamos, para que un mismo texto no compita consigo mismo en los listados ni en Google.",
  },
];

// ---------------------------------------------------------------------------
// Piezas

function claseDePuntaje(score: number): string {
  if (score >= 90) return "bg-teal/10 text-teal";
  if (score >= 50) return "bg-hairline text-ink";
  return "bg-brand/10 text-brand";
}

function Barra({
  side,
  display,
  width,
}: {
  side: "Hoy" | "Nuevo";
  display: string;
  width: number;
}) {
  const esNuevo = side === "Nuevo";
  return (
    <div className="grid grid-cols-[3.4rem_1fr_5rem] items-center gap-3">
      <span
        className={`text-[10.5px] font-semibold uppercase tracking-wider ${
          esNuevo ? "text-brand" : "text-muted"
        }`}
      >
        {side}
      </span>
      <span className="relative block h-2.5 bg-hairline">
        <span
          className={`absolute inset-y-0 left-0 ${esNuevo ? "bg-brand" : "bg-muted/60"}`}
          // Bars are scaled within their own measure, so the longer value fills
          // the track. A zero value still shows a hairline, or it reads as a
          // missing bar rather than a good result.
          style={{ width: `${Math.max(width, 0.6)}%` }}
        />
      </span>
      <span className="text-right text-[13px] tabular-nums text-muted">{display}</span>
    </div>
  );
}

function FilaMedida({ measure }: { measure: Medida }) {
  const max = Math.max(measure.actual.value, measure.nuevo.value) || 1;
  return (
    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-[13rem_1fr]">
      <p className="text-sm font-medium text-ink">
        {measure.name}
        {measure.note && (
          <span className="block text-[11.5px] font-normal text-muted">{measure.note}</span>
        )}
      </p>
      <div className="flex flex-col gap-1.5">
        <Barra side="Hoy" display={measure.actual.display} width={(measure.actual.value / max) * 100} />
        <Barra
          side="Nuevo"
          display={measure.nuevo.display}
          width={(measure.nuevo.value / max) * 100}
        />
      </div>
    </div>
  );
}

function Tarjetas({ facts }: { facts: Array<{ head: string; body: string }> }) {
  return (
    <div className="grid gap-px bg-hairline sm:grid-cols-2">
      {facts.map((fact) => (
        <div key={fact.head} className="bg-white p-5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
            {fact.head}
          </p>
          <p className="text-sm leading-relaxed text-muted">{fact.body}</p>
        </div>
      ))}
    </div>
  );
}

function Titulo({ children }: { children: React.ReactNode }) {
  return <h2 className="font-heading mb-1.5 text-2xl font-bold text-navy">{children}</h2>;
}

function Subtitulo({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 mb-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted">
      {children}
    </h3>
  );
}

// ---------------------------------------------------------------------------

export default function SitioNuevoVsActualPage() {
  return (
    <main className="page-offset mx-auto max-w-4xl px-4 pb-24">
      <header className="border-b-2 border-ink pt-16 pb-8">
        <p className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-brand">
          Misiones SIM · El sitio nuevo frente al actual
        </p>
        <h1 className="font-heading text-4xl font-extrabold leading-tight text-navy md:text-5xl">
          Qué ganamos con el sitio nuevo
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Todo lo que sigue está medido, no estimado. Cada cifra viene de aplicar las mismas
          pruebas al sitio que está en línea hoy y al sitio nuevo.
        </p>
        <p className="mt-4 text-xs tracking-wide text-muted">{MEDIDO_EL}</p>
      </header>

      <div className="mt-10 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        {CIFRAS.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 bg-white p-5">
            <span className="font-heading whitespace-nowrap text-2xl font-extrabold tabular-nums text-brand">
              {stat.figure}
            </span>
            <span className="text-xs leading-snug text-muted">{stat.label}</span>
            <span className="text-[11.5px] tabular-nums text-muted/80">{stat.sub}</span>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <Titulo>En resumen</Titulo>
        <div className="max-w-[66ch] space-y-4 leading-relaxed text-muted">
          <p>
            Quien entra hoy al sitio desde el celular espera{" "}
            <strong className="text-ink">entre 15 y 18 segundos</strong> a que aparezca la imagen
            principal, en cualquiera de las tres páginas que probamos. Mientras tanto el teléfono
            queda trabado: durante <strong className="text-ink">2 a 5 segundos</strong> no responde
            si uno toca la pantalla. Google considera que más de 2,5 segundos ya es una mala
            experiencia.
          </p>
          <p>
            En el sitio nuevo esa misma espera baja a{" "}
            <strong className="text-ink">entre 3,5 y 4,2 segundos</strong>. La diferencia no viene
            de haber ajustado detalles, sino de cómo se entrega el sitio: hoy WordPress arma cada
            página desde cero cada vez que alguien entra; el sitio nuevo entrega páginas que ya
            están listas de antemano.
          </p>
          <p>
            Hay algo más, que no se ve pero pesa: hoy la página de la revista{" "}
            <strong className="text-ink">no le muestra a Google ninguna de las 118 ediciones</strong>{" "}
            de VAMOS. Están ahí para quien navega, pero llegan al final de la carga, y los
            buscadores ven una página vacía. Es contenido nuestro, de años de trabajo, que hoy
            nadie puede encontrar buscando.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <Titulo>Lo que mide Google</Titulo>
        <p className="mb-6 max-w-[62ch] text-muted">
          Google publica una herramienta que le pone nota a cualquier página, de 0 a 100, simulando
          un celular con conexión lenta. Estas son las notas de tres páginas representativas, en
          los dos sitios.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm tabular-nums">
            <thead>
              <tr className="border-b-2 border-hairline">
                <th className="py-2 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Página
                </th>
                {["Velocidad", "Accesibilidad", "Buenas prácticas", "Buscadores"].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GOOGLE.map((row) => (
                <tr
                  key={`${row.page}-${row.side}`}
                  className={`border-b border-hairline ${row.side === "actual" ? "text-muted" : ""}`}
                >
                  <td className="py-2.5 pr-3">
                    {row.page} — {row.side === "actual" ? "hoy" : "sitio nuevo"}
                  </td>
                  {row.scores.map((score, i) => (
                    <td key={i} className="px-2 py-2.5 text-right">
                      <span
                        className={`inline-block min-w-[2.6rem] rounded px-2 py-0.5 text-[13px] font-semibold ${claseDePuntaje(score)}`}
                      >
                        {score}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-[66ch] text-sm leading-relaxed text-muted">
          «Accesibilidad» es qué tan bien funciona la página para alguien que usa un lector de
          pantalla o no puede usar el mouse. «Buscadores» es qué tan fácil le resulta a Google
          entender de qué trata la página.
        </p>
      </section>

      <section className="mt-14">
        <Titulo>Qué siente quien visita el sitio</Titulo>
        <p className="max-w-[62ch] text-muted">
          Las notas son un resumen; estos son los números que hay detrás. Las barras están a escala
          dentro de cada medida: más corta es mejor en todos los casos.
        </p>
        {GRUPOS.map((group) => (
          <div key={group.title}>
            <Subtitulo>
              {group.title}
              {group.note && ` — ${group.note}`}
            </Subtitulo>
            <div className="flex flex-col gap-5 border-t border-hairline pt-5">
              {group.measures.map((measure) => (
                <FilaMedida key={`${group.title}-${measure.name}`} measure={measure} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <Titulo>Por qué es más rápido</Titulo>
        <p className="mb-6 max-w-[62ch] text-muted">
          Estas cifras son de la portada de cada sitio.
        </p>
        <Tarjetas facts={POR_QUE} />
      </section>

      <section className="mt-14">
        <Titulo>Que la gente nos encuentre</Titulo>
        <p className="max-w-[62ch] text-muted">
          La velocidad es lo más visible, pero esta parte es la que recupera contenido que hoy está
          fuera del alcance de cualquier buscador.
        </p>

        <Subtitulo>La revista es invisible hoy</Subtitulo>
        <div className="max-w-[66ch] space-y-4 leading-relaxed text-muted">
          <p>
            La página de la Revista VAMOS del sitio actual no contiene ni un solo enlace a las 118
            ediciones. El carrusel que uno ve en pantalla se carga aparte, después de que la página
            termina de abrir, y los buscadores no llegan a verlo. Tampoco lo ve quien tenga una
            conexión que corte la carga a medias. En el sitio nuevo las ediciones están en la
            página desde el primer momento, repartidas en siete páginas de listado.
          </p>
          <p>
            Además, los PDF de la revista pasan a estar en nuestra propia dirección, y las 120
            ediciones quedan en la lista que le entregamos a Google. Hoy están guardados en una
            carpeta interna de WordPress: si alguien enlaza uno de esos PDF, ese reconocimiento se
            pierde el día que apaguemos el sitio viejo.
          </p>
        </div>

        <Subtitulo>Lo que le ofrecemos a Google</Subtitulo>
        <p className="mb-4 max-w-[66ch] text-sm leading-relaxed text-muted">
          Todo sitio le entrega a Google una lista de sus páginas. Así queda esa lista en los dos
          sitios:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-sm tabular-nums">
            <thead>
              <tr className="border-b-2 border-hairline">
                <th className="py-2 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                  La lista incluye
                </th>
                <th className="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Hoy
                </th>
                <th className="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Sitio nuevo
                </th>
              </tr>
            </thead>
            <tbody>
              {MAPA.map((row) => (
                <tr key={row.label} className="border-b border-hairline">
                  <td className="py-2.5 pr-3">
                    {row.label}
                    {row.note && <span className="text-muted"> ({row.note})</span>}
                  </td>
                  <td className="px-2 py-2.5 text-right text-muted">{row.actual}</td>
                  <td className="px-2 py-2.5 text-right">{row.nuevo}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2.5 pr-3">Total</td>
                <td className="px-2 py-2.5 text-right text-muted">557</td>
                <td className="px-2 py-2.5 text-right">1.214</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-[66ch] text-sm leading-relaxed text-muted">
          El salto en la cantidad de artículos es contenido real, no relleno. WordPress tiene 335
          artículos; el sistema nuevo tiene esos más todos los artículos de la revista VAMOS,
          incluidos los de los años anteriores a WordPress, y el sitio nuevo los publica todos.
        </p>

        <Subtitulo>Nada de lo que hoy funciona se pierde</Subtitulo>
        <Tarjetas facts={NO_SE_PIERDE} />
      </section>

      <section className="mt-14">
        <Titulo>Lo que falta antes del cambio</Titulo>
        <p className="mb-6 max-w-[62ch] text-muted">
          Queda un solo punto, y es lo único que el sitio actual tiene y el nuevo todavía no.
        </p>
        <div className="border-l-[3px] border-brand bg-white">
          <div className="flex flex-col gap-1 px-5 py-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
              Falta
            </span>
            <span className="font-semibold text-ink">Un buscador dentro del sitio</span>
            <span className="text-sm leading-relaxed text-muted">
              WordPress tiene una lupa para buscar dentro del sitio; el sitio nuevo todavía no. Los
              listados por categoría y por etiqueta cubren parte de esa necesidad, pero es una
              diferencia que se nota.
            </span>
          </div>
        </div>
      </section>

      <div className="mt-16 border-t border-hairline pt-6">
        <Subtitulo>Cómo se midió</Subtitulo>
        <div className="max-w-[66ch] space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Se usó la herramienta de medición de Google (Lighthouse), simulando un celular con
            conexión lenta, una medición por página. El sitio actual se midió por internet, tal
            como lo recibe cualquier visitante. El sitio nuevo se midió en una computadora local,
            porque todavía no está publicado.
          </p>
          <p>
            Esa diferencia favorece un poco al sitio nuevo en el primer instante de la carga, y hay
            que decirlo. Pero no explica la distancia entre ambos: el tiempo que la página queda
            trabada, cuánto se mueve el contenido, cuántos archivos se piden y cuánto pesan no
            dependen de dónde esté alojado el sitio, y las imágenes se descargaron del mismo lugar
            en los dos casos. En producción esperamos números muy parecidos a estos.
          </p>
          <p>
            Las comparaciones son entre páginas equivalentes: el mismo artículo y la misma edición
            de VAMOS en los dos sitios. Las cifras de esta página corresponden al {MEDIDO_EL} y son
            una foto de ese momento.
          </p>
        </div>
      </div>
    </main>
  );
}
