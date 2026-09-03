"use client";

import { useState } from "react";
import { CalendarShell } from "@/components/CalendarShell";
import { BoardsShell } from "@/components/boards/BoardsShell";
import type { EventFormValues } from "@/components/EventForm";
import type { Board, Card, CalendarEvent, List, Profile } from "@/types";

type Tab = "calendar" | "boards";

/**
 * Owns the calendar/boards tab locally, rendering whichever shell is active.
 * Both tabs share data already fetched once by useAppShellData, so
 * switching between them is a plain client-side re-render - no Next.js
 * navigation, no repeat auth/approval check.
 */
export function AppTabsShell({
  defaultTab,
  profile,
  events,
  members,
  onCreate,
  onUpdate,
  onDelete,
  boards,
  lists,
  cards,
  onCreateBoard,
  onDeleteBoard,
  error,
}: {
  defaultTab: Tab;
  profile: Profile | null;
  events: CalendarEvent[];
  members: Pick<Profile, "id" | "name">[];
  onCreate: (values: EventFormValues) => Promise<void> | void;
  onUpdate: (id: string, values: EventFormValues) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  boards: Board[];
  lists: List[];
  cards: Card[];
  onCreateBoard: (name: string) => Promise<void> | void;
  onDeleteBoard: (id: string) => Promise<void> | void;
  error: string | null;
}) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  const banner = error ? (
    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">{error}</div>
  ) : undefined;

  const userName = profile?.name || "Team member";

  if (tab === "boards") {
    return (
      <BoardsShell
        userName={userName}
        userRole="Manager"
        boards={boards}
        lists={lists}
        cards={cards}
        onCreateBoard={onCreateBoard}
        onDeleteBoard={onDeleteBoard}
        banner={banner}
        basePath="/app"
        onSelectTab={setTab}
      />
    );
  }

  return (
    <CalendarShell
      userName={userName}
      userRole="Manager"
      events={events}
      members={members}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      banner={banner}
      basePath="/app"
      onSelectTab={setTab}
    />
  );
}
