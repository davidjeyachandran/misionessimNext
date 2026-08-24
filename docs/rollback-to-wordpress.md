# Runbook — rolling back to WordPress

**Purpose:** get `misionessim.org` serving the old WordPress site again, quickly,
if the rebuild has to be abandoned.

**Owner:** David · **Last verified:** 2026-08-24

Read the two boxes below before touching DNS. Most incidents do not need this
runbook, and the rollback has one failure mode that will waste your first
fifteen minutes if you meet it cold.

---

## Try this first: Vercel deployment rollback (2 minutes, no DNS)

If the problem is *the new site is broken* — a bad deploy, a broken build, a
content import gone wrong — this is the answer, not a DNS change.

Vercel → project **misionessim-next** → *Deployments* → pick the last known-good
deployment → **⋯ → Promote to Production**.

It takes effect immediately, needs no DNS propagation, and is reversible. Only
move on to the full rollback if the *decision to migrate at all* is being
reversed, or if Vercel itself is unavailable.

---

## The failure mode to know about

**Watch the origin's TLS certificate for `misionessim.org`.**

Measured 2026-08-24: the origin (`66.225.201.6` = `bh8986.banahosting.com`)
presents a Let's Encrypt cert covering `misionessim.org` and
`www.misionessim.org` — along with `cpanel`, `mail`, `webmail`, `webdisk`,
`autodiscover`, `autoconfig`, `cpcalendars`, `cpcontacts` — valid until
**2026-11-04**. So a rollback today would land on a valid certificate.

The risk is at **renewal**. AutoSSL proves control by fetching a challenge over
HTTP at the domain it is issuing for, and `misionessim.org` resolves to Vercel,
so that check now fails at the origin. Whether the November renewal succeeds
depends on which validation method Banahosting uses. Point DNS back at the
origin with a lapsed cert and every visitor gets a browser interstitial — a worse
outage than the one you were fixing.

Two ways to deal with it:

- **Prevention (do this):** check cPanel → *SSL/TLS Status* monthly, and
  specifically in early November 2026 when the current cert comes up for
  renewal. Verify from outside without touching DNS:

  ```bash
  echo | openssl s_client -connect 66.225.201.6:443 -servername misionessim.org 2>/dev/null | openssl x509 -noout -subject -dates
  ```
- **Emergency workaround:** proxy the apex through Cloudflare (**orange cloud**)
  and set SSL/TLS mode to **Full** — *not* Full (strict). Cloudflare then serves
  its own edge certificate to visitors and tolerates an expired or self-signed
  cert at the origin. This is exactly the mismatch that makes
  `mail.misionessim.org` return 525 today, used deliberately and in the safe
  direction. Fix the origin cert properly afterwards and move to Full (strict).

---

## Prepare now, while nothing is on fire

1. **Record the origin IP here.** Banahosting cPanel → *General Information* →
   "Shared IP Address".

   > **WordPress origin IP:** `__________________`  ← fill this in and commit it

   During an incident you do not want to be hunting for a hosting login.

2. **Leave DNS TTLs at 300s.** All records are at 300 today. That is the
   difference between a five-minute rollback and an hour of stale caches.

3. **Keep WordPress warm.** Don't delete the account, don't let the plan lapse,
   and keep the monthly AutoSSL check above.

4. **Know what rollback loses** (see the last section) so the decision is made
   with open eyes.

---

## Current DNS state — the thing you are reverting

Nameservers are Cloudflare (`bob.ns.cloudflare.com`, `uma.ns.cloudflare.com`),
so every change below happens in the Cloudflare dashboard.

| Record | Value today | Proxy | TTL |
|---|---|---|---|
| `misionessim.org` A | `216.198.79.1` (Vercel) | DNS-only (grey) | 300 |
| `www` | Cloudflare edge IPs; underlying value points at Vercel, which 308s to the apex | Proxied (orange) | 300 |
| `historias` CNAME | `…vercel-dns-017.com` (sim-blog) | DNS-only | 290 |
| `mail`, `cpanel`, `webmail`, `ftp` | Cloudflare edge IPs → old origin | Proxied | 300 |
| MX | `0 misionessim.org.` | — | 300 |

`historias.misionessim.org` is a **separate** Vercel project (sim-blog). It is
unaffected by any step here — do not touch it.

Check the `www` record's underlying value in the dashboard before you start; the
`dig` output only shows Cloudflare's edge IPs, not what sits behind them.

---

## Rollback

Total time ≈ 20 minutes, most of it steps 4–6 on the WordPress side.

### 1. Undo the "archive mode" lockdown

Everything done to keep the WordPress copy out of Google now has to come off, or
you will roll back onto a site that search engines are forbidden to crawl.

- Delete `public_html/robots.txt` (the `Disallow: /` file), **or** replace its
  contents with `User-agent: *` and `Allow: /`.
- Remove any `X-Robots-Tag "noindex, nofollow"` line from `public_html/.htaccess`.
- cPanel → *Directory Privacy* → remove the password protection from
  `public_html`.
