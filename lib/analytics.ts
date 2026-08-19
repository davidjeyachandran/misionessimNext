/**
 * Google Analytics 4 for misionessim.org. This is the same measurement ID the
 * old WordPress site reported to (MonsterInsights), so the history stays
 * continuous across the migration rather than starting from zero.
 *
 * `NEXT_PUBLIC_` means the value is inlined at build time and a change needs a
 * redeploy. The ID is not a secret — it ships in the page HTML and is public by
 * design on every GA install.
 *
 * Blank means analytics is off. That is the default in local dev and on any
 * deploy where the variable is not set, which is what keeps development and
 * preview traffic out of the property.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

/**
 * Read by both the root layout (whether to load gtag.js) and the privacy
 * policy (whether to describe cookies at all). Sharing one flag is deliberate:
 * it makes it impossible to ship a policy that claims tracking the site is not
 * doing, or to ship tracking the policy does not disclose.
 */
export const ANALYTICS_ENABLED = GA_MEASUREMENT_ID !== "";

/**
 * Stated verbatim in the privacy policy, so it MUST match GA4 Admin → Data
 * collection and modification → Data retention. The free tier offers 2 or 14
 * months; change one side without the other and the policy becomes false.
 */
export const ANALYTICS_RETENTION_MONTHS = 14;
