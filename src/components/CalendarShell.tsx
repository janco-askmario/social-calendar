"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { usePinnedBoard } from "@/lib/usePinnedBoard";
import { CalendarToolbar } from "@/components/CalendarToolbar";
import { CalendarGrid } from "@/components/CalendarGrid";
import { EventModal } from "@/components/EventModal";
import type { EventFormValues } from "@/components/EventForm";
import { shiftAnchor } from "@/lib/calendar";
import { PLATFORMS } from "@/types";
import type { CalendarEvent, CalendarView, Platform, Profile } from "@/types";

export function CalendarShell({
  userName,
  userRole,
  events,
  members,
  onCreate,
  onUpdate,
  onDelete,
  banner,
  basePath = "/app",
  onSelectTab,
}: {
  userName: string;
  userRole: string;
  events: CalendarEvent[];
  members: Pick<Profile, "id" | "name">[];
  onCreate: (values: EventFormValues) => Promise<void> | void;
  onUpdate: (id: string, values: EventFormValues) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  banner?: React.ReactNode;
  basePath?: string;
  onSelectTab?: (tab: "calendar" | "boards") => void;
}) {
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set(PLATFORMS));
  const [modalState, setModalState] = useState<
    { mode: "create"; date?: Date } | { mode: "edit"; event: CalendarEvent } | null
  >(null);
  const { pinned } = usePinnedBoard(basePath);

  const filteredEvents = useMemo(
    () => events.filter((e) => selectedPlatforms.has(e.platform)),
    [events, selectedPlatforms]
  );

  function togglePlatform(p: Platform) {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  async function handleSave(values: EventFormValues, id?: string) {
    if (id) await onUpdate(id, values);
    else await onCreate(values);
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-10 pt-6 pb-28">
      <div className="mx-auto flex flex-col lg:flex-row gap-5">
        <Sidebar
          events={events}
          onSelectEvent={(event) => setModalState({ mode: "edit", event })}
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={togglePlatform}
          members={members}
        />

        <main className="flex-1 bg-panel rounded-[38px] border border-black/5 shadow-panel p-6 min-w-0">
          <Header name={userName} role={userRole} />
          {banner}
          <CalendarToolbar
            view={view}
            anchor={anchor}
            onViewChange={setView}
            onPrev={() => setAnchor((a) => shiftAnchor(a, view, -1))}
            onNext={() => setAnchor((a) => shiftAnchor(a, view, 1))}
            onToday={() => setAnchor(new Date())}
            onAdd={() => setModalState({ mode: "create" })}
          />
          <div className="h-[70vh]">
            <CalendarGrid
              view={view}
              anchor={anchor}
              events={filteredEvents}
              onSelectEvent={(event) => setModalState({ mode: "edit", event })}
              onCreateAt={(date) => setModalState({ mode: "create", date })}
              onReschedule={(id, start, end) =>
                onUpdate(id, eventToFormValues(events.find((e) => e.id === id)!, start, end))
              }
              onResize={(id, end) => {
                const event = events.find((e) => e.id === id);
                if (!event) return;
                onUpdate(id, eventToFormValues(event, new Date(event.start_time), end));
              }}
            />
          </div>
        </main>
      </div>

      {modalState && (
        <EventModal
          event={modalState.mode === "edit" ? modalState.event : null}
          defaultDate={modalState.mode === "create" ? modalState.date : undefined}
          onClose={() => setModalState(null)}
          onSave={handleSave}
          onDelete={onDelete}
        />
      )}

      <BottomDock active="calendar" basePath={basePath} onSelect={onSelectTab} pinnedBoard={pinned} />
    </div>
  );
}

function eventToFormValues(event: CalendarEvent, start: Date, end: Date): EventFormValues {
  return {
    title: event.title,
    description: event.description ?? "",
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    platform: event.platform,
    colour: event.colour,
  };
}

export function BackToHomeBanner() {
  return (
    <div className="mb-4 rounded-xl bg-accent/10 text-accent text-sm font-semibold px-4 py-2.5 flex items-center justify-between">
      <span>You&apos;re viewing the demo — changes aren&apos;t saved.</span>
      <Link href="/" className="underline hover:no-underline">
        Back to home
      </Link>
    </div>
  );
}
