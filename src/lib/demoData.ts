import { addDays, setHours, setMinutes } from "date-fns";
import type { CalendarEvent, Profile } from "@/types";

function at(daysFromToday: number, hour: number, minute = 0): Date {
  return setMinutes(setHours(addDays(new Date(), daysFromToday), hour), minute);
}

function iso(d: Date): string {
  return d.toISOString();
}

export function buildDemoEvents(): CalendarEvent[] {
  const now = new Date().toISOString();
  return [
    {
      id: "demo-1",
      title: "Instagram Post",
      description: "Behind-the-Scenes reel from the studio shoot.",
      start_time: iso(at(0, 10)),
      end_time: iso(at(0, 11)),
      colour: "pink",
      platform: "Instagram",
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-2",
      title: "Facebook Campaign",
      description: "Summer sale campaign goes live.",
      start_time: iso(at(2, 9)),
      end_time: iso(at(2, 10, 30)),
      colour: "blue",
      platform: "Facebook",
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-3",
      title: "TikTok Video",
      description: "Quick tips video with the new product line.",
      start_time: iso(at(3, 15)),
      end_time: iso(at(3, 15, 30)),
      colour: "mint",
      platform: "TikTok",
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-4",
      title: "Product Launch",
      description: "Cross-platform launch announcement.",
      start_time: iso(at(5, 8)),
      end_time: iso(at(5, 9)),
      colour: "yellow",
      platform: "LinkedIn",
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-5",
      title: "Newsletter",
      description: "Monthly newsletter teaser post.",
      start_time: iso(at(8, 13)),
      end_time: iso(at(8, 13, 30)),
      colour: "peach",
      platform: "Facebook",
      created_by: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-6",
      title: "Promotional Post",
      description: "Flash discount promo across channels.",
      start_time: iso(at(-1, 16)),
      end_time: iso(at(-1, 17)),
      colour: "purple",
      platform: "LinkedIn",
      created_by: null,
      created_at: now,
      updated_at: now,
    },
  ];
}

export const DEMO_MEMBERS: Pick<Profile, "id" | "name">[] = [
  { id: "m1", name: "Ava Chen" },
  { id: "m2", name: "Liam Torres" },
  { id: "m3", name: "Noor Patel" },
  { id: "m4", name: "Sofia Rossi" },
];