- WordPress → *Settings → Reading* → ensure "Discourage search engines" is
  **unchecked**.

A missed `noindex` here is the most expensive mistake in this runbook: the site
comes back up looking fine and silently deindexes over the following weeks.

### 2. Point WordPress back at the apex

In `wp-config.php`, change the overrides added when the subdomain was set up:

```php
define('WP_HOME','https://misionessim.org');
define('WP_SITEURL','https://misionessim.org');
```

Leave them pointing at `wordpress.misionessim.org` and every request to the apex
301s to the subdomain — the same loop, in the other direction.

### 3. Confirm the origin cert

Run the `openssl s_client` check above against `misionessim.org`. If the cert has
lapsed, either run AutoSSL now (it will succeed once DNS points back, but not
before) or plan to use the Cloudflare **Full** workaround in step 4.

### 4. Flip DNS

Cloudflare → DNS:

- **`misionessim.org` A** → change `216.198.79.1` to the origin IP.
- **`www`** → change its underlying value to the origin IP too (or CNAME to the
  apex).

Proxy setting: leave grey if the origin cert is valid. If it is not, set **both
records to orange** and switch SSL/TLS → Overview → **Full**. Do not use Full
(strict) with a lapsed origin cert; that produces the 525 that `mail.` shows.

### 5. Purge Cloudflare's cache

Cloudflare → *Caching* → *Configuration* → **Purge Everything**. Proxied records
will otherwise keep serving the old edge cache.

### 6. Verify

```bash
dig +short misionessim.org A
```

```bash
curl -sI https://misionessim.org/ | head -20
```

```bash
curl -s https://misionessim.org/ | grep -oE '<title>[^<]*'
```

```bash
curl -s https://misionessim.org/robots.txt
```

You want: the origin IP, a `200` with WordPress-ish headers, a WordPress page
title, and a `robots.txt` that does **not** say `Disallow: /`.

Then spot-check a post, a `/la-revista/` edition, and a magazine PDF — those are
the three URL shapes the redirect layer was carrying.

### 7. Take Vercel out of the path

Only once WordPress is confirmed serving: Vercel → project **misionessim-next**
→ *Settings → Domains* → remove `misionessim.org` and `www.misionessim.org`.
Leaving them attached is harmless for traffic but will confuse the next person.

Do **not** delete the Vercel project. Roll-forward depends on it.

---

## What rollback does *not* restore

Decide with these in view — they are the real cost, not the DNS change.

- **Everything published on the new site since cutover.** The blog has ~899 post
  URLs against WordPress's 335, including 2026 content that only ever existed in
  Contentful. WordPress has never seen any of it. Rolling back makes those URLs
  404 and reverts the site to its pre-migration content.
- **The 539 legacy redirects in `vercel.json`.** These live at Vercel's edge, not
  in DNS. WordPress carries its own (different, older) redirect table and none of
  the Drupal-era work from the 2026-08-24 triage. Expect the 404 count in Search
  Console to climb back. See [legacy-404-triage.md](legacy-404-triage.md).
- **`/recursos/<file>` and the revista PDF paths.** These are Vercel rewrites
  proxying Contentful assets. On WordPress they resolve to whatever
  `/wp-content/uploads/` held at shutdown.
- **Contentful stays the source of truth for the new site.** Rolling back does not
  migrate anything backwards; the two content sets simply diverge from that
  moment on. The longer the rollback lasts, the more expensive rolling forward
  gets.

---

## Rolling forward again

Reverse steps 1–7: re-add the domains in Vercel, point the apex A back to
`216.198.79.1` and `www` back to its Vercel value, purge Cloudflare's cache, then
re-apply the WordPress lockdown from step 1 and re-point `wp-config.php` at
`wordpress.misionessim.org`.

Rebuild and redeploy first if Contentful changed while you were away —
`output: "export"` means content is baked in at build time.

---

## Unresolved: inbound mail

MX is `0 misionessim.org.`, which resolves to `216.198.79.1` — Vercel, which does
not run a mail server. On the face of it, inbound mail to `@misionessim.org` has
had nowhere to land since cutover. The SPF record
(`include:relay.mailchannels.net`) is the Banahosting/MailChannels setup, so mail
was previously handled by the same cPanel account.

**Strong lead, not a confirmed finding.** Port 443 on `216.198.79.1` answers
immediately; port 25 does not answer at all. That is consistent with Vercel
running no mail server — but many consumer ISPs block outbound port 25
specifically, so the test cannot fully distinguish "nothing is listening" from
"my network won't let me ask". The recent removal of `info@misionessim.org` from
the site also suggests the change may have been deliberate.

Ten minutes settles it: send a test message to an `@misionessim.org` address from
an outside account and see whether it lands or bounces.

If mail *is* broken, it is not a rollback problem — it is a live problem, and the
fix is an MX record pointing at the Banahosting mail host rather than at the
apex. A rollback would mask it by coincidence, which is a reason to check now
rather than discover it later.
