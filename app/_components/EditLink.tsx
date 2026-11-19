"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { contentfulEntryUrl, EDIT_STORAGE_KEY, resolveEditPreference } from "../../lib/edit-link";

function readStored(): string | null {
  try {
    return window.localStorage.getItem(EDIT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value: string) {
  try {
    window.localStorage.setItem(EDIT_STORAGE_KEY, value);
  } catch {
    // Storage blocked (private mode): the link still works for this page view.
  }
}

// Client-side navigation swaps the page in after this layout component has
// rendered, so watch the DOM — but only in an editor's browser.
function subscribe(onChange: () => void) {
  if (!resolveEditPreference(window.location.search, readStored()).show) return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

// Pages that map to a Contentful entry mark themselves with
// `data-contentful-entry`. The draft bar carries its own edit link.
function visibleEntryId(): string | null {
  const { show } = resolveEditPreference(window.location.search, readStored());
  if (!show || document.querySelector("[data-draft-bar]")) return null;
  return document.querySelector<HTMLElement>("[data-contentful-entry]")?.dataset.contentfulEntry ?? null;
}

// Only reveals a link to Contentful, which asks for its own login; it never
// turns on draft content (docs/adr/0002).
export function EditLink({ spaceId }: { spaceId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const { store } = resolveEditPreference(window.location.search, readStored());
    if (store) writeStored(store);
  }, [pathname]);

  const entryId = useSyncExternalStore(subscribe, visibleEntryId, () => null);
  if (!entryId || !spaceId) return null;

  return (
    <a
      href={contentfulEntryUrl(spaceId, entryId)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-brand"
    >
      Editar en Contentful
    </a>
  );
}
