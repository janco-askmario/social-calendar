"use client";

import type { CalendarView } from "@/types";
import { formatToolbarLabel } from "@/lib/calendar";
import { LiquidPillTabs } from "@/components/LiquidPillTabs";

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
];

export function CalendarToolbar({
  view,
  anchor,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onAdd,
}: {
  view: CalendarView;
  anchor: Date;
  onViewChange: (v: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <LiquidPillTabs items={VIEWS} value={view} onChange={onViewChange} />

      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          aria-label="Previous"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-foreground/60"
        >
          ‹
        </button>
        <span className="text-lg font-bold text-foreground min-w-[160px] text-center">
          {formatToolbarLabel(anchor, view)}
        </span>
        <button
          onClick={onNext}
          aria-label="Next"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-foreground/60"
        >
          ›
        </button>
        <button
          onClick={onToday}
          className="text-sm font-semibold text-accent hover:text-accent-2 px-2"
        >
          Today
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onAdd}
          className="btn-spring rounded-xl bg-accent text-white font-semibold text-sm px-4 py-2 hover:bg-accent-2"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
