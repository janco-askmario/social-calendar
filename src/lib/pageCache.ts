"use client";

import { useCallback, useState } from "react";

/**
 * In-memory, per-tab cache keyed by string. Lets a page show its
 * last-known data instantly on remount (e.g. navigating away and back)
 * instead of a blank loading state, while the page's own effect still
 * revalidates from the server in the background. Not persisted across
 * reloads - it's purely to smooth over client-side navigation.
 */
const cache = new Map<string, unknown>();

export function hasCached(key: string): boolean {
  return cache.has(key);
}

export function readCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function writeCached<T>(key: string, value: T): void {
  cache.set(key, value);
}

/**
 * Like useState, but seeded from the cache on first render and kept in
 * sync with it on every update.
 */
export function useCachedState<T>(key: string, initial: T): [T, (updater: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => (cache.has(key) ? (cache.get(key) as T) : initial));

  const setAndCache = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
        cache.set(key, next);
        return next;
      });
    },
    [key]
  );

  return [value, setAndCache];
}
