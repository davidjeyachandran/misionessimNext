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
    const layers = Array.from(document.querySelectorAll<HTMLElement>(".parallax-bg"));
    let ticking = false;

    function updateParallax() {
      ticking = false;
      const vh = window.innerHeight;
      layers.forEach((layer) => {
        const parent = layer.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const speed = parseFloat(layer.dataset.parallax ?? "0.3") || 0.3;
        const progress =
          (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        layer.style.transform = `translate3d(0,${(-progress * speed * rect.height / 2).toFixed(1)}px,0)`;
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
      window.addEventListener("resize", requestParallax);
      updateParallax();
    }

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", requestParallax);
      window.removeEventListener("resize", requestParallax);
    };
  }, []);

  return null;
}
