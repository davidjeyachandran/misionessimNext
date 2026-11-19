export const EDIT_STORAGE_KEY = "misionessim:edit-link";

export interface EditPreference {
  show: boolean;
  /** New value to persist, or undefined to leave storage alone. */
  store?: "on" | "off";
}

// `?edit` turns the Edit link on for this browser, `?edit=off` turns it off,
// and without the parameter the remembered choice applies.
export function resolveEditPreference(search: string, stored: string | null): EditPreference {
  const param = new URLSearchParams(search).get("edit");
  if (param === null) return { show: stored === "on" };
  if (param === "off" || param === "0" || param === "false") {
    return { show: false, store: "off" };
  }
  return { show: true, store: "on" };
}

export function contentfulEntryUrl(spaceId: string, entryId: string): string {
  return `https://app.contentful.com/spaces/${encodeURIComponent(spaceId)}/entries/${encodeURIComponent(entryId)}`;
}
