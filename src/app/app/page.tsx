"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CalendarShell } from "@/components/CalendarShell";
import type { EventFormValues } from "@/components/EventForm";
import type { CalendarEvent, Profile } from "@/types";

export default function AppCalendarPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [members, setMembers] = useState<Pick<Profile, "id" | "name">[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    userIdRef.current = user?.id ?? null;

    const [{ data: eventRows, error: eventsError }, { data: profileRows }, { data: myProfile }] =
      await Promise.all([
        supabase.from("events").select("*").order("start_time", { ascending: true }),
        supabase.from("profiles").select("id, name").eq("approved", true),
        user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
      ]);

    if (eventsError) {
      setError(eventsError.message);
    } else {
      setEvents((eventRows as CalendarEvent[]) ?? []);
    }
    setMembers(profileRows ?? []);
    if (myProfile) setProfile(myProfile as Profile);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("events-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          setEvents((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as CalendarEvent;
              if (prev.some((e) => e.id === row.id)) return prev;
              return [...prev, row].sort(
                (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
              );
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as CalendarEvent;
              return prev.map((e) => (e.id === row.id ? row : e));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as { id: string };
              return prev.filter((e) => e.id !== row.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function handleCreate(values: EventFormValues) {
    if (!supabase) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic: CalendarEvent = {
      id: tempId,
      title: values.title,
      description: values.description || null,
      start_time: values.start_time,
      end_time: values.end_time,
      colour: values.colour,
      platform: values.platform,
      created_by: userIdRef.current,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, optimistic]);

    const { data, error: insertError } = await supabase
      .from("events")
      .insert({ ...values, created_by: userIdRef.current })
      .select()
      .single();

    setEvents((prev) => {
      const withoutTemp = prev.filter((e) => e.id !== tempId);
      if (insertError || !data) return withoutTemp;
      if (withoutTemp.some((e) => e.id === data.id)) return withoutTemp;
      return [...withoutTemp, data as CalendarEvent];
    });
    if (insertError) setError(insertError.message);
  }

  async function handleUpdate(id: string, values: EventFormValues) {
    if (!supabase) return;
    const previous = events;
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...values } : e)));

    const { error: updateError } = await supabase.from("events").update(values).eq("id", id);
    if (updateError) {
      setError(updateError.message);
      setEvents(previous);
    }
  }

  async function handleDelete(id: string) {
    if (!supabase) return;
    const previous = events;
    setEvents((prev) => prev.filter((e) => e.id !== id));
    const { error: deleteError } = await supabase.from("events").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setEvents(previous);
    }
  }

  if (!supabase) {
    return null; // handled by layout's not-configured screen
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted font-medium">Loading calendar…</p>
      </div>
    );
  }

  return (
    <CalendarShell
      userName={profile?.name || "Team member"}
      userRole="Manager"
      events={events}
      members={members}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      banner={
        error ? (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
            {error}
          </div>
        ) : undefined
      }
    />
  );
}
