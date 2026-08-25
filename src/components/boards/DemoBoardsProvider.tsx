"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { buildDemoBoardData, demoId } from "@/lib/demoBoardsData";
import { nextPosition } from "@/lib/boards";
import type { Board, Card, ChecklistItem, List } from "@/types";

interface DemoBoardsValue {
  boards: Board[];
  lists: List[];
  cards: Card[];
  checklist: ChecklistItem[];
  createBoard: (name: string) => string;
  renameBoard: (id: string, name: string) => void;
  deleteBoard: (id: string) => void;
  addList: (boardId: string, name: string) => void;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  reorderList: (id: string, position: number) => void;
  addCard: (listId: string, title: string) => void;
  reorderCard: (cardId: string, listId: string, position: number) => void;
  deleteCard: (id: string) => void;
  updateCard: (id: string, patch: Partial<Pick<Card, "title" | "description" | "colour" | "is_done">>) => void;
  addChecklistItem: (cardId: string, text: string) => void;
  toggleChecklistItem: (id: string, checked: boolean) => void;
  removeChecklistItem: (id: string) => void;
  deleteChecklist: (cardId: string) => void;
}

const DemoBoardsContext = createContext<DemoBoardsValue | null>(null);

export function DemoBoardsProvider({ children }: { children: React.ReactNode }) {
  const [seed] = useState(() => buildDemoBoardData());
  const [boards, setBoards] = useState<Board[]>(seed.boards);
  const [lists, setLists] = useState<List[]>(seed.lists);
  const [cards, setCards] = useState<Card[]>(seed.cards);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(seed.checklist);

  const value = useMemo<DemoBoardsValue>(
    () => ({
      boards,
      lists,
      cards,
      checklist,
      createBoard: (name) => {
        const now = new Date().toISOString();
        const id = demoId("board");
        setBoards((prev) => [...prev, { id, name, created_by: null, created_at: now, updated_at: now }]);
        return id;
      },
      renameBoard: (id, name) => {
        setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b)));
      },
      deleteBoard: (id) => {
        setBoards((prev) => prev.filter((b) => b.id !== id));
        const removedListIds = new Set(lists.filter((l) => l.board_id === id).map((l) => l.id));
        setLists((prev) => prev.filter((l) => l.board_id !== id));
        const removedCardIds = new Set(cards.filter((c) => removedListIds.has(c.list_id)).map((c) => c.id));
        setCards((prev) => prev.filter((c) => !removedListIds.has(c.list_id)));
        setChecklist((prev) => prev.filter((i) => !removedCardIds.has(i.card_id)));
      },
      addList: (boardId, name) => {
        const now = new Date().toISOString();
        const position = nextPosition(lists.filter((l) => l.board_id === boardId));
        setLists((prev) => [
          ...prev,
          { id: demoId("list"), board_id: boardId, name, position, created_at: now, updated_at: now },
        ]);
      },
      renameList: (id, name) => {
        setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
      },
      deleteList: (id) => {
        setLists((prev) => prev.filter((l) => l.id !== id));
        const removedCardIds = new Set(cards.filter((c) => c.list_id === id).map((c) => c.id));
        setCards((prev) => prev.filter((c) => c.list_id !== id));
        setChecklist((prev) => prev.filter((i) => !removedCardIds.has(i.card_id)));
      },
      reorderList: (id, position) => {
        setLists((prev) => prev.map((l) => (l.id === id ? { ...l, position } : l)));
      },
      addCard: (listId, title) => {
        const now = new Date().toISOString();
        const position = nextPosition(cards.filter((c) => c.list_id === listId));
        setCards((prev) => [
          ...prev,
          {
            id: demoId("card"),
            list_id: listId,
            title,
            description: null,
            colour: null,
            position,
            is_done: false,
            created_by: null,
            created_at: now,
            updated_at: now,
          },
        ]);
      },
      reorderCard: (cardId, listId, position) => {
        setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, list_id: listId, position } : c)));
      },
      deleteCard: (id) => {
        setCards((prev) => prev.filter((c) => c.id !== id));
        setChecklist((prev) => prev.filter((i) => i.card_id !== id));
      },
      updateCard: (id, patch) => {
        setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      },
      addChecklistItem: (cardId, text) => {
        const now = new Date().toISOString();
        const position = nextPosition(checklist.filter((i) => i.card_id === cardId));
        setChecklist((prev) => [
          ...prev,
          { id: demoId("item"), card_id: cardId, text, is_checked: false, position, created_at: now, updated_at: now },
        ]);
      },
      toggleChecklistItem: (id, checked) => {
        setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, is_checked: checked } : i)));
      },
      removeChecklistItem: (id) => {
        setChecklist((prev) => prev.filter((i) => i.id !== id));
      },
      deleteChecklist: (cardId) => {
        setChecklist((prev) => prev.filter((i) => i.card_id !== cardId));
      },
    }),
    [boards, lists, cards, checklist]
  );

  return <DemoBoardsContext.Provider value={value}>{children}</DemoBoardsContext.Provider>;
}

export function useDemoBoards(): DemoBoardsValue {
  const ctx = useContext(DemoBoardsContext);
  if (!ctx) throw new Error("useDemoBoards must be used within a DemoBoardsProvider");
  return ctx;
}
