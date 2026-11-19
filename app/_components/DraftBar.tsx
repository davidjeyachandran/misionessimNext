import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { draftExitPath } from "../../lib/draft-preview";
import { contentfulEntryUrl } from "../../lib/edit-link";

async function exitDraftPreview(path: string, published: boolean) {
  "use server";
  (await draftMode()).disable();
  redirect(draftExitPath(path, published));
}

interface Props {
  entryId?: string;
  path: string;
  published: boolean;
}

export function DraftBar({ entryId, path, published }: Props) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID ?? "";
  const exit = exitDraftPreview.bind(null, path, published);

  return (
    <aside
      role="status"
      data-draft-bar
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-ink px-4 py-3 text-sm text-white shadow-lg"
    >
      <strong className="font-semibold">Vista previa de borrador</strong>
      <span className="text-white/70">
        {published ? "Incluye cambios sin publicar." : "Este artículo aún no está publicado."} La
        navegación del artículo está oculta.
      </span>
      {entryId && spaceId && (
        <a
          href={contentfulEntryUrl(spaceId, entryId)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          Editar en Contentful
        </a>
      )}
      <form action={exit}>
        <button type="submit" className="rounded border border-white/60 px-3 py-1 hover:bg-white hover:text-ink">
          Salir
        </button>
      </form>
    </aside>
  );
}
