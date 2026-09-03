"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/boards";
import { hasCached, useCachedState } from "@/lib/pageCache";
import type { EventFormValues } from "@/components/EventForm";
import type { Board, Card, CalendarEvent, List, Profile } from "@/types";

const EVENTS_KEY = "calendar-events";
const MEMBERS_KEY = "calendar-members";
const BOARDS_KEY = "boards-list-boards";
const LISTS_KEY = "boards-list-lists";
const CARDS_KEY = "boards-list-cards";

/**
 * Loads everything the merged calendar/boards shell needs in one pass - a
 * single auth check and a single parallel batch of queries, shared between
 * the /app and /app/boards entry points so switching between those two
 * top-level views is a local tab change, not a second page load.
 */
export function useAppShellData() {
  const supabase = createClient();
  const [events, setEvents] = useCachedState<CalendarEvent[]>(EVENTS_KEY, []);
  const [members, setMembers] = useCachedState<Pick<Profile, "id" | "name">[]>(MEMBERS_KEY, []);
  const [boards, setBoards] = useCachedState<Board[]>(BOARDS_KEY, []);
  const [lists, setLists] = useCachedState<List[]>(LISTS_KEY, []);
  const [cards, setCards] = useCachedState<Card[]>(CARDS_KEY, []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => !hasCached(EVENTS_KEY) && !hasCached(BOARDS_KEY));
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    userIdRef.current = user?.id ?? null;

    const [
      { data: eventRows, error: eventsError },
      { data: profileRows },
      { data: boardRows, error: boardsError },
      { data: listRows },
      { data: cardRows },
      { data: myProfile },
    ] = await Promise.all([
      supabase.from("events").select("*").order("start_time", { ascending: true }),
      supabase.from("profiles").select("id, name").eq("approved", true),
      supabase.from("boards").select("*").order("created_at", { ascending: true }),
      supabase.from("lists").select("*"),
      supabase.from("cards").select("*"),
      user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
    ]);

    if (eventsError) setError(eventsError.message);
    else setEvents((eventRows as CalendarEvent[]) ?? []);
    setMembers(profileRows ?? []);
    if (boardsError) setError(boardsError.message);
    else setBoards((boardRows as Board[]) ?? []);
    setLists((listRows as List[]) ?? []);
    setCards((cardRows as Card[]) ?? []);
    if (myProfile) setProfile(myProfile as Profile);
    setLoading(false);
  }, [supabase, setEvents, setMembers, setBoards, setLists, setCards]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!supabase) return;

    const eventsChannel = supabase
      .channel("events-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, (payload) => {
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
      })
      .subscribe();

    const boardsChannel = subscribeToTable(supabase, "boards", "boards-list-realtime", setBoards);
    const listsChannel = subscribeToTable(supabase, "lists", "boards-list-lists-realtime", setLists);
    const cardsChannel = subscribeToTable(supabase, "cards", "boards-list-cards-realtime", setCards);

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(boardsChannel);
      supabase.removeChannel(listsChannel);
      supabase.removeChannel(cardsChannel);
    };
  }, [supabase, setEvents, setBoards, setLists, setCards]);

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

  async function handleCreateBoard(name: string) {
    if (!supabase) return;
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    const optimistic: Board = { id: tempId, name, created_by: userIdRef.current, created_at: now, updated_at: now };
    setBoards((prev) => [...prev, optimistic]);

    const { data, error: insertError } = await supabase
      .from("boards")
      .insert({ name, created_by: userIdRef.current })
      .select()
      .single();

    setBoards((prev) => {
      const withoutTemp = prev.filter((b) => b.id !== tempId);
      if (insertError || !data) return withoutTemp;
      if (withoutTemp.some((b) => b.id === data.id)) return withoutTemp;
      return [...withoutTemp, data as Board];
    });
    if (insertError) setError(insertError.message);
  }

  async function handleDeleteBoard(id: string) {
    if (!supabase) return;
    const previous = boards;
    setBoards((prev) => prev.filter((b) => b.id !== id));
    const { error: deleteError } = await supabase.from("boards").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setBoards(previous);
    }
  }

  return {
    supabase,
    events,
    members,
    boards,
    lists,
    cards,
    profile,
    loading,
    error,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleCreateBoard,
    handleDeleteBoard,
  };
}
