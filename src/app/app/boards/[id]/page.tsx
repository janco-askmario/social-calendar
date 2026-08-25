"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BoardShell } from "@/components/boards/BoardShell";
import { nextPosition, subscribeToTable } from "@/lib/boards";
import { hasCached, readCached, useCachedState, writeCached } from "@/lib/pageCache";
import type { Board, Card, ChecklistItem, List, Profile } from "@/types";

export default function BoardDetailPage() {
  const supabase = createClient();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const boardId = params.id;

  const boardKey = `board-${boardId}`;
  const listsKey = `board-${boardId}-lists`;
  const cardsKey = `board-${boardId}-cards`;
  const checklistKey = `board-${boardId}-checklist`;

  const [board, setBoard] = useState<Board | null>(() => readCached<Board>(boardKey) ?? null);
  const [lists, setLists] = useCachedState<List[]>(listsKey, []);
  const [cards, setCards] = useCachedState<Card[]>(cardsKey, []);
  const [checklist, setChecklist] = useCachedState<ChecklistItem[]>(checklistKey, []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(() => !hasCached(boardKey));
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const listIdsRef = useRef<Set<string>>(new Set());
  const cardIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    listIdsRef.current = new Set(lists.map((l) => l.id));
  }, [lists]);

  useEffect(() => {
    cardIdsRef.current = new Set(cards.map((c) => c.id));
  }, [cards]);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    userIdRef.current = user?.id ?? null;

    const [{ data: boardRow, error: boardError }, { data: listRows }, { data: myProfile }] = await Promise.all([
      supabase.from("boards").select("*").eq("id", boardId).single(),
      supabase.from("lists").select("*").eq("board_id", boardId),
      user ? supabase.from("profiles").select("*").eq("id", user.id).single() : Promise.resolve({ data: null }),
    ]);

    if (boardError || !boardRow) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setBoard(boardRow as Board);
    writeCached(boardKey, boardRow as Board);
    const listData = (listRows as List[]) ?? [];
    setLists(listData);
    if (myProfile) setProfile(myProfile as Profile);

    const listIds = listData.map((l) => l.id);
    if (listIds.length > 0) {
      const { data: cardRows } = await supabase.from("cards").select("*").in("list_id", listIds);
      const cardData = (cardRows as Card[]) ?? [];
      setCards(cardData);
      const cardIds = cardData.map((c) => c.id);
      if (cardIds.length > 0) {
        const { data: checklistRows } = await supabase.from("checklist_items").select("*").in("card_id", cardIds);
        setChecklist((checklistRows as ChecklistItem[]) ?? []);
      } else {
        setChecklist([]);
      }
    } else {
      setCards([]);
      setChecklist([]);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boardKey is derived from boardId, already a dep
  }, [supabase, boardId, setLists, setCards, setChecklist]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!supabase) return;

    const boardChannel = supabase
      .channel(`board-${boardId}-realtime`)
      .on("postgres_changes", { event: "*", schema: "public", table: "boards", filter: `id=eq.${boardId}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          setNotFound(true);
          return;
        }
        const row = payload.new as Board;
        setBoard(row);
        writeCached(boardKey, row);
      })
      .subscribe();

    const listsChannel = subscribeToTable<List>(supabase, "lists", `board-${boardId}-lists-realtime`, setLists, {
      filter: `board_id=eq.${boardId}`,
    });

    const cardsChannel = subscribeToTable<Card>(supabase, "cards", `board-${boardId}-cards-realtime`, setCards, {
      accept: (row) => listIdsRef.current.has(row.list_id),
    });

    const checklistChannel = subscribeToTable<ChecklistItem>(
      supabase,
      "checklist_items",
      `board-${boardId}-checklist-realtime`,
      setChecklist,
      { accept: (row) => cardIdsRef.current.has(row.card_id) }
    );

    return () => {
      supabase.removeChannel(boardChannel);
      supabase.removeChannel(listsChannel);
      supabase.removeChannel(cardsChannel);
      supabase.removeChannel(checklistChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boardKey is derived from boardId, already a dep
  }, [supabase, boardId, setLists, setCards, setChecklist]);

  async function handleRenameBoard(name: string) {
    if (!supabase || !board) return;
    const next = { ...board, name };
    setBoard(next);
    writeCached(boardKey, next);
    const { error: updateError } = await supabase.from("boards").update({ name }).eq("id", board.id);
    if (updateError) setError(updateError.message);
  }

  async function handleAddList(name: string) {
    if (!supabase) return;
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    const position = nextPosition(lists);
    const optimistic: List = { id: tempId, board_id: boardId, name, position, created_at: now, updated_at: now };
    setLists((prev) => [...prev, optimistic]);

    const { data, error: insertError } = await supabase
      .from("lists")
      .insert({ board_id: boardId, name, position })
      .select()
      .single();

    setLists((prev) => {
      const withoutTemp = prev.filter((l) => l.id !== tempId);
      if (insertError || !data) return withoutTemp;
      if (withoutTemp.some((l) => l.id === data.id)) return withoutTemp;
      return [...withoutTemp, data as List];
    });
    if (insertError) setError(insertError.message);
  }

  async function handleRenameList(id: string, name: string) {
    if (!supabase) return;
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
    const { error: updateError } = await supabase.from("lists").update({ name }).eq("id", id);
    if (updateError) setError(updateError.message);
  }

  async function handleDeleteList(id: string) {
    if (!supabase) return;
    const previous = lists;
    setLists((prev) => prev.filter((l) => l.id !== id));
    const { error: deleteError } = await supabase.from("lists").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setLists(previous);
    }
  }

  async function handleReorderList(id: string, position: number) {
    if (!supabase) return;
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, position } : l)));
    const { error: updateError } = await supabase.from("lists").update({ position }).eq("id", id);
    if (updateError) setError(updateError.message);
  }

  async function handleAddCard(listId: string, title: string) {
    if (!supabase) return;
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    const position = nextPosition(cards.filter((c) => c.list_id === listId));
    const optimistic: Card = {
      id: tempId,
      list_id: listId,
      title,
      description: null,
      colour: null,
      position,
      is_done: false,
      created_by: userIdRef.current,
      created_at: now,
      updated_at: now,
    };
    setCards((prev) => [...prev, optimistic]);

    const { data, error: insertError } = await supabase
      .from("cards")
      .insert({ list_id: listId, title, position, created_by: userIdRef.current })
      .select()
      .single();

    setCards((prev) => {
      const withoutTemp = prev.filter((c) => c.id !== tempId);
      if (insertError || !data) return withoutTemp;
      if (withoutTemp.some((c) => c.id === data.id)) return withoutTemp;
      return [...withoutTemp, data as Card];
    });
    if (insertError) setError(insertError.message);
  }

  async function handleReorderCard(cardId: string, listId: string, position: number) {
    if (!supabase) return;
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, list_id: listId, position } : c)));
    const { error: updateError } = await supabase.from("cards").update({ list_id: listId, position }).eq("id", cardId);
    if (updateError) setError(updateError.message);
  }

  async function handleDeleteCard(id: string) {
    if (!supabase) return;
    const previous = cards;
    setCards((prev) => prev.filter((c) => c.id !== id));
    const { error: deleteError } = await supabase.from("cards").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setCards(previous);
    }
  }

  async function handleUpdateCard(
    id: string,
    patch: Partial<Pick<Card, "title" | "description" | "colour" | "is_done">>
  ) {
    if (!supabase) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    const { error: updateError } = await supabase.from("cards").update(patch).eq("id", id);
    if (updateError) setError(updateError.message);
  }

  async function handleAddChecklistItem(cardId: string, text: string) {
    if (!supabase) return;
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    const position = nextPosition(checklist.filter((i) => i.card_id === cardId));
    const optimistic: ChecklistItem = {
      id: tempId,
      card_id: cardId,
      text,
      is_checked: false,
      position,
      created_at: now,
      updated_at: now,
    };
    setChecklist((prev) => [...prev, optimistic]);

    const { data, error: insertError } = await supabase
      .from("checklist_items")
      .insert({ card_id: cardId, text, position })
      .select()
      .single();

    setChecklist((prev) => {
      const withoutTemp = prev.filter((i) => i.id !== tempId);
      if (insertError || !data) return withoutTemp;
      if (withoutTemp.some((i) => i.id === data.id)) return withoutTemp;
      return [...withoutTemp, data as ChecklistItem];
    });
    if (insertError) setError(insertError.message);
  }

  async function handleToggleChecklistItem(id: string, checked: boolean) {
    if (!supabase) return;
    setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, is_checked: checked } : i)));
    const { error: updateError } = await supabase.from("checklist_items").update({ is_checked: checked }).eq("id", id);
    if (updateError) setError(updateError.message);
  }

  async function handleRemoveChecklistItem(id: string) {
    if (!supabase) return;
    const previous = checklist;
    setChecklist((prev) => prev.filter((i) => i.id !== id));
    const { error: deleteError } = await supabase.from("checklist_items").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setChecklist(previous);
    }
  }

  async function handleDeleteChecklist(cardId: string) {
    if (!supabase) return;
    const previous = checklist;
    setChecklist((prev) => prev.filter((i) => i.card_id !== cardId));
    const { error: deleteError } = await supabase.from("checklist_items").delete().eq("card_id", cardId);
    if (deleteError) {
      setError(deleteError.message);
      setChecklist(previous);
    }
  }

  if (!supabase) return null;

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center bg-panel rounded-[28px] border border-black/5 p-8">
          <h1 className="text-lg font-bold text-foreground">Board not found</h1>
          <p className="mt-2 text-sm text-muted">
            It may have been deleted.{" "}
            <button onClick={() => router.push("/app/boards")} className="text-accent font-semibold underline">
              Back to boards
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (loading || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted font-medium">Loading board…</p>
      </div>
    );
  }

  return (
    <BoardShell
      userName={profile?.name || "Team member"}
      userRole="Manager"
      board={board}
      lists={lists}
      cards={cards}
      checklist={checklist}
      onRenameBoard={handleRenameBoard}
      onAddList={handleAddList}
      onRenameList={handleRenameList}
      onDeleteList={handleDeleteList}
      onReorderList={handleReorderList}
      onAddCard={handleAddCard}
      onReorderCard={handleReorderCard}
      onDeleteCard={handleDeleteCard}
      onUpdateCard={handleUpdateCard}
      onAddChecklistItem={handleAddChecklistItem}
      onToggleChecklistItem={handleToggleChecklistItem}
      onRemoveChecklistItem={handleRemoveChecklistItem}
      onDeleteChecklist={handleDeleteChecklist}
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
