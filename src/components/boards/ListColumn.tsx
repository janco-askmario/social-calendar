"use client";

import { useState } from "react";
import clsx from "clsx";
import { ListHeader } from "@/components/boards/ListHeader";
import { TrelloCard } from "@/components/boards/TrelloCard";
import type { Card, ChecklistItem, List } from "@/types";

export function ListColumn({
  list,
  cards,
  checklistByCard,
  draggingCardId,
  isCardDropTarget,
  isListDropTarget,
  isDraggingList,
  onCardPointerDown,
  onSelectCard,
  onAddCard,
  onRenameList,
  onDeleteList,
  onListDragPointerDown,
}: {
  list: List;
  cards: Card[];
  checklistByCard: Record<string, ChecklistItem[]>;
  draggingCardId: string | null;
  isCardDropTarget: boolean;
  isListDropTarget: boolean;
  isDraggingList: boolean;
  onCardPointerDown: (e: React.PointerEvent, cardId: string) => void;
  onSelectCard: (card: Card) => void;
  onAddCard: (title: string) => void;
  onRenameList: (name: string) => void;
  onDeleteList: () => void;
  onListDragPointerDown: (e: React.PointerEvent) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  function submitAdd() {
    const trimmed = title.trim();
    if (trimmed) onAddCard(trimmed);
    setTitle("");
    setAdding(false);
  }

  return (
    <div
      data-list-col
      data-list-id={list.id}
      className={clsx(
        "w-72 shrink-0 rounded-2xl bg-black/[0.025] border transition-all flex flex-col max-h-full",
        isListDropTarget ? "border-accent/50 ring-2 ring-accent/30" : "border-black/5",
        isDraggingList && "opacity-0"
      )}
    >
      <ListHeader
        name={list.name}
        cardCount={cards.length}
        onRename={onRenameList}
        onDelete={onDeleteList}
        onDragPointerDown={onListDragPointerDown}
      />

      <div
        className={clsx(
          "flex-1 overflow-y-auto px-2 flex flex-col gap-2 min-h-[8px] pb-1 rounded-lg transition-colors",
          isCardDropTarget && "bg-accent/5"
        )}
      >
        {cards.map((card) => (
          <div key={card.id} data-card data-card-id={card.id}>
            <TrelloCard
              card={card}
              checklist={checklistByCard[card.id] ?? []}
              isDragging={card.id === draggingCardId}
              onClick={() => onSelectCard(card)}
              onDragPointerDown={(e) => onCardPointerDown(e, card.id)}
            />
          </div>
        ))}
      </div>

      <div className="p-2">
        {adding ? (
          <div className="space-y-1.5">
            <textarea
              autoFocus
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitAdd();
                }
                if (e.key === "Escape") {
                  setTitle("");
                  setAdding(false);
                }
              }}
              placeholder="Enter a title for this card…"
              className="w-full rounded-lg border border-accent/40 bg-white px-2.5 py-2 text-sm text-foreground outline-none resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={submitAdd}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-2 transition"
              >
                Add card
              </button>
              <button
                onClick={() => {
                  setTitle("");
                  setAdding(false);
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
            onClick={() => setAdding(true)}
            className="w-full text-left rounded-lg px-2.5 py-2 text-sm font-semibold text-foreground/60 hover:bg-black/5 transition"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}
