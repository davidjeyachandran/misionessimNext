"use client";

import { useCallback, useState } from "react";
import { VideoLightbox } from "./VideoLightbox";

interface VideoPromoProps {
  /** Heading. Live words this differently per page. */
  title?: string;
  /** Small label above the heading. */
  eyebrow?: string;
  /** Cover image behind the section. */
  backgroundImage?: string;
  /**
   * `background-position` for that image. bg-sim.webp is a tall crop whose
   * subject sits low, hence the 80% default from home.css; the wide banners
   * used on the inner pages want plain centring.
   */
  backgroundPosition?: string;
  /** YouTube video id. */
  videoId?: string;
  /** Accessible name for the lightbox dialog and its iframe. */
  label?: string;
}

// "Conócenos" section + YouTube lightbox (ported from the POC's ElementsKit
// video popup). Client component because it owns the modal state.
//
// The defaults are the homepage's, so `<VideoPromo />` stays the homepage
// section it has always been; app/sirve-con-sim overrides the copy and the
// backdrop rather than duplicating the markup.
export function VideoPromo({
  title = "SIM Latinoamérica, al servicio del movimiento latino",
  eyebrow = "Conócenos",
  backgroundImage = "/home/bg-sim.webp",
  backgroundPosition,
  videoId = "zx8x6J7vPNI",
  label = "SIM Latinoamérica",
}: VideoPromoProps = {}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <section className="video-promo" id="conocenos">
        <div
          className="parallax-bg"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            ...(backgroundPosition ? { backgroundPosition } : {}),
          }}
        />
        <div className="container video-content reveal">
          <p className="eyebrow eyebrow-light">{eyebrow}</p>
          <h2>{title}</h2>
          <button className="btn-video" type="button" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M8 5v14l11-7z" />
            </svg>
            Ver Video
          </button>
        </div>
      </section>

      {open && <VideoLightbox videoId={videoId} label={label} onClose={close} />}
    </>
  );
}
