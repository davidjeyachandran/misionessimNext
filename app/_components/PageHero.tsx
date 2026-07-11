import Image from "next/image";

interface PageHeroProps {
  title: string;
  intro?: string;
  image: { src: string; alt?: string };
  cta?: { label: string; href: string };
}

export function PageHero({ title, intro, image, cta }: PageHeroProps) {
  return (
    <section className="relative isolate flex min-h-[60vh] items-center overflow-hidden bg-navy md:min-h-[64vh]">
      <Image
        src={image.src}
        alt={image.alt ?? ""}
        fill
        priority
        className="absolute inset-0 -z-10 object-cover"
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
        <h1 className="max-w-xl font-heading text-4xl font-bold text-white md:text-5xl">
          {title}
        </h1>
        {intro && <p className="mt-4 max-w-md text-white/90">{intro}</p>}
        {cta && (
          <a
            href={cta.href}
            target="_blank"
            rel="noopener"
            className="mt-8 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {cta.label}
          </a>
        )}
      </div>
    </section>
  );
}
