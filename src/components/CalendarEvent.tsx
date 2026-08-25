"use client";

import { format } from "date-fns";
import clsx from "clsx";
import type { CalendarEvent as CalendarEventType } from "@/types";
import { COLOUR_STYLES } from "@/lib/platforms";

interface Props {
  event: CalendarEventType;
  onClick: (e: React.MouseEvent) => void;
  onDragPointerDown?: (e: React.PointerEvent) => void;
  isDragging?: boolean;
  variant?: "compact" | "timed";
  style?: React.CSSProperties;
  onResizeStart?: (e: React.PointerEvent) => void;
}

export function CalendarEvent({
  event,
  onClick,
  onDragPointerDown,
  isDragging,
  variant = "compact",
  style,
  onResizeStart,
}: Props) {
  const colours = COLOUR_STYLES[event.colour] ?? COLOUR_STYLES.lavender;

  return (
    <div
      onPointerDown={onDragPointerDown}
      onClick={onClick}
      style={{ background: colours.bg, color: colours.text, ...style }}
      className={clsx(
        "group relative overflow-hidden rounded-xl text-left touch-none",
        "hover:brightness-95 transition",
        isDragging ? "opacity-0" : "cursor-grab active:cursor-grabbing select-none",
        variant === "compact" ? "px-2 py-1 text-[11px] leading-tight" : "px-2.5 py-1.5 text-xs"
      )}
    >
      <div className="pr-2">
        <p className="font-bold truncate">{event.platform}</p>
        <p className="truncate opacity-80">{event.title}</p>
        {variant === "timed" && (
          <p className="opacity-60 text-[10px] mt-0.5">
            {format(new Date(event.start_time), "h:mm a")} – {format(new Date(event.end_time), "h:mm a")}
          </p>
        )}
      </div>
      <span
        className="absolute right-0 top-0 bottom-0 w-1.5"
        style={{ background: colours.accent }}
      />
      {variant === "timed" && onResizeStart && (
        <div
          onPointerDown={onResizeStart}
          className="absolute left-0 right-0 bottom-0 h-2 cursor-ns-resize"
        />
      )}
    </div>
  );
}
