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
    // Same math as jarallax (used by ElementsKit on the live site) with
    // speed 0.8: the layer is barely taller than its section and drifts at
    // 0.8x scroll speed, staying centered on the viewport. Layers without
    // data-parallax (video-promo, revista) stay static covers, as in the POC.
    const layers = Array.from(
      document.querySelectorAll<HTMLElement>(".parallax-bg[data-parallax]"),
    );
    let ticking = false;

    function sizeParallax() {
      const vh = window.innerHeight;
      layers.forEach((layer) => {
        const parent = layer.parentElement;
        if (!parent) return;
        const speed = parseFloat(layer.dataset.parallax ?? "") || 0.8;
        const contH = parent.getBoundingClientRect().height;
        const bgH = contH + Math.abs(vh - contH) * (1 - speed);
        layer.style.height = bgH.toFixed(1) + "px";
        layer.style.marginTop = ((vh - bgH) / 2).toFixed(1) + "px";
      });
    }

    function updateParallax() {
      ticking = false;
      const vh = window.innerHeight;
      layers.forEach((layer) => {
        const parent = layer.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        const speed = parseFloat(layer.dataset.parallax ?? "") || 0.8;
        const scrollDist = (speed * (rect.height + vh)) / 2;
        const fromViewportCenter =
          1 - 2 * ((vh - rect.top) / (vh + rect.height));
        const y = scrollDist * fromViewportCenter - rect.top;
        layer.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
      });
    }

    function requestParallax() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateParallax);
      }
    }

    function relayoutParallax() {
      sizeParallax();
      updateParallax();
    }

    if (!reducedMotion && layers.length) {
      window.addEventListener("scroll", requestParallax, { passive: true });
      window.addEventListener("resize", relayoutParallax);
      window.addEventListener("load", relayoutParallax);
      relayoutParallax();
    }

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", requestParallax);
      window.removeEventListener("resize", relayoutParallax);
      window.removeEventListener("load", relayoutParallax);
    };
  }, []);

  return null;
}
