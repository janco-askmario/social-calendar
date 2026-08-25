export type Platform = "Instagram" | "Facebook" | "TikTok" | "LinkedIn";

export const PLATFORMS: Platform[] = ["Instagram", "Facebook", "TikTok", "LinkedIn"];

export type EventColour =
  | "lavender"
  | "pink"
  | "peach"
  | "yellow"
  | "mint"
  | "blue"
  | "purple";

export const EVENT_COLOURS: EventColour[] = [
  "lavender",
  "pink",
  "peach",
  "yellow",
  "mint",
  "blue",
  "purple",
];

export interface Profile {
  id: string;
  name: string;
  email: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string; // ISO timestamptz
  end_time: string; // ISO timestamptz
  colour: EventColour;
  platform: Platform;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type CalendarView = "month" | "week" | "day";

// Default colour per platform, used when creating a new event
export const PLATFORM_DEFAULT_COLOUR: Record<Platform, EventColour> = {
  Instagram: "pink",
  Facebook: "blue",
  TikTok: "mint",
  LinkedIn: "lavender",
};

// ---------------------------------------------------------------------------
// Boards (Trello-style)
// ---------------------------------------------------------------------------

export interface Board {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  colour: EventColour | null;
  position: number;
  is_done: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  card_id: string;
  text: string;
  is_checked: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}
