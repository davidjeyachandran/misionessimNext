"use client";

import { useState } from "react";

type HistoryItem = { year: string; title: string; text: string };

// Visual stand-in for ElementsKit's `icon-flag1` glyph on the live cards.
function FlagIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 8 2a6 6 0 0 0 3-.8V13a6 6 0 0 1-3 .8c-3 0-5-2-8-2a6 6 0 0 0-4 1.5" />
    </svg>
  );
}

function EntryCard({ item }: { item: HistoryItem }) {
  return (
    <div className="rounded-2xl bg-cream p-8 text-left shadow-sm">
      <span
        aria-hidden
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-cream"
      >
        <FlagIcon />
      </span>
      <h3 className="font-heading mt-5 text-lg font-bold text-navy">{item.title}</h3>
      <p className="mt-3 text-muted">{item.text}</p>
    </div>
  );
}

// Caret pointing up from a card to its pin — live draws this as a rotated
// square in the card's cream, overlapping the card's top edge.
function Caret() {
  return (
    <span aria-hidden className="mx-auto -mb-2 block h-4 w-4 rotate-45 bg-cream" />
  );
}

/*
 * Live's "Conoce nuestra historia" is an ElementsKit horizontal timeline:
 * a row of year-stops on a hairline, with the active entry's cream card
 * revealed below. Live toggles on hover via jQuery; per feedback we drive
 * it by click instead. Below lg every entry renders expanded, matching
 * live's tablet/mobile fallback (its per-column reveal only exists on
 * desktop widths).
 */
export function HistoryTimeline({ items }: { items: HistoryItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Desktop: 4 columns, one card open at a time */}
      <div className="hidden lg:grid lg:grid-cols-4">
        {items.map((item, i) => {
          const isActive = i === active;
          const panelId = `history-panel-${i}`;
          return (
            <div key={item.year} className="px-3">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                aria-controls={panelId}
                className="block w-full cursor-pointer text-center"
              >
                <span className="text-sm text-muted">{item.year}</span>
                {/* -mx-3 lets each column's hairline segment run edge to
                    edge so the four join into one continuous line. */}
                <span className="relative -mx-3 mt-6 block h-px bg-hairline">
                  <span
                    className={`absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 ${
                      isActive ? "border-2 border-brand bg-white" : "bg-brand"
                    }`}
                  />
                </span>
                {/* Live hides the under-bar title for the active column —
                    the card repeats it just below. */}
                <span
                  className={`font-heading mt-6 block text-lg font-bold leading-snug text-navy transition-opacity duration-300 ${
                    isActive ? "opacity-0" : ""
                  }`}
                >
                  {item.title}
                </span>
              </button>
              <div
                id={panelId}
                aria-hidden={!isActive}
                className={
                  isActive
                    ? "translate-y-0 opacity-100 transition-[opacity,transform] duration-300"
                    : "invisible h-0 -translate-y-2 overflow-hidden opacity-0"
                }
              >
                <Caret />
                <EntryCard item={item} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablet/mobile: every entry expanded, as on live */}
      <ol className="grid gap-10 sm:grid-cols-2 lg:hidden">
        {items.map((item) => (
          <li key={item.year}>
            <p className="text-center text-sm text-muted">{item.year}</p>
            <div className="relative mt-5 h-px bg-hairline">
              <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand" />
            </div>
            <div className="mt-7">
              <Caret />
              <EntryCard item={item} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
