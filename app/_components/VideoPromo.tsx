"use client";

import { useCallback, useState } from "react";
import { VideoLightbox } from "./VideoLightbox";

const VIDEO_ID = "zx8x6J7vPNI";

// "Conócenos" parallax section + YouTube lightbox (ported from the POC's
// ElementsKit video popup). Client component because it owns the modal state.
export function VideoPromo() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <section className="video-promo" id="conocenos">
        <div
          className="parallax-bg"
          style={{ backgroundImage: "url('/home/bg-sim.webp')" }}
        />
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
        <VideoLightbox videoId={VIDEO_ID} label="SIM Latinoamérica" onClose={close} />
      )}
    </>
  );
}
