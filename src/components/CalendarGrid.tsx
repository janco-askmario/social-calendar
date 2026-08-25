"use client";

import { useState } from "react";
import { format, setHours, setMinutes, differenceInMinutes, addMinutes } from "date-fns";
import clsx from "clsx";
import type { CalendarEvent as CalendarEventType, CalendarView } from "@/types";
import { getMonthGridDays, getWeekDays, isCurrentMonth as isCurrentMonthFn, isToday as isTodayFn, eventsForDay, WEEKDAY_LABELS } from "@/lib/calendar";
import { CalendarDay } from "@/components/CalendarDay";
import { CalendarEvent } from "@/components/CalendarEvent";
import { useDragGhost } from "@/lib/useDragGhost";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 56;

function findDayCell(clientX: number, clientY: number) {
  return document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-day-cell]") ?? null;
}

export function CalendarGrid({
  view,
  anchor,
  events,
  onSelectEvent,
  onCreateAt,
  onReschedule,
  onResize,
}: {
  view: CalendarView;
  anchor: Date;
  events: CalendarEventType[];
  onSelectEvent: (event: CalendarEventType) => void;
  onCreateAt: (date: Date) => void;
  onReschedule: (id: string, start: Date, end: Date) => void;
  onResize: (id: string, end: Date) => void;
}) {
  const [hoverDay, setHoverDay] = useState<string | null>(null);

  const monthDrag = useDragGhost({
    onDragMove: (x, y) => setHoverDay(findDayCell(x, y)?.dataset.day ?? null),
    onDrop: (id, x, y) => {
      setHoverDay(null);
      const cell = findDayCell(x, y);
      if (!cell) return;
      const day = new Date(cell.dataset.day!);
      const event = events.find((e) => e.id === id);
      if (!event) return;
      const oldStart = new Date(event.start_time);
      const oldEnd = new Date(event.end_time);
      const durationMs = oldEnd.getTime() - oldStart.getTime();
      const newStart = setMinutes(setHours(day, oldStart.getHours()), oldStart.getMinutes());
      const newEnd = new Date(newStart.getTime() + durationMs);
      onReschedule(id, newStart, newEnd);
    },
  });

  if (view === "month") {
    const days = getMonthGridDays(anchor);
    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-center text-[11px] font-semibold tracking-wider text-muted py-1">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 flex-1">
          {days.map((day) => (
            <CalendarDay
              key={day.toISOString()}
              day={day}
              events={eventsForDay(events, day)}
              isCurrentMonth={isCurrentMonthFn(day, anchor)}
              isToday={isTodayFn(day)}
              onSelectEvent={onSelectEvent}
              onCreate={onCreateAt}
              draggingId={monthDrag.draggingId}
              isDropTarget={hoverDay === day.toISOString()}
              onCardPointerDown={monthDrag.onPointerDown}
            />
          ))}
        </div>
      </div>
    );
  }

  const days = view === "week" ? getWeekDays(anchor) : [anchor];

  return (
    <TimeGrid
      days={days}
      events={events}
      onSelectEvent={onSelectEvent}
      onCreateAt={onCreateAt}
      onReschedule={onReschedule}
      onResize={onResize}
    />
  );
}

function TimeGrid({
  days,
  events,
  onSelectEvent,
  onCreateAt,
  onReschedule,
  onResize,
}: {
  days: Date[];
  events: CalendarEventType[];
  onSelectEvent: (event: CalendarEventType) => void;
  onCreateAt: (date: Date) => void;
  onReschedule: (id: string, start: Date, end: Date) => void;
  onResize: (id: string, end: Date) => void;
}) {
  const [hoverDay, setHoverDay] = useState<string | null>(null);

  const timeDrag = useDragGhost({
    onDragMove: (x, y) => setHoverDay(findDayCell(x, y)?.dataset.day ?? null),
    onDrop: (id, x, y) => {
      setHoverDay(null);
      const cell = findDayCell(x, y);
      if (!cell) return;
      const day = new Date(cell.dataset.day!);
      const rect = cell.getBoundingClientRect();
      const offsetY = y - rect.top;
      const hour = Math.max(0, Math.min(23, Math.floor(offsetY / HOUR_HEIGHT)));
      const event = events.find((ev) => ev.id === id);
      if (!event) return;
      const durationMs = new Date(event.end_time).getTime() - new Date(event.start_time).getTime();
      const newStart = setMinutes(setHours(day, hour), 0);
      const newEnd = new Date(newStart.getTime() + durationMs);
      onReschedule(id, newStart, newEnd);
    },
  });

  function handleResizeStart(e: React.PointerEvent, event: CalendarEventType) {
    e.stopPropagation();
    e.preventDefault();

    function suppressClick(clickEvent: MouseEvent) {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();
    }

    function handleUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", handleUp);
      // The browser fires a synthetic "click" right after this pointerup,
      // targeting whatever element is under the cursor (an hour cell, since
      // resizing moved the pointer away from where it started). Swallow that
      // one click so it can't open the "create event" modal.
      window.addEventListener("click", suppressClick, { capture: true, once: true });
    }
    function onMove(moveEvent: PointerEvent) {
      const deltaY = moveEvent.clientY - e.clientY;
      const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15;
      const newEnd = addMinutes(new Date(event.end_time), deltaMinutes);
      const minEnd = addMinutes(new Date(event.start_time), 15);
      onResize(event.id, newEnd < minEnd ? minEnd : newEnd);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
        <div />
        {days.map((day) => (
          <div key={day.toISOString()} className="text-center pb-2">
            <p className="text-[11px] font-semibold tracking-wider text-muted">{format(day, "EEE")}</p>
            <p
              className={clsx(
                "inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-bold mt-1",
                isTodayFn(day) ? "bg-accent text-white" : "text-foreground"
              )}
            >
              {format(day, "d")}
            </p>
          </div>
        ))}
      </div>

      <div className="grid flex-1" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
        <div>
          {HOURS.map((h) => (
            <div key={h} style={{ height: HOUR_HEIGHT }} className="text-[10px] text-muted text-right pr-2 -translate-y-2">
              {h === 0 ? "" : format(setHours(new Date(), h), "h a")}
            </div>
          ))}
        </div>
        {days.map((day) => {
          const dayEvents = eventsForDay(events, day);
          return (
            <div
              key={day.toISOString()}
              data-day-cell
              data-day={day.toISOString()}
              className={clsx(
                "relative border-l border-black/5 transition-colors",
                hoverDay === day.toISOString() && "bg-accent/5"
              )}
            >
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR_HEIGHT }}
                  className="border-t border-black/5 hover:bg-accent/5 cursor-pointer"
                  onClick={() => onCreateAt(setMinutes(setHours(day, h), 0))}
                />
              ))}

              {dayEvents.map((event) => {
                const start = new Date(event.start_time);
                const end = new Date(event.end_time);
                const top = (start.getHours() + start.getMinutes() / 60) * HOUR_HEIGHT;
                const height = Math.max(20, (differenceInMinutes(end, start) / 60) * HOUR_HEIGHT);
                return (
                  <div
                    key={event.id}
                    className="absolute left-1 right-1"
                    style={{ top, height }}
                  >
                    <CalendarEvent
                      event={event}
                      variant="timed"
                      isDragging={event.id === timeDrag.draggingId}
                      onDragPointerDown={(e) => timeDrag.onPointerDown(e, event.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      onResizeStart={(e) => handleResizeStart(e, event)}
                      style={{ height: "100%" }}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
