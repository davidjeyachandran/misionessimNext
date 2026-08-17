"use client";

import { useEffect } from "react";

interface VideoLightboxProps {
  /** YouTube video id, e.g. "zx8x6J7vPNI". */
  videoId: string;
  /** Accessible name for the dialog and the iframe. */
  label: string;
  onClose: () => void;
}

/**
 * Modal YouTube player, shared by the homepage "Conócenos" promo and the
 * Recursos YouTube block. Callers own the trigger and the open state and mount
 * this only while open, so the iframe is created on open and destroyed on
 * close — no hidden iframe phoning home on every page load, which is what
 * live's ElementsKit popup does.
 *
 * Styles live in home.css (.lightbox*), ported from the POC.
 */
export function VideoLightbox({ videoId, label, onClose }: VideoLightboxProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={label}>
      <div className="lightbox-backdrop" onClick={onClose} />
      <div className="lightbox-frame">
        <button
          className="lightbox-close"
          type="button"
          aria-label="Cerrar video"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="lightbox-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={label}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
