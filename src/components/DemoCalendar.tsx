"use client";

import { useState } from "react";
import { CalendarShell, BackToHomeBanner } from "@/components/CalendarShell";
import type { EventFormValues } from "@/components/EventForm";
import { buildDemoEvents, DEMO_MEMBERS } from "@/lib/demoData";
import type { CalendarEvent } from "@/types";

export function DemoCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => buildDemoEvents());

  function handleCreate(values: EventFormValues) {
    const now = new Date().toISOString();
    setEvents((prev) => [
      ...prev,
      {
        id: `demo-${Date.now()}`,
        title: values.title,
        description: values.description || null,
        start_time: values.start_time,
        end_time: values.end_time,
        colour: values.colour,
        platform: values.platform,
        created_by: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  }

  function handleUpdate(id: string, values: EventFormValues) {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              title: values.title,
              description: values.description || null,
              start_time: values.start_time,
              end_time: values.end_time,
              colour: values.colour,
              platform: values.platform,
              updated_at: new Date().toISOString(),
            }
          : e
      )
    );
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <CalendarShell
      userName="Demo User"
      userRole="Manager"
      events={events}
      members={DEMO_MEMBERS}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      banner={<BackToHomeBanner />}
      basePath="/demo"
    />
  );
}
