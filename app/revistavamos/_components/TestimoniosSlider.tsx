"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Testimonio = { quote: string; name: string; location: string };

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d={direction === "left" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/*
 * Live renders "Testimonios de lectores" as a one-at-a-time ElementsKit
 * carousel (5 slides, "N / 5" groups, dot pagination). Same scroll-snap
 * track as AreasSlider — no Swiper — one slide per view instead of three.
 */
export function TestimoniosSlider({ testimonios }: { testimonios: Testimonio[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);

  const step = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return 0;
    const [first, second] = track.children as unknown as HTMLElement[];
    return second.offsetLeft - first.offsetLeft;
  }, []);

  const sync = useCallback(() => {
    const track = trackRef.current;
    const s = step();
    if (!track || !s) return;
    setPage(Math.round(track.scrollLeft / s));
  }, [step]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(track);
    return () => observer.disconnect();
  }, [sync]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const s = step();
    if (!track || !s) return;
    const clamped = Math.min(Math.max(index, 0), testimonios.length - 1);
    setPage(clamped);
    track.scrollTo({ left: clamped * s, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        aria-label="Testimonios de lectores"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonios.map((testimonio) => (
          <li key={testimonio.name} className="w-full shrink-0 snap-start">
            <blockquote className="mx-auto max-w-3xl text-center">
              <p className="text-lg leading-relaxed text-ink">
                &ldquo;{testimonio.quote}&rdquo;
              </p>
              <footer className="mt-6 font-semibold text-ink">
                — {testimonio.name}, {testimonio.location}
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
          aria-label="Testimonio anterior"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-hairline bg-white text-ink transition-opacity disabled:cursor-default disabled:opacity-40"
        >
          <Chevron direction="left" />
        </button>
        <div className="flex items-center gap-3">
          {testimonios.map((testimonio, i) => (
            <button
              key={testimonio.name}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir al testimonio ${i + 1}`}
              aria-current={i === page}
              className={`h-2 w-2 cursor-pointer rounded-full transition-transform ${
                i === page ? "scale-125 bg-brand" : "bg-ink/25"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= testimonios.length - 1}
          aria-label="Testimonio siguiente"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-hairline bg-white text-ink transition-opacity disabled:cursor-default disabled:opacity-40"
        >
          <Chevron direction="right" />
        </button>
      </div>
    </div>
  );
}
