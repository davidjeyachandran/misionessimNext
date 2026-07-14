"use client";

import { useEffect, useState } from "react";

const VIDEO_ID = "zx8x6J7vPNI";

// "Conócenos" parallax section + YouTube lightbox (ported from the POC's
// ElementsKit video popup). Client component because it owns the modal state.
export function VideoPromo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <section className="video-promo" id="conocenos">
        <div
          className="parallax-bg"
          data-parallax="0.3"
          style={{ backgroundImage: "url('/home/bg-sim.webp')" }}
        />
        <div className="video-overlay" />
        <div className="container video-content reveal">
          <p className="eyebrow eyebrow-light">Conócenos</p>
          <h2>SIM Latinoamérica, al servicio del movimiento latino</h2>
          <button className="btn-video" type="button" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M8 5v14l11-7z" />
            </svg>
            Ver Video
          </button>
        </div>
      </section>

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Video">
          <div className="lightbox-backdrop" onClick={() => setOpen(false)} />
          <div className="lightbox-frame">
            <button
              className="lightbox-close"
              type="button"
              aria-label="Cerrar video"
              onClick={() => setOpen(false)}
            >
              &times;
            </button>
            <div className="lightbox-video">
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
                title="SIM Latinoamérica"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
