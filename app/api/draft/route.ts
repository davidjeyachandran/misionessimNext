import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getDraftBlogPostEntry } from "../../../lib/contentful";
import { draftPostPath, isValidPreviewSecret } from "../../../lib/draft-preview";

// Called by Contentful's Preview button:
//   /api/draft/?secret=<CONTENTFUL_PREVIEW_SECRET>&id={entry.sys.id}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (!isValidPreviewSecret(searchParams.get("secret"), process.env.CONTENTFUL_PREVIEW_SECRET)) {
    return new Response("Invalid token", { status: 401 });
  }

  if (!process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN) {
    return new Response("Draft preview is not configured: set CONTENTFUL_PREVIEW_ACCESS_TOKEN", {
      status: 503,
    });
  }

  const id = searchParams.get("id");
  const entry = id ? await getDraftBlogPostEntry(id) : null;
  if (!entry) {
    return new Response("Entry not found", { status: 404 });
  }

  (await draftMode()).enable();
  redirect(draftPostPath(entry));
}
