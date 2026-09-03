"use client";

import Script from "next/script";

/**
 * gtag.js, deferred until after the window `load` event.
 *
 * `@next/third-parties`' <GoogleAnalytics> gives next/script no `strategy`, so
 * it takes the `afterInteractive` default — and that emits a
 * `<link rel="preload" as="script">`. Chrome honours the preload as a *High*
 * priority fetch, so 188KB of gtag.js was being pulled down ahead of the 40KB
 * LCP hero image (which, lacking a priority hint, Chrome had ranked Low). On
 * an article page that was the single largest item on the network.
 *
 * `lazyOnload` is the one strategy next/script never preloads — its
 * `ReactDOM.preload` calls cover only `beforeInteractive` and
 * `afterInteractive` — and it waits for idle after load, which puts gtag.js
 * wholly outside the LCP window.
 *
 * Route changes are still counted by GA4's enhanced measurement ("page changes
 * based on browser history events"), since this fires `config` only once on
 * mount — that setting has to stay on in the property or an SPA navigation
 * goes uncounted.
 */
export function Analytics({ gaId }: { gaId: string }) {
  return (
    <>
      {/* Defines `gtag` and queues `js`/`config` onto dataLayer. gtag.js drains
          that queue whenever it arrives, so the two are order-independent. */}
      <Script
        id="ga-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
        }}
      />
      <Script
        id="ga-loader"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
    </>
  );
}
