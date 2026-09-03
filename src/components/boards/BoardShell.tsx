"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { usePinnedBoard } from "@/lib/usePinnedBoard";
import { ListColumn } from "@/components/boards/ListColumn";
import { CardModal } from "@/components/boards/CardModal";
import { useDragGhost } from "@/lib/useDragGhost";
import { positionBetween, sortByPosition } from "@/lib/boards";
import type { Board, Card, ChecklistItem, EventColour, List } from "@/types";

/**
 * Finds which list column the cursor is over, by pure geometry rather than
 * DOM hit-testing (elementFromPoint/closest). Hit-testing only counts a point
 * that's literally topmost at those exact pixels, which is unreliable for a
 * drag target: a short column's empty area below its last card isn't part of
 * its DOM rect, gaps between columns hit nothing, and the drag ghost or other
 * overlapping elements can shadow the real target. Instead, every column's
 * full-height "lane" (its horizontal span, for the whole row's vertical
 * extent) counts as part of that list - so anywhere within a list's width
 * registers as that list, edge to edge, not just where content happens to be
 * rendered. Falls back to nearest column by horizontal distance only when the
 * cursor is outside every lane (e.g. dropped in the gap past the last list,
 * or well below the row).
 */
function findListCol(clientX: number, clientY: number, excludeListId?: string | null): HTMLElement | null {
  // The dragged list's own column stays mounted (just opacity-0, not removed
  // from layout) for the ghost/fade-out treatment, so it still occupies its
  // original lane the whole time. Without excluding it, dropping anywhere
  // still inside that leftover lane (a short drag, or nudging back toward
  // where you started) resolves the target as "yourself" - the id-match
  // guard below then skips positioning entirely and silently appends the
  // list to the end instead of using the actual drop position.
  const cols = Array.from(document.querySelectorAll<HTMLElement>("[data-list-col]")).filter(
    (col) => col.dataset.listId !== excludeListId
  );
  if (cols.length === 0) return null;

  let rowTop = Infinity;
  let rowBottom = -Infinity;
  for (const col of cols) {
    const rect = col.getBoundingClientRect();
    rowTop = Math.min(rowTop, rect.top);
    rowBottom = Math.max(rowBottom, rect.bottom);
  }
  const verticalSlack = 120;
  if (clientY < rowTop - verticalSlack || clientY > rowBottom + verticalSlack) return null;

  // Full-width lane match: a point counts as "in" a column if it's within
  // that column's horizontal span, regardless of the column's own height.
  for (const col of cols) {
    const rect = col.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right) return col;
  }

  // Outside every lane (before the first list or past the last one) -
  // snap to whichever is closest.
  let nearest: HTMLElement | null = null;
  let nearestDistance = Infinity;
  for (const col of cols) {
    const rect = col.getBoundingClientRect();
    const distance = clientX < rect.left ? rect.left - clientX : clientX - rect.right;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = col;
    }
  }
  return nearest;
}

function findCardEl(clientX: number, clientY: number): HTMLElement | null {
  return document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-card]") ?? null;
}

