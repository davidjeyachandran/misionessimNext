"use client";

import { useEffect } from "react";

// Progressive enhancement ported from poc/js/main.js: parallax backgrounds and
// scroll-reveal. Renders nothing; attaches listeners to the server-rendered
// .parallax-bg / .reveal nodes on mount. Respects prefers-reduced-motion.
export function ScrollEffects() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- Scroll-reveal ----
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    let io: IntersectionObserver | undefined;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("visible"));
    } else {
      // Content is visible by default (see home.css); the hide+animate styles
      // only apply under html.js-anim, so nothing is hidden without JS or
      // before hydration. Above-fold elements (the hero title) fade in right
      // after mount: the observer fires immediately for them.
      document.documentElement.classList.add("js-anim");
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              io?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
      );
      revealEls.forEach((el) => io!.observe(el));
    }

    // ---- Parallax ----
    // Drift rate matches jarallax (ElementsKit on the live site) at speed 0.8:
    // the layer travels (1 - speed) of the distance the section travels. Only
    // `transform` is ever written — the layer's size and resting position come
    // from CSS (.parallax-bg[data-parallax] slack in home.css), and the offset
    // is anchored so it's 0 at scrollY 0. That way the first frame this script
    // paints is identical to the server-rendered one, with no jump or rescale
    // when it takes over. Layers without data-parallax (video-promo, revista)
    // stay static covers, as in the POC.
    const layers = Array.from(
      document.querySelectorAll<HTMLElement>(".parallax-bg[data-parallax]"),
    );
    let ticking = false;

    function updateParallax() {
      ticking = false;
      const vh = window.innerHeight;
      layers.forEach((layer) => {
        const parent = layer.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        const span = vh + rect.height;
        if (span <= 0) return;
        const speed = parseFloat(layer.dataset.parallax ?? "") || 0.8;
        // progress: 0 when the section's top edge sits at the viewport bottom,
        // 1 when its bottom edge sits at the viewport top.
        const progress = (vh - rect.top) / span;
        // The same progress at scrollY 0 — rect.top + scrollY is the section's
        // fixed document offset, so this is scroll-invariant.
        const atPageTop = (vh - (rect.top + window.scrollY)) / span;
        const y = (1 - speed) * span * (progress - atPageTop);
        layer.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
      });
    }

    function requestParallax() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateParallax);
      }
    }

    if (!reducedMotion && layers.length) {
      window.addEventListener("scroll", requestParallax, { passive: true });
      window.addEventListener("resize", updateParallax);
      // Re-run once images/fonts settle, in case the section's height changed.
      window.addEventListener("load", updateParallax);
      updateParallax();
    }

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", requestParallax);
      window.removeEventListener("resize", updateParallax);
      window.removeEventListener("load", updateParallax);
    };
  }, []);

  return null;
}
