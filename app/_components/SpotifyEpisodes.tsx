export interface SpotifyEpisode {
  /** Episode id, the last segment of a Spotify episode share URL. */
  id: string;
  /** Only used for the iframe's accessible name — Spotify renders its own. */
  title: string;
}

interface SpotifyEpisodesProps {
  episodes: SpotifyEpisode[];
  /** Extra classes for the grid, e.g. its top margin. */
  className?: string;
}

/*
 * Grid of Spotify episode players (live: the podcast band on /recursos and the
 * Audiorevista band on /revistavamos, both hand-pasted Elementor HTML widgets).
 *
 * Live's embeds carry no title, so a screen reader announces a row of
 * unlabelled frames, and they drifted apart between bands — some carry a
 * `theme=0` that flattens them to Spotify's neutral dark while the rest tint
 * from the cover art, and some a `?utm_source=generator`. One component keeps
 * every player on the site identical.
 *
 * The players are third-party iframes worth ~1MB each once they boot, and both
 * bands sit near the bottom of a long page, so they stay `loading="lazy"`:
 * nothing is fetched from Spotify until the reader is nearly on top of them.
 */
export function SpotifyEpisodes({ episodes, className = "" }: SpotifyEpisodesProps) {
  return (
    <ul className={`grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 ${className}`}>
      {episodes.map((episode) => (
        <li key={episode.id}>
          <iframe
            src={`https://open.spotify.com/embed/episode/${episode.id}`}
            title={`Reproductor de Spotify: ${episode.title}`}
            width="100%"
            height="152"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="block w-full rounded-xl"
          />
        </li>
      ))}
    </ul>
  );
}
