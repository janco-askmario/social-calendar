"use client";

import { EVENT_COLOURS } from "@/types";
import type { EventColour } from "@/types";
import { COLOUR_STYLES } from "@/lib/platforms";
import clsx from "clsx";

export function ColourPicker({
  value,
  onChange,
}: {
  value: EventColour;
  onChange: (c: EventColour) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
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
