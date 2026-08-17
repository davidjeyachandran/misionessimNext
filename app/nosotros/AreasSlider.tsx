"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Area = { title: string; text: string; icon: string };

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
 * Live renders "Áreas de servicios" as an ElementsKit testimonial slider
 * (widget `4a8a4ef`, style 5 / block-style-two): dark-red cards on the cream
 * band, icon and title above the body copy, 3 per view at 1024+, 2 at 768,
 * 1 below. This is that slider as a scroll-snap track — no Swiper — with the
 * scroll position driving the dots, so it still works with the keyboard,
 * with a trackpad, and with JS-free scrolling.
 */
export function AreasSlider({ areas }: { areas: Area[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  // Distance between two slide starts (slide width + gap) — the unit every
  // scroll position is measured in. Read from the DOM so the responsive
  // basis/gap classes stay the single source of truth for the layout.
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
    // clientWidth/step lands just under the visible slide count (it's short
    // by one gap), so round rather than floor.
    const perView = Math.max(1, Math.round(track.clientWidth / s));
    setPageCount(Math.max(1, areas.length - perView + 1));
    setPage(Math.round(track.scrollLeft / s));
  }, [areas.length, step]);

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
    const clamped = Math.min(Math.max(index, 0), pageCount - 1);
    // Set the page here as well as from `onScroll`: the smooth scroll only
    // settles a few hundred ms later, and the dots should answer the click now.
    setPage(clamped);
    track.scrollTo({ left: clamped * s, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        aria-label="Áreas de servicios"
        className="flex snap-x snap-mandatory gap-[10px] overflow-x-auto pb-1 lg:gap-[15px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {areas.map((area) => (
          <li
            key={area.title}
            className="shrink-0 basis-full snap-start sm:basis-[calc((100%-10px)/2)] lg:basis-[calc((100%-30px)/3)]"
          >
            {/* h-full so every card in view matches the tallest — live gets
                the same effect from a 220px min-height on the body copy. */}
            <article className="flex h-full flex-col rounded-xl bg-brand-dark p-6">
              {/* The source PNGs are cream artwork drawn for these dark-red
                  cards, so they're used as-is. */}
              <Image
                src={area.icon}
                alt=""
                width={60}
                height={60}
                unoptimized
                className="h-[60px] w-[60px]"
              />
              <h3 className="font-heading mt-4 text-[17px] font-semibold leading-snug text-cream">
                {area.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-white">{area.text}</p>
            </article>
          </li>
        ))}
      </ul>

      {/* Live floats tiny arrows off the track's edges; keeping them beside
          the dots avoids overlapping a card and avoids overflow at any width. */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
          aria-label="Áreas anteriores"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-hairline bg-white text-ink transition-opacity disabled:cursor-default disabled:opacity-40"
        >
          <Chevron direction="left" />
        </button>
        <div className="flex items-center gap-3">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir al área ${i + 1}`}
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
          disabled={page >= pageCount - 1}
          aria-label="Áreas siguientes"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-hairline bg-white text-ink transition-opacity disabled:cursor-default disabled:opacity-40"
        >
          <Chevron direction="right" />
        </button>
      </div>
    </div>
  );
}
