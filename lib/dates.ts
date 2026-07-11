// Shared es-ES date formatting for display (UTC-pinned so server and client
// render the same string regardless of host timezone).

// "2024-03-01T..." → "marzo 2024" (magazine edition style)
export function fechaToEdicion(fecha: string): string {
  const d = new Date(fecha);
  const month = d.toLocaleDateString("es-ES", { month: "long", timeZone: "UTC" });
  return `${month} ${d.getUTCFullYear()}`;
}

// "2021-10-28T..." → "28 de octubre de 2021" (blog post display)
export function formatPostDate(publishDate: string): string {
  return new Date(publishDate).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
