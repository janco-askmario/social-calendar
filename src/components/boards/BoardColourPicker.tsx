"use client";

import clsx from "clsx";
import { EVENT_COLOURS } from "@/types";
import type { EventColour } from "@/types";
import { COLOUR_STYLES } from "@/lib/platforms";

/**
 * Same pastel swatches as ColourPicker, plus a "no colour" option (cards can
 * be uncoloured, unlike calendar events which always have a colour).
 */
export function BoardColourPicker({
  value,
  onChange,
}: {
  value: EventColour | null;
  onChange: (c: EventColour | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-label="No colour"
        onClick={() => onChange(null)}
        className={clsx(
          "w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-foreground/40 bg-white transition",
          value === null ? "border-accent scale-110" : "border-black/10"
        )}
      >
        ✕
      </button>
      {EVENT_COLOURS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          onClick={() => onChange(c)}
          className={clsx(
            "w-8 h-8 rounded-full border-2 transition",
            value === c ? "border-accent scale-110" : "border-transparent"
          )}
          style={{ background: COLOUR_STYLES[c].accent }}
        />
      ))}
    </div>
  );
}
