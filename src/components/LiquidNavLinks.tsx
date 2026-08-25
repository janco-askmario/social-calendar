"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

interface PillRect {
  left: number;
  width: number;
}

/**
 * Like LiquidPillTabs, but for real <Link> navigation instead of local
 * state. Since each destination is a separate page (the component remounts
 * on navigation rather than continuously animating), the pill measures its
 * position on mount and "pops" into place with the same liquid-glass
 * treatment, keeping the visual language consistent with the toolbar's
 * sliding segmented control even though the motion itself can't glide
 * across a full page swap.
 */
export function LiquidNavLinks<T extends string>({
  items,
  active,
}: {
  items: { value: T; label: string; href: string }[];
  active: T;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Partial<Record<T, HTMLAnchorElement | null>>>({});
  const [pill, setPill] = useState<PillRect | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      const link = linkRefs.current[active];
      if (!container || !link) return;
      const containerRect = container.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      setPill({ left: linkRect.left - containerRect.left, width: linkRect.width });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, items]);

  return (
    <nav ref={containerRef} className="relative flex items-center gap-1 bg-black/[0.03] rounded-full p-1">
      {pill && (
        <span
          className="liquid-pill liquid-pill-pop absolute top-1 bottom-1 rounded-full"
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {items.map((item) => (
        <Link
          key={item.value}
          href={item.href}
          ref={(el) => {
            linkRefs.current[item.value] = el;
          }}
          className={clsx(
            "relative z-10 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200",
            active === item.value ? "text-white" : "text-foreground/60 hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