export function BoardShell({
  userName,
  userRole,
  board,
  lists,
  cards,
  checklist,
  banner,
  onRenameBoard,
  onAddList,
  onRenameList,
  onDeleteList,
  onReorderList,
  onAddCard,
  onReorderCard,
  onDeleteCard,
  onUpdateCard,
  onAddChecklistItem,
  onToggleChecklistItem,
  onRemoveChecklistItem,
  onDeleteChecklist,
  basePath = "/app",
}: {
  userName: string;
  userRole: string;
  board: Board;
  lists: List[];
  cards: Card[];
  checklist: ChecklistItem[];
  banner?: React.ReactNode;
  onRenameBoard: (name: string) => void;
  onAddList: (name: string) => void;
  onRenameList: (id: string, name: string) => void;
  onDeleteList: (id: string) => void;
  onReorderList: (id: string, position: number) => void;
  onAddCard: (listId: string, title: string) => void;
  onReorderCard: (cardId: string, listId: string, position: number) => void;
  onDeleteCard: (id: string) => void;
  onUpdateCard: (id: string, patch: Partial<Pick<Card, "title" | "description" | "colour" | "is_done">>) => void;
  onAddChecklistItem: (cardId: string, text: string) => void;
  onToggleChecklistItem: (id: string, checked: boolean) => void;
  onRemoveChecklistItem: (id: string) => void;
  onDeleteChecklist: (cardId: string) => void;
  basePath?: string;
}) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(board.name);
  const [hoverListId, setHoverListId] = useState<string | null>(null);
  const { pinned, pin, unpin } = usePinnedBoard(basePath);
  const isPinned = pinned?.id === board.id;
  const dockActive = isPinned ? "pinned" : "boards";
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const boardMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (boardMenuRef.current && !boardMenuRef.current.contains(e.target as Node)) {
        setBoardMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const sortedLists = useMemo(() => sortByPosition(lists), [lists]);
  const cardsByList = useMemo(() => {
    const map: Record<string, Card[]> = {};
    for (const list of sortedLists) map[list.id] = [];
    for (const card of cards) {
      if (!map[card.list_id]) map[card.list_id] = [];
      map[card.list_id].push(card);
    }
    for (const key of Object.keys(map)) map[key] = sortByPosition(map[key]);
    return map;
  }, [cards, sortedLists]);
  const checklistByCard = useMemo(() => {
    const map: Record<string, ChecklistItem[]> = {};
    for (const item of checklist) {
      if (!map[item.card_id]) map[item.card_id] = [];
      map[item.card_id].push(item);
    }
    for (const key of Object.keys(map)) map[key] = sortByPosition(map[key]);
    return map;
  }, [checklist]);

  const selectedCard = selectedCardId ? cards.find((c) => c.id === selectedCardId) ?? null : null;

  const cardDrag = useDragGhost({
    onDragMove: (x, y) => {
      const col = findListCol(x, y);
      setHoverListId(col?.dataset.listId ?? null);
    },
    onDrop: (id, x, y) => {
      setHoverListId(null);
      // The card being dragged, or the list it's being dropped into, may have
      // been deleted by another user mid-drag (via realtime) - bail rather
      // than writing a stale reference back to the database.
      if (!cards.some((c) => c.id === id)) return;
      const col = findListCol(x, y);
      if (!col) return;
      const listId = col.dataset.listId!;
      if (!sortedLists.some((l) => l.id === listId)) return;
      const siblings = (cardsByList[listId] ?? []).filter((c) => c.id !== id);
      const cardEl = findCardEl(x, y);
      let index = siblings.length;
      if (cardEl && cardEl.dataset.cardId && cardEl.dataset.cardId !== id) {
        const idx = siblings.findIndex((c) => c.id === cardEl.dataset.cardId);
        if (idx !== -1) {
          const rect = cardEl.getBoundingClientRect();
          const before = y < rect.top + rect.height / 2;
          index = before ? idx : idx + 1;
        }
      }
      const position = positionBetween(siblings[index - 1]?.position, siblings[index]?.position);
      onReorderCard(id, listId, position);
    },
  });

  const listDrag = useDragGhost({
    onDragMove: (x, y) => {
      const col = findListCol(x, y, listDrag.draggingId);
      setHoverListId(col?.dataset.listId ?? null);
    },
    onDrop: (id, x, y) => {
      setHoverListId(null);
      // The list being dragged may have been deleted by another user
      // mid-drag - bail rather than writing a stale reference back.
      if (!sortedLists.some((l) => l.id === id)) return;
      const col = findListCol(x, y, id);
      const siblings = sortedLists.filter((l) => l.id !== id);
      let index = siblings.length;
      if (col && col.dataset.listId && col.dataset.listId !== id) {
        const idx = siblings.findIndex((l) => l.id === col.dataset.listId);
        if (idx !== -1) {
          const rect = col.getBoundingClientRect();
          const before = x < rect.left + rect.width / 2;
          index = before ? idx : idx + 1;
        }
      }
      const position = positionBetween(siblings[index - 1]?.position, siblings[index]?.position);
      onReorderList(id, position);
    },
  });

  function commitBoardTitle() {
    setTitleEditing(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== board.name) onRenameBoard(trimmed);
    else setTitleDraft(board.name);
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-10 pt-6 pb-28">
      <div className="mx-auto flex flex-col gap-5">
        <div className="bg-panel rounded-[38px] border border-black/5 shadow-panel p-6 min-w-0">
          <Header name={userName} role={userRole} />
          {banner}

          <div className="flex items-center gap-3 mb-5">
            <Link href={`${basePath}/boards`} className="text-sm font-semibold text-muted hover:text-accent transition">
              ← Boards
            </Link>
            <span className="text-muted">/</span>
            {titleEditing ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitBoardTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") {
                    setTitleDraft(board.name);
                    setTitleEditing(false);
                  }
                }}
                className="rounded-lg border border-accent/40 bg-white px-2.5 py-1 text-lg font-extrabold text-foreground outline-none focus:ring-2 focus:ring-accent/25"
              />
            ) : (
              <h1
                onClick={() => setTitleEditing(true)}
                className="text-lg font-extrabold text-foreground cursor-text hover:bg-black/5 rounded-lg px-2 py-1 -mx-2 transition"
              >
                {board.name || "Untitled board"}
              </h1>
            )}
            {isPinned && (
              <span className="text-accent" aria-label="Pinned" title="Pinned">
                📌
              </span>
            )}

            <div className="relative ml-auto" ref={boardMenuRef}>
              <button
                type="button"
                onClick={() => setBoardMenuOpen((o) => !o)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-foreground/50 hover:bg-black/5 transition"
                aria-label="Board menu"
              >
                ⋯
              </button>
              {boardMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-black/5 p-1.5 z-20">
                  <button
                    onClick={() => {
                      if (isPinned) unpin();
                      else pin({ id: board.id, name: board.name || "Untitled board" });
                      setBoardMenuOpen(false);
                    }}
                    className="block w-full text-left text-sm font-semibold text-foreground/80 hover:bg-black/5 rounded-lg px-3 py-2"
                  >
                    {isPinned ? "Unpin board" : "Pin board"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 items-start" style={{ maxHeight: "calc(100vh - 260px)" }}>
            {sortedLists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                cards={cardsByList[list.id] ?? []}
                checklistByCard={checklistByCard}
                draggingCardId={cardDrag.draggingId}
                isCardDropTarget={hoverListId === list.id && cardDrag.draggingId !== null}
                isListDropTarget={hoverListId === list.id && listDrag.draggingId !== null}
                isDraggingList={listDrag.draggingId === list.id}
                onCardPointerDown={(e, cardId) => cardDrag.onPointerDown(e, cardId)}
                onSelectCard={(card) => setSelectedCardId(card.id)}
                onAddCard={(title) => onAddCard(list.id, title)}
                onRenameList={(name) => onRenameList(list.id, name)}
                onDeleteList={() => onDeleteList(list.id)}
                onListDragPointerDown={(e) => listDrag.onPointerDown(e, list.id)}
              />
            ))}

            <div className="w-72 shrink-0">
              {addingList ? (
                <div className="rounded-2xl bg-black/[0.025] border border-black/5 p-2 space-y-1.5">
                  <input
                    autoFocus
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const trimmed = newListName.trim();
                        if (trimmed) onAddList(trimmed);
                        setNewListName("");
                        setAddingList(false);
                      }
                      if (e.key === "Escape") {
                        setNewListName("");
                        setAddingList(false);
                      }
                    }}
                    placeholder="Enter list name…"
                    className="w-full rounded-lg border border-accent/40 bg-white px-2.5 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/25"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const trimmed = newListName.trim();
                        if (trimmed) onAddList(trimmed);
                        setNewListName("");
                        setAddingList(false);
                      }}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-2 transition"
                    >
                      Add list
                    </button>
                    <button
                      onClick={() => {
                        setNewListName("");
                        setAddingList(false);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/50 hover:bg-black/5 transition"
                      aria-label="Cancel"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingList(true)}
                  className="w-full text-left rounded-2xl bg-black/[0.025] hover:bg-black/[0.05] border border-black/5 px-3.5 py-3 text-sm font-semibold text-foreground/60 transition"
                >
                  + Add another list
                </button>
              )}
            </div>
          </div>

          {sortedLists.length === 0 && !addingList && (
            <p className="text-sm text-muted mt-2">
              This board is empty. Add your first list to start organizing cards.
            </p>
          )}
        </div>
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          checklist={checklistByCard[selectedCard.id] ?? []}
          onClose={() => setSelectedCardId(null)}
          onRename={(title) => onUpdateCard(selectedCard.id, { title })}
          onToggleDone={(done) => onUpdateCard(selectedCard.id, { is_done: done })}
          onChangeColour={(colour: EventColour | null) => onUpdateCard(selectedCard.id, { colour })}
          onChangeDescription={(description) => onUpdateCard(selectedCard.id, { description })}
          onAddChecklistItem={(text) => onAddChecklistItem(selectedCard.id, text)}
          onToggleChecklistItem={onToggleChecklistItem}
          onRemoveChecklistItem={onRemoveChecklistItem}
          onDeleteChecklist={() => onDeleteChecklist(selectedCard.id)}
          onDeleteCard={() => {
            onDeleteCard(selectedCard.id);
            setSelectedCardId(null);
          }}
        />
      )}

      <BottomDock active={dockActive} basePath={basePath} pinnedBoard={pinned} />
    </div>
  );
}
