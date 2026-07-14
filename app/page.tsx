import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ScrollEffects } from "./_components/ScrollEffects";
import { VideoPromo } from "./_components/VideoPromo";
import { getBlogPosts, publishDateToSegment } from "../lib/contentful";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "SIM es una comunidad de seguidores de Dios. Tenemos una pasión por el Evangelio y buscamos cumplir la misión de Jesucristo en el mundo.",
};

function homeDate(publishDate: string): string {
  const d = new Date(publishDate);
  const month = d.toLocaleDateString("es-ES", { month: "long", timeZone: "UTC" });
  return `${d.getUTCDate()} ${month}, ${d.getUTCFullYear()}`;
}

export default async function Home() {
  const { items: posts } = await getBlogPosts(3, 0);

  return (
    <div className="sim-home">
      {/* ============ HERO ============ */}
      <section className="hero" id="hero">
        <div className="parallax-bg" data-parallax="0">
          <Image
            src="/home/banner-sim-home_.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content container reveal">
          <h1>¡Estamos al servicio del movimiento misionero latino!</h1>
        </div>
      </section>

      {/* ============ QUIÉNES SOMOS ============ */}
      <section className="about section">
        <div className="container about-grid">
          <div className="about-text reveal">
            <h3 className="about-title">
              SIM es una comunidad de <br />seguidores de Dios
            </h3>
            <p>
              Tenemos una pasión por el Evangelio y buscamos cumplir la misión de
              Jesucristo en el mundo.
            </p>
            <p>
              Venimos trabajando fuertemente a través de las alianzas
              estratégicas, para facilitar el envío de misioneros latinos al
              campo, permitiendo así, el intercambio de experiencias y
              aprendizaje que este proceso implica.
            </p>
            <p>
              Contamos desde nuestros inicios con varios equipos misioneros
              multiculturales alrededor del mundo. Esto hará posible la inserción
              de misioneros latinos en el trabajo de SIM.
            </p>
          </div>
          <div className="about-media reveal">
            <Image
              src="/home/foto-sim3_2.webp"
              alt="Equipo misionero de SIM Latinoamérica"
              width={520}
              height={360}
              className="!w-full !h-auto"
            />
          </div>
        </div>
      </section>

      {/* ============ SUMARTE A LA MISIÓN ============ */}
      <section className="join section section-alt">
        <div className="container">
          <h2 className="section-title text-center reveal">
            Descubre cómo sumarte a la <span>misión global</span>
          </h2>
          <div className="cards">
            <article className="card reveal">
              <div className="card-media">
                <Image
                  src="/home/foto-sim2_.webp"
                  alt="Sirve en la misión"
                  fill
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc((100vw - 70px) / 2), 380px"
                />
              </div>
              <div className="card-body">
                <h3>Sirve</h3>
                <p>
                  Dios nos ha equipado y nos ha dado los dones y talentos que
                  necesitamos para cumplir Su mandato. Él no nos envía por nuestra
                  propia cuenta más bien nos acompaña cada paso del camino.
                </p>
                <p>
                  Si sientes que Dios te está guiando a servirle en el campo
                  misionero, por favor ponte en contacto con nosotros ya que es
                  parte de nuestra misión ayudar a los que están buscando ser
                  usados por Dios.
                </p>
                <Link className="btn btn-outline" href="/sirve-con-sim/">
                  Escríbenos
                </Link>
              </div>
            </article>
            <article className="card reveal">
              <div className="card-media">
                <Image
                  src="/home/foto-da.webp"
                  alt="Da para la misión"
                  fill
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc((100vw - 70px) / 2), 380px"
                />
              </div>
              <div className="card-body">
                <h3>Da</h3>
                <p>
                  Los misioneros de SIM reciben su apoyo en oración y financiero a
                  través de las iglesias, amigos, y otros que están apasionados
                  por su ministerio. El nivel de apoyo necesario para cada
                  misionero o familia depende de varios factores.
                </p>
                <p>
                  ¿Deseas apoyar a SIM Latinoamérica o algún misionero de SIM?
                  Escríbenos a{" "}
                  <a href="mailto:info@misionessim.org">info@misionessim.org</a>
                </p>
                <a className="btn btn-outline" href="mailto:info@misionessim.org">
                  Descúbre cómo
                </a>
              </div>
            </article>
            <article className="card reveal">
              <div className="card-media">
                <Image
                  src="/home/foto-ora.webp"
                  alt="Ora por la misión"
                  fill
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc((100vw - 70px) / 2), 380px"
                />
              </div>
              <div className="card-body">
                <h3>Ora</h3>
                <p>
                  Queremos cruzar barreras para proclamar a Cristo. Ora que Dios
                  nos dirija en sabiduría y compasión. Somos internacional y
                  multicultural. Con esto vienen muchas bendiciones, pero también
                  desafíos para tener unidad y buena comunicación. Ora que Dios
                  sea glorificado por la forma en como trabajamos juntos.
                </p>
                <Link className="btn btn-outline" href="/ora/">
                  Nuestra oración
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ CONÓCENOS / VIDEO ============ */}
      <VideoPromo />

      {/* ============ BLOG ============ */}
      <section className="blog section">
        <div className="container">
          <div className="blog-head reveal">
            <div>
              <p className="eyebrow">Mantente informado</p>
              <h2 className="section-title">
                Descubre más historias en <span>nuestro blog</span>
              </h2>
            </div>
            <Link className="btn btn-primary" href="/blog/">
              Mira más artículos aquí
            </Link>
          </div>
          <div className="posts">
            {posts.map((post) => {
              const href = `/blog/${publishDateToSegment(post.publishDate)}/${post.slug}/`;
              return (
                <article className="post reveal" key={post.slug}>
                  <Link className="post-media" href={href}>
                    {post.heroImage?.url && (
                      <Image
                        src={post.heroImage.url}
                        alt={post.heroImage.description ?? post.title}
                        width={400}
                        height={210}
                        style={{ width: "100%", height: "210px", objectFit: "cover" }}
                      />
                    )}
                  </Link>
                  <div className="post-body">
                    <span className="post-date">{homeDate(post.publishDate)}</span>
                    <h3>
                      <Link href={href}>{post.title}</Link>
                    </h3>
                    {post.description && <p>{post.description}</p>}
                    <Link className="post-more" href={href}>
                      Leer más
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ REVISTA VAMOS ============ */}
      <section className="revista" id="revista">
        <div
          className="parallax-bg"
          data-parallax="0.3"
          style={{ backgroundImage: "url('/home/foto-revista2.webp')" }}
        />
        <div className="revista-overlay" />
        <div className="container revista-content reveal">
          <p className="eyebrow eyebrow-light">Recurso gratuito</p>
          <h2>Revista VAMOS</h2>
          <p className="revista-desc">
            Una revista con pasión por las misiones. Queremos reflejar la voz de
            los obreros que se encuentran en el campo y la realidad de la Iglesia
            latina. Tenemos más de 110 ediciones publicadas en formato digital y
            gratis.
          </p>
          <Link className="btn btn-primary" href="/revistavamos/">
            Ver ediciones
          </Link>
        </div>
      </section>

      {/* ============ YOUTUBE PROMO ============ */}
      <section className="yt-promo section section-dark">
        <div className="container yt-grid">
          <div className="yt-text reveal">
            <h2>¡Estamos al servicio del movimiento misionero Latino!</h2>
            <p>
              No te pierdas el contenido diverso en nuestro canal de YouTube para
              conocer más sobre la misión de Dios.
            </p>
            <a
              className="btn btn-yt"
              href="https://www.youtube.com/c/SIMLatinoamérica"
              target="_blank"
              rel="noopener"
            >
              <Image src="/home/logo-youtube.png" alt="" width={34} height={24} />
              Mira más videos aquí
            </a>
          </div>
          <div className="yt-media reveal">
            <Image
              src="/home/foto-sim-video.jpg"
              alt="Canal de YouTube de SIM Latinoamérica"
              width={520}
              height={340}
              className="!w-full !h-auto"
            />
          </div>
        </div>
      </section>

      <ScrollEffects />
    </div>
  );
}
