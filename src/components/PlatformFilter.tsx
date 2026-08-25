"use client";

import clsx from "clsx";
import { PLATFORMS } from "@/types";
import type { Platform } from "@/types";
import { PLATFORM_STYLES } from "@/lib/platforms";

export function PlatformFilter({
  selected,
  onToggle,
}: {
  selected: Set<Platform>;
  onToggle: (platform: Platform) => void;
}) {
  return (
    <div>
      <h2 className="text-xs font-bold tracking-wider text-muted uppercase mb-3">Platform</h2>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => {
          const active = selected.has(p);
          const style = PLATFORM_STYLES[p];
          return (
            <button
              key={p}
              onClick={() => onToggle(p)}
              style={active ? { background: style.bg, color: style.text } : undefined}
              className={clsx(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold border transition",
                active ? "border-transparent" : "border-black/10 text-foreground/50 hover:border-black/20"
              )}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}
