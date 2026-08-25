"use client";

import { format } from "date-fns";
import type { CalendarEvent } from "@/types";
import { COLOUR_STYLES } from "@/lib/platforms";

export function ScheduleList({
  events,
  onSelect,
}: {
  events: CalendarEvent[];
  onSelect: (event: CalendarEvent) => void;
}) {
  const upcoming = [...events]
    .filter((e) => new Date(e.end_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 6);

  return (
    <div>
      <h2 className="text-xs font-bold tracking-wider text-muted uppercase mb-3">Schedule</h2>
      {upcoming.length === 0 ? (
        <p className="text-sm text-muted">Nothing scheduled yet.</p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((event) => {
            const c = COLOUR_STYLES[event.colour] ?? COLOUR_STYLES.lavender;
            return (
              <li key={event.id}>
                <button
                  onClick={() => onSelect(event)}
                  style={{ background: c.bg }}
                  className="w-full flex items-center rounded-2xl overflow-hidden text-left hover:brightness-95 transition"
                >
                  <span className="w-1.5 self-stretch" style={{ background: c.accent }} />
                  <span className="flex-1 px-3 py-2">
                    <span className="block text-sm font-bold" style={{ color: c.text }}>
                      {event.title}
                    </span>
                    <span className="block text-xs opacity-70" style={{ color: c.text }}>
                      {format(new Date(event.start_time), "MMM d, h:mm a")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
