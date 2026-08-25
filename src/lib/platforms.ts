import type { EventColour, Platform } from "@/types";

// Pastel palette per the visual spec: soft lavender, pink, peach, yellow, mint, blue, purple.
// Dark text is used on top of every swatch for readability.
export const COLOUR_STYLES: Record<
  EventColour,
  { bg: string; accent: string; text: string; pillBg: string; pillText: string }
> = {
  lavender: {
    bg: "#E7E3FB",
    accent: "#B7A9F0",
    text: "#4B3F8A",
    pillBg: "#EDE9FD",
    pillText: "#6C5CE7",
  },
  pink: {
    bg: "#FBE3EE",
    accent: "#F0A9CE",
    text: "#8A3F6C",
    pillBg: "#FDE9F3",
    pillText: "#D6478F",
  },
  peach: {
    bg: "#FCE7DC",
    accent: "#F3B893",
    text: "#8A4F2E",
    pillBg: "#FDEEE4",
    pillText: "#D97845",
  },
  yellow: {
    bg: "#FBF3D3",
    accent: "#EBD772",
    text: "#7A6A1B",
    pillBg: "#FCF6DF",
    pillText: "#B79B15",
  },
  mint: {
    bg: "#DCF3E8",
    accent: "#93D9B8",
    text: "#296B4B",
    pillBg: "#E6F7EE",
    pillText: "#289461",
  },
  blue: {
    bg: "#DCEBFB",
    accent: "#93C3EE",
    text: "#25507F",
    pillBg: "#E6F1FD",
    pillText: "#2D77C2",
  },
  purple: {
    bg: "#EBE0FA",
    accent: "#C6A6EF",
    text: "#5B2E8A",
    pillBg: "#F1E7FD",
    pillText: "#8C4FDB",
  },
};

export const PLATFORM_COLOUR: Record<Platform, EventColour> = {
  Instagram: "pink",
  Facebook: "blue",
  TikTok: "mint",
  LinkedIn: "lavender",
};

export const PLATFORM_STYLES: Record<Platform, { bg: string; text: string }> = {
  Instagram: { bg: "#FBE3EE", text: "#D6478F" },
  Facebook: { bg: "#DCEBFB", text: "#2D77C2" },
  TikTok: { bg: "#DCF3E8", text: "#289461" },
  LinkedIn: { bg: "#EBE3FB", text: "#6C5CE7" },
};
