"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import clsx from "clsx";

type DockTab = "calendar" | "boards";

interface PillRect {
  left: number;
  width: number;
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

function BoardsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M15 4v16" />
    </svg>
  );
}

/**
 * A floating bottom-dock nav (Trello-app style) for switching between the
 * calendar and boards. Same liquid-glass sliding pill mechanics used
 * elsewhere, restyled for a dark floating dock.
 *
 * Two modes:
 *  - Real navigation (default): renders <Link>s to `${basePath}` /
 *    `${basePath}/boards`, for pages that are genuinely separate routes
 *    (e.g. an individual board's detail page).
 *  - Local tab switch: when `onSelect` is provided, clicks call it instead
 *    of navigating - used by the merged calendar/boards shell so switching
 *    is an instant client-side state change with no Next.js navigation (and
 *    therefore no repeat of the auth/approval check on every switch).
 */
export function BottomDock({
  active,
  basePath = "/app",
  onSelect,
}: {
  active: DockTab;
  basePath?: string;
  onSelect?: (tab: DockTab) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Partial<Record<DockTab, HTMLElement | null>>>({});
  const [pill, setPill] = useState<PillRect | null>(null);
  // Portal to document.body: any ancestor with a `transform` (e.g. the
  // page-glide-in mount animation) creates a new containing block for
  // `position: fixed` descendants, which would otherwise anchor this dock
  // to that ancestor's box instead of the actual viewport.
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target only exists client-side
    setMounted(true);
  }, []);

  const items: { value: DockTab; label: string; href: string; Icon: () => React.ReactElement }[] = [
    { value: "calendar", label: "Calendar", href: basePath, Icon: CalendarIcon },
    { value: "boards", label: "Boards", href: `${basePath}/boards`, Icon: BoardsIcon },
  ];

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      const item = itemRefs.current[active];
      if (!container || !item) return;
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      setPill({ left: itemRect.left - containerRect.left, width: itemRect.width });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, mounted]);

  if (!mounted) return null;

  const itemClassName = (value: DockTab) =>
    clsx(
      "relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
      active === value ? "text-white" : "text-white/50 hover:text-white/80"
    );

  return createPortal(
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
      <nav
        ref={containerRef}
        className="relative flex items-center gap-1 rounded-full bg-[#1c1730]/95 backdrop-blur-xl border border-white/10 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.55)] px-2 py-2"
      >
        {pill && (
          <span
            className="liquid-pill liquid-pill-pop absolute top-2 bottom-2 rounded-full"
            style={{ left: pill.left, width: pill.width }}
          />
        )}
        {items.map(({ value, label, href, Icon }) =>
          onSelect ? (
            <button
              key={value}
              type="button"
              ref={(el) => {
                itemRefs.current[value] = el;
              }}
              onClick={() => onSelect(value)}
              className={itemClassName(value)}
            >
              <Icon />
              {label}
            </button>
          ) : (
            <Link
              key={value}
              href={href}
              ref={(el) => {
                itemRefs.current[value] = el;
              }}
              className={itemClassName(value)}
            >
              <Icon />
              {label}
            </Link>
          )
        )}
      </nav>
    </div>,
    document.body
  );
}
