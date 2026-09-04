"use client";

import { format } from "date-fns";
import clsx from "clsx";
import type { CalendarEvent as CalendarEventType } from "@/types";
import { CalendarEvent } from "@/components/CalendarEvent";

const MAX_VISIBLE = 3;

export function CalendarDay({
  day,
  events,
  isCurrentMonth,
  isToday,
  onSelectEvent,
  onCreate,
  draggingId,
  isDropTarget,
  onCardPointerDown,
}: {
  day: Date;
  events: CalendarEventType[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onSelectEvent: (event: CalendarEventType) => void;
  onCreate: (day: Date) => void;
  draggingId: string | null;
  isDropTarget: boolean;
  onCardPointerDown: (e: React.PointerEvent, id: string) => void;
}) {
  const visible = events.slice(0, MAX_VISIBLE);
  const overflow = events.length - visible.length;

  return (
    <div
      data-day-cell
      data-day={day.toISOString()}
      onClick={() => onCreate(day)}
      className={clsx(
        "btn-spring rounded-2xl p-2 flex flex-col gap-1 min-h-[100px] transition-all border cursor-pointer",
        "hover:border-accent/30 hover:shadow-[0_6px_16px_-8px_rgba(124,92,240,0.35)] hover:-translate-y-0.5",
        isCurrentMonth ? "bg-white" : "bg-black/[0.02] text-foreground/40",
        isToday ? "border-accent/50" : "border-transparent",
        isDropTarget && "ring-2 ring-accent/40 scale-[1.02]"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
            isToday ? "bg-accent text-white" : "text-foreground/60"
          )}
        >
          {format(day, "d")}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {visible.map((event) => (
          <CalendarEvent
            key={event.id}
            event={event}
            isDragging={event.id === draggingId}
            onDragPointerDown={(e) => onCardPointerDown(e, event.id)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectEvent(event);
            }}
          />
        ))}
        {overflow > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (visible[0]) onSelectEvent(visible[0]);
            }}
            className="text-[11px] font-semibold text-muted text-left px-1"
          >
            +{overflow} more
          </button>
        )}
      </div>
    </div>
  );
}
