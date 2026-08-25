import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Compute a position value that sorts between `before` and `after` (either
 * end may be undefined for "insert at start/end"). A simple midpoint scheme
 * is enough here - callers re-normalize on demand if positions ever get too
 * close together (not needed at this app's scale).
 */
export function positionBetween(before: number | undefined, after: number | undefined): number {
  if (before === undefined && after === undefined) return 1000;
  if (before === undefined) return after! - 1000;
  if (after === undefined) return before + 1000;
  return (before + after) / 2;
}

/** Positions for a freshly-loaded, already-sorted list of items. */
export function nextPosition(items: { position: number }[]): number {
  if (items.length === 0) return 1000;
  return items[items.length - 1].position + 1000;
}

export function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position);
}

/**
 * Subscribes to postgres_changes INSERT/UPDATE/DELETE for a single table and
 * folds them into React state via `setItems`. Mirrors the pattern used for
 * `events` realtime in src/app/app/page.tsx, generalized so boards/lists/
 * cards/checklist_items don't each hand-roll the same channel wiring.
 */
export function subscribeToTable<Row extends { id: string }>(
  supabase: SupabaseClient<Database>,
  table: string,
  channelName: string,
  setItems: React.Dispatch<React.SetStateAction<Row[]>>,
  options?: { filter?: string; accept?: (row: Row) => boolean }
): RealtimeChannel {
  return supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table, ...(options?.filter ? { filter: options.filter } : {}) },
      (payload) => {
        if (options?.accept) {
          const row = (payload.new ?? payload.old) as Row;
          if (!options.accept(row)) return;
        }
        setItems((prev) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as Row;
            if (prev.some((item) => item.id === row.id)) return prev;
            return [...prev, row];
          }
          if (payload.eventType === "UPDATE") {
            const row = payload.new as Row;
            return prev.map((item) => (item.id === row.id ? row : item));
          }
          if (payload.eventType === "DELETE") {
            const row = payload.old as { id: string };
            return prev.filter((item) => item.id !== row.id);
          }
          return prev;
        });
      }
    )
    .subscribe();
}
