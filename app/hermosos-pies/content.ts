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

/** "Oportunidades SIM" WhatsApp group (the same one Sirve con SIM links to). */
export { WHATSAPP_URL as WHATSAPP_GROUP_URL } from "../sirve-con-sim/contact";

/** Where "Descárgalo aquí" points — the PDF or a landing link. */
export const GUIDE_URL: string | null =
  "https://movilicemos.org/sites/default/files/recursos/2026/Devocional-CHSP-SIM_2026.pdf";

export interface CampaignVideo {
  title: string;
  /** YouTube video id. */
  youtubeId?: string;
  still?: { src: string; alt: string; width: number; height: number };
}

/** The three "Conversaciones con Yurani, Carolina y Gio" videos. */
export const VIDEOS: CampaignVideo[] = [
  {
    title: "Aprendizajes de latinas sirviendo en África, Europa y Asia",
    youtubeId: "w4JggP4mXa0",
    still: { src: "/hermosos-pies/video-1.webp", alt: "", width: 640, height: 360 },
  },
  {
    title: "Nunca es demasiado pronto ni demasiado tarde en la misión de Dios",
    youtubeId: "VjKsHZ_cWu8",
    still: { src: "/hermosos-pies/video-2.webp", alt: "", width: 640, height: 360 },
  },
  {
    title: "Cuando obedecer a Dios significa dejarlo todo",
    youtubeId: "yc0Q5urabGE",
    still: { src: "/hermosos-pies/video-3.webp", alt: "", width: 640, height: 360 },
  },
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
