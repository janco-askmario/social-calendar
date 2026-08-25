"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BoardsShell } from "@/components/boards/BoardsShell";
import { subscribeToTable } from "@/lib/boards";
import type { Board, Card, List, Profile } from "@/types";

export default function BoardsPage() {
  const supabase = createClient();
  const [boards, setBoards] = useState<Board[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [{ data: boardRows, error: boardsError }, { data: listRows }, { data: cardRows }, { data: myProfile }] =
      await Promise.all([
        supabase.from("boards").select("*").order("created_at", { ascending: true }),
        supabase.from("lists").select("*"),
        supabase.from("cards").select("*"),
        user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
      ]);

    if (boardsError) setError(boardsError.message);
    else setBoards((boardRows as Board[]) ?? []);
    setLists((listRows as List[]) ?? []);
    setCards((cardRows as Card[]) ?? []);
    if (myProfile) setProfile(myProfile as Profile);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!supabase) return;
    const boardsChannel = subscribeToTable(supabase, "boards", "boards-list-realtime", setBoards);
    const listsChannel = subscribeToTable(supabase, "lists", "boards-list-lists-realtime", setLists);
    const cardsChannel = subscribeToTable(supabase, "cards", "boards-list-cards-realtime", setCards);
    return () => {
      supabase.removeChannel(boardsChannel);
      supabase.removeChannel(listsChannel);
      supabase.removeChannel(cardsChannel);
    };
  }, [supabase]);

  async function handleCreateBoard(name: string) {
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase
      .from("boards")
      .insert({ name, created_by: user?.id ?? null })
      .select()
      .single();
    if (insertError) {
      setError(insertError.message);
      return;
    }
    if (data) setBoards((prev) => (prev.some((b) => b.id === data.id) ? prev : [...prev, data as Board]));
  }

  if (!supabase) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted font-medium">Loading boards…</p>
      </div>
    );
  }

  return (
    <BoardsShell
      userName={profile?.name || "Team member"}
      userRole="Manager"
      boards={boards}
      lists={lists}
      cards={cards}
      onCreateBoard={handleCreateBoard}
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
