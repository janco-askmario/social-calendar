"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BoardsShell } from "@/components/boards/BoardsShell";
import { BoardsListSkeleton } from "@/components/skeletons/BoardsListSkeleton";
import { subscribeToTable } from "@/lib/boards";
import { hasCached, useCachedState } from "@/lib/pageCache";
import type { Board, Card, List, Profile } from "@/types";

const BOARDS_KEY = "boards-list-boards";
const LISTS_KEY = "boards-list-lists";
const CARDS_KEY = "boards-list-cards";

export default function BoardsPage() {
  const supabase = createClient();
  const [boards, setBoards] = useCachedState<Board[]>(BOARDS_KEY, []);
  const [lists, setLists] = useCachedState<List[]>(LISTS_KEY, []);
  const [cards, setCards] = useCachedState<Card[]>(CARDS_KEY, []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => !hasCached(BOARDS_KEY));
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    userIdRef.current = user?.id ?? null;

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
  }, [supabase, setBoards, setLists, setCards]);

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
  }, [supabase, setBoards, setLists, setCards]);

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

  if (!supabase) return null;

  if (loading) {
    return <BoardsListSkeleton />;
  }

  return (
    <div className="reveal">
      <BoardsShell
        userName={profile?.name || "Team member"}
        userRole="Manager"
        boards={boards}
        lists={lists}
        cards={cards}
        onCreateBoard={handleCreateBoard}
        onDeleteBoard={handleDeleteBoard}
        banner={
          error ? (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
              {error}
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
