"use client";

import clsx from "clsx";
import type { Card, ChecklistItem } from "@/types";
import { COLOUR_STYLES } from "@/lib/platforms";

export function TrelloCard({
  card,
  checklist,
  isDragging,
  onClick,
  onDragPointerDown,
}: {
  card: Card;
  checklist: ChecklistItem[];
  isDragging?: boolean;
  onClick: () => void;
  onDragPointerDown: (e: React.PointerEvent) => void;
}) {
  const colours = card.colour ? COLOUR_STYLES[card.colour] : null;
  const checkedCount = checklist.filter((i) => i.is_checked).length;

  return (
    <div
      onPointerDown={onDragPointerDown}
      onClick={onClick}
      style={colours ? { background: colours.accent } : undefined}
      className={clsx(
        "group rounded-xl border border-black/5 shadow-sm hover:shadow-md transition text-left touch-none select-none overflow-hidden",
        !colours && "bg-white",
        isDragging ? "opacity-0" : "cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="px-3 py-2.5">
        <p
          className={clsx(
            "text-sm font-semibold break-words",
            colours ? "text-white" : "text-foreground",
            card.is_done && (colours ? "line-through text-white/60" : "line-through text-foreground/40")
          )}
        >
          {card.title}
        </p>
        {(checklist.length > 0 || card.is_done) && (
          <div className="mt-2 flex items-center gap-2">
            {card.is_done && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full text-[10px] font-bold px-2 py-0.5",
                  colours ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"
                )}
              >
                ✓ Done
              </span>
            )}
            {checklist.length > 0 && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full text-[10px] font-bold px-2 py-0.5",
                  colours
                    ? "bg-white/20 text-white"
                    : checkedCount === checklist.length
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-black/[0.04] text-foreground/60"
                )}
              >
                ☑ {checkedCount}/{checklist.length}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
