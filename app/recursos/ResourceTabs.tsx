"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";

export type ResourceTab = {
  /** Short label shown in the tab list. */
  title: string;
  /** Supporting line under the label in the tab list. */
  tagline: string;
  body: string;
  image: { src: string; alt: string };
  cta: { label: string; href: string };
};

/*
 * The "Revista VAMOS / Manual VAMOS" block. Live renders this with the
 * ElementsKit tabs widget, whose tabs are `<a href="#panel">` — activating one
 * with the keyboard jumps the page to the panel anchor and pushes a history
 * entry, so Back walks through tab clicks instead of leaving the page. These
 * are buttons in a real ARIA tablist instead: arrow keys move between tabs,
 * nothing is added to history, and the panel keeps its scroll position.
 *
 * Layout follows live: tab list on the left, panel on the right at lg and up;
 * both stack on narrow screens.
 */
export function ResourceTabs({ tabs }: { tabs: ResourceTab[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = (i: number) => `${baseId}-panel-${i}`;

  // Roving focus: Arrow/Home/End move selection and focus together, which is
  // the expected behaviour for an automatic-activation tablist.
  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const moves: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    let next: number | undefined;
    if (event.key in moves) next = (active + moves[event.key] + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  const panel = tabs[active];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(260px,340px)_1fr] lg:items-start">
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="Recursos destacados"
        className="flex flex-col gap-4"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.title}
            ref={(node) => {
              tabRefs.current[i] = node;
            }}
            type="button"
            role="tab"
            id={tabId(i)}
            aria-selected={i === active}
            aria-controls={panelId(i)}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
            className={`rounded-2xl border px-7 py-5 text-left transition-colors ${
              i === active
                ? "border-transparent bg-white shadow-sm"
                : "border-hairline bg-transparent hover:bg-white/60"
            }`}
          >
            <span className="font-heading block text-lg font-bold text-brand">{tab.title}</span>
            <span className="mt-1 block text-sm leading-snug text-muted">{tab.tagline}</span>
          </button>
        ))}
      </div>

      {/* One panel node, re-keyed per tab: the inactive panels' markup never
          ships, and the key restarts the fade on every switch. */}
      <div
        key={active}
        role="tabpanel"
        id={panelId(active)}
        aria-labelledby={tabId(active)}
        tabIndex={0}
        className="rounded-2xl bg-white p-6 motion-safe:animate-fade-in sm:p-10"
      >
        <div className="grid items-center gap-8 sm:grid-cols-[1fr_minmax(0,320px)]">
          <div>
            <h3 className="font-heading text-2xl font-bold text-brand sm:text-3xl">
              {panel.title}
            </h3>
            <p className="mt-4 text-muted">{panel.body}</p>
            <ResourceCta {...panel.cta} />
          </div>
          <Image
            src={panel.image.src}
            alt={panel.image.alt}
            width={900}
            height={608}
            unoptimized
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 40vw, 88vw"
            className="w-full rounded-2xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}

/*
 * Live opens even the internal /revistavamos/ link with target="_blank". Same
 * URLs here, but the internal one stays a client-side <Link> in the same tab.
 */
function ResourceCta({ label, href }: { label: string; href: string }) {
  const className =
    "mt-6 inline-block rounded-btn bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark";
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {label}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  );
}
