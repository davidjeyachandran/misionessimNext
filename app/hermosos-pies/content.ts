import type { SpotifyEpisode } from "../_components/SpotifyEpisodes";

/*
 * Everything the "Cuán hermosos son los pies" campaign page shows that is
 * still waiting on SIM lives here, so filling a gap is a one-line edit with no
 * component changes: each optional field renders the real thing when set and
 * a marked placeholder when it isn't. Plan: docs/plan-campana-cuan-hermosos.md.
 */

/** Cover image of the 30-day prayer guide (design: "MOCKUP LIBRO"). */
export const GUIDE_COVER: { src: string; alt: string; width: number; height: number } | null = {
  src: "/hermosos-pies/guia-30-dias.webp",
  alt: "Portada de la guía «30 días orando por latinos en misión» en una tableta",
  width: 875,
  height: 1100,
};

/** SIM Latinoamérica's WhatsApp channel. */
export const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb5w2PzJUM2hE0Ci061b";

/** Where "Descárgalo aquí" points — the PDF or a landing link. */
export const GUIDE_URL: string | null = null;

export interface CampaignVideo {
  title: string;
  /** YouTube video id. The host isn't confirmed yet (YouTube is the guess). */
  youtubeId?: string;
  still?: { src: string; alt: string; width: number; height: number };
}

/** The three "Conversaciones con Yurani, Carolina y Gio" videos. */
export const VIDEOS: CampaignVideo[] = [
  { title: "Video 1" },
  { title: "Video 2" },
  { title: "Video 3" },
];

/**
 * The design's podcast cards are a screenshot of the /recursos podcast band,
 * so these are those same three episodes (ids from app/recursos/page.tsx),
 * standing in until the campaign's own episodes are confirmed.
 */
export const EPISODES: SpotifyEpisode[] = [
  { id: "2CP1iLYpS7qyBC2MXYR3Ym", title: "Revista Soy Influencer para el Reino - Parte 1" },
  { id: "54NEkbbfNuk0vGxpv7XH50", title: "Latina levantando fondos entre latinos" },
  {
    id: "7r8olcw377DXeQV6HkH5V1",
    title: "Una respuesta bíblica sobre la pobreza urbana por Zacarías Powell",
  },
];
