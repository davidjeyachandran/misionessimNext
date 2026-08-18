"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { VideoLightbox } from "./VideoLightbox";

interface VideoThumbnailProps {
  image: { src: string; alt: string; width: number; height: number };
  /** YouTube video id opened in the lightbox. */
  videoId: string;
  /** Accessible name for both the play button and the dialog. */
  label: string;
  /** Extra classes for the wrapper, e.g. the homepage's `reveal`. */
  className?: string;
  /** `sizes` for the still, since the block is half-width on some pages. */
  sizes?: string;
}

/*
 * Still image with a play button that opens the video in a lightbox
 * (live: an ElementsKit video widget absolutely positioned over the still —
 * .elementor-element-558cc0f on /recursos, .elementor-element-8d28699 in the
 * homepage's YouTube promo).
 *
 * Live's trigger is an <a href="https://www.youtube.com/embed/…"> labelled
 * "video-popup", so without JS it navigates to a bare embed URL and with a
 * screen reader it announces nothing useful. This is a <button> named after
 * the video it plays, which is what it actually does.
 */
export function VideoThumbnail({
  image,
  videoId,
  label,
  className = "",
  sizes = "(min-width: 768px) 50vw, 92vw",
}: VideoThumbnailProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className={`relative ${className}`.trim()}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        unoptimized
        sizes={sizes}
        className="w-full rounded-2xl object-cover"
      />
      {/* Live pins the button 30px from the image's top-left corner, where it
          lands on a participant's face — an absolute-positioned widget that was
          never moved. Centred here, which is where a play affordance belongs. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Reproducir video: ${label}`}
        /* the white ring is live's (1px solid #fff); without it the translucent
           disc disappears into a light still, as it does on the YouTube promo */
        className="absolute left-1/2 top-1/2 grid h-[82px] w-[82px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/90 bg-white/20 text-white shadow-lg transition-colors hover:bg-white hover:text-brand focus-visible:bg-white focus-visible:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-white/25 motion-safe:animate-ping"
        />
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="relative">
          <path fill="currentColor" d="M8 5v14l11-7z" />
        </svg>
      </button>

      {open && <VideoLightbox videoId={videoId} label={label} onClose={close} />}
    </div>
  );
}
