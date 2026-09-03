"use client";

import { useCallback, useEffect, useState } from "react";

export interface PinnedBoard {
  id: string;
  name: string;
}

const EVENT_PREFIX = "pinned-board-change:";

function storageKey(scope: string): string {
  return `pinned-board:${scope}`;
}

function read(scope: string): PinnedBoard | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    return raw ? (JSON.parse(raw) as PinnedBoard) : null;
  } catch {
    return null;
  }
}

/**
 * Tracks a single pinned board per scope (basePath - "/app" vs "/demo" -
 * so a demo pin never points the real app's dock at a board that doesn't
 * exist there, or vice versa). Purely a local, per-browser preference, not
 * shared team data, so it lives in localStorage rather than Supabase.
 * Broadcasts a custom event on change so every mounted BottomDock (which
 * may live in a different React tree - calendar, boards list, or an
 * individual board page) picks up the change immediately.
 */
export function usePinnedBoard(scope: string) {
  const [pinned, setPinned] = useState<PinnedBoard | null>(null);
  const eventName = EVENT_PREFIX + scope;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists client-side
    setPinned(read(scope));
    function onChange() {
      setPinned(read(scope));
    }
    window.addEventListener(eventName, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(eventName, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [scope, eventName]);

  const pin = useCallback(
    (board: PinnedBoard) => {
      window.localStorage.setItem(storageKey(scope), JSON.stringify(board));
      window.dispatchEvent(new Event(eventName));
    },
    [scope, eventName]
  );

  const unpin = useCallback(() => {
    window.localStorage.removeItem(storageKey(scope));
    window.dispatchEvent(new Event(eventName));
  }, [scope, eventName]);

  return { pinned, pin, unpin };
}
