"use client";

import { useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";

interface PillRect {
  left: number;
  width: number;
}

/**
 * A segmented control whose active state is a translucent, blurred,
 * accent-gradient "liquid glass" pill that glides between options rather
 * than snapping. Measures the active button's DOM position on every change
 * (and on resize) and animates the pill to match via CSS transitions.
 */
export function LiquidPillTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Partial<Record<T, HTMLButtonElement | null>>>({});
  const [pill, setPill] = useState<PillRect | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      const button = buttonRefs.current[value];
      if (!container || !button) return;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      setPill({ left: buttonRect.left - containerRect.left, width: buttonRect.width });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [value, items]);

  return (
    <div
      ref={containerRef}
      className={clsx("relative inline-flex items-center gap-1 bg-black/[0.03] rounded-xl p-1", className)}
    >
      {pill && (
        <span
          className="liquid-pill liquid-pill-pop absolute top-1 bottom-1 rounded-lg"
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {items.map((item) => (
        <button
          key={item.value}
          ref={(el) => {
            buttonRefs.current[item.value] = el;
          }}
          onClick={() => onChange(item.value)}
          className={clsx(
            "relative z-10 px-3.5 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors duration-200",
            value === item.value ? "text-white" : "text-foreground/60 hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
