"use client";

import { useEffect, useRef, type CSSProperties } from "react";

interface FootprintTrailProps {
  /** Which way the trail walks across the page. */
  direction?: "ltr" | "rtl";
  /** Print colour, any CSS colour (the trails sit on different bands). */
  color?: string;
  /** Extra classes for the strip, e.g. its vertical spacing. */
  className?: string;
}

const STEPS = 8;

/*
 * A short trail of bare footprints that walks across the page when it scrolls
 * into view — the campaign's "pies" made literal. Used once, under the
 * Romans 10:15 verse.
 *
 * Purely decorative (aria-hidden). Prints are visible by default; the
 * hide-then-step animation only arms once JS runs and motion is allowed, so
 * without JS or under prefers-reduced-motion the trail is simply there.
 */
export function FootprintTrail({
  direction = "ltr",
  color = "var(--chsp-terracotta)",
  className = "",
}: FootprintTrailProps) {
  const ref = useRef<HTMLDivElement>(null);

  // The armed/walking state lives on the element's data-state, not in React
  // state: it only drives CSS, so there's nothing for React to re-render.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }
    el.dataset.state = "armed";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.state = "walking";
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`chsp-trail relative mx-auto h-24 max-w-5xl sm:h-28 ${className}`.trim()}
      style={{ color }}
    >
      {Array.from({ length: STEPS }, (_, i) => {
        const t = i / (STEPS - 1);
        const left = direction === "ltr" ? 6 + t * 88 : 94 - t * 88;
        const isLeftFoot = i % 2 === 0;
        // Gentle downhill line, with each print stepping off it to its own
        // side: walking right the left foot is the upper one, walking left the
        // lower one.
        const side = isLeftFoot === (direction === "ltr") ? -11 : 11;
        const top = 28 + t * 30 + side;
        // Toes point the way the trail walks; the descent tilts them down a touch.
        const heading = direction === "ltr" ? 99 : -99;
        return (
          <svg
            key={i}
            viewBox="0 0 30 48"
            className="chsp-print absolute h-10 w-[25px] sm:h-12 sm:w-[30px]"
            style={
              {
                left: `${left}%`,
                top: `${top}%`,
                "--chsp-rot": `${heading}deg`,
                "--chsp-flip": isLeftFoot ? 1 : -1,
                animationDelay: `${i * 170}ms`,
              } as CSSProperties
            }
          >
            <g fill="currentColor">
              <path d="M15 14.5c6.8 0 10 5 9.1 12.8-.7 5.8-2.9 9.4-2.9 13.4 0 4.3-3.1 7-6.7 6.2-3.3-.7-4.7-3.7-4.7-7 0-4.4-3.9-7.9-3.9-14.3 0-6.5 3.3-11.1 9.1-11.1z" />
              <circle cx="19.5" cy="9" r="3.8" />
              <circle cx="13.6" cy="7.4" r="2.6" />
              <circle cx="9.4" cy="8.9" r="2.2" />
              <circle cx="6.4" cy="11.8" r="1.9" />
              <circle cx="4.6" cy="15.4" r="1.6" />
            </g>
          </svg>
        );
      })}
    </div>
  );
}
