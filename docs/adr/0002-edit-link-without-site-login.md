# `?edit` reveals an edit link; there is no site login

Editors (about 3, all with Contentful accounts) get from the website to Contentful through an **Edit link**. Visiting any page with `?edit` makes a small client-side script show an "Edit in Contentful" button, remembered in that browser until `?edit=off`. The button is not protected, because it only links to `app.contentful.com`, and Contentful asks for a login itself.

`?edit` must never turn on Draft preview. Drafts are only reachable through the secret preview URL that Contentful's Preview button calls. Otherwise anyone who guessed `?edit` could read unpublished content and spend Preview API quota on every page view.

## Considered Options

- **Password-less (magic-link) login on the site, shared with Mi Movilicemos**: rejected. The two sites are on different domains (`misionessim.org`, `movilicemos.org`), so they can't share a session cookie. It would also add Neon tables, Resend email and session handling to protect a link that Contentful already protects.
