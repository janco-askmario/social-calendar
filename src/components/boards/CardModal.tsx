"use client";

import { useState } from "react";
import clsx from "clsx";
import { BoardColourPicker } from "@/components/boards/BoardColourPicker";
import { CardDescription } from "@/components/boards/CardDescription";
import { ChecklistSection } from "@/components/boards/ChecklistSection";
import { COLOUR_STYLES } from "@/lib/platforms";
import type { Card, ChecklistItem, EventColour } from "@/types";

export function CardModal({
  card,
  checklist,
  onClose,
  onRename,
  onToggleDone,
  onChangeColour,
  onChangeDescription,
  onAddChecklistItem,
  onToggleChecklistItem,
  onRemoveChecklistItem,
  onDeleteChecklist,
  onDeleteCard,
}: {
  card: Card;
  checklist: ChecklistItem[];
  onClose: () => void;
  onRename: (title: string) => void;
  onToggleDone: (done: boolean) => void;
  onChangeColour: (colour: EventColour | null) => void;
  onChangeDescription: (description: string) => void;
  onAddChecklistItem: (text: string) => void;
  onToggleChecklistItem: (id: string, checked: boolean) => void;
  onRemoveChecklistItem: (id: string) => void;
  onDeleteChecklist: () => void;
  onDeleteCard: () => void;
}) {
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(card.title);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pickingColour, setPickingColour] = useState(false);

  const colours = card.colour ? COLOUR_STYLES[card.colour] : null;

  function commitTitle() {
    setTitleEditing(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== card.title) onRename(trimmed);
    else setTitleDraft(card.title);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-panel rounded-[28px] shadow-xl border border-black/5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {colours && <div className="h-3 rounded-t-[28px]" style={{ background: colours.accent }} />}

        <div className="p-7">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button
                onClick={() => onToggleDone(!card.is_done)}
                aria-label={card.is_done ? "Mark not done" : "Mark done"}
                className={clsx(
                  "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition",
                  card.is_done ? "bg-emerald-500 border-emerald-500 text-white" : "border-black/20 hover:border-accent"
                )}
              >
                {card.is_done && "✓"}
              </button>
              {titleEditing ? (
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") {
                      setTitleDraft(card.title);
                      setTitleEditing(false);
                    }
                  }}
                  className="flex-1 min-w-0 rounded-lg border border-accent/40 bg-white px-2.5 py-1.5 text-lg font-bold text-foreground outline-none"
                />
              ) : (
                <h2
                  onClick={() => setTitleEditing(true)}
                  className={clsx(
                    "flex-1 min-w-0 text-lg font-bold text-foreground cursor-text break-words hover:bg-black/5 rounded-lg px-2.5 py-1.5 -mx-2.5 -my-1.5 transition",
                    card.is_done && "line-through text-foreground/40"
                  )}
                >
                  {card.title}
                </h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-foreground/60 shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground">Colour</h3>
              <button
                onClick={() => setPickingColour((v) => !v)}
                className="text-xs font-semibold text-accent hover:underline"
              >
                {pickingColour ? "Done" : "Change"}
              </button>
            </div>
            {pickingColour && (
              <BoardColourPicker
                value={card.colour}
                onChange={(c) => {
                  onChangeColour(c);
                  setPickingColour(false);
                }}
              />
            )}
          </div>

          <div className="mb-6">
            <CardDescription value={card.description ?? ""} onSave={onChangeDescription} />
          </div>

          <div className="mb-6">
            <ChecklistSection
              items={checklist}
              onAdd={onAddChecklistItem}
              onToggle={onToggleChecklistItem}
              onRemoveItem={onRemoveChecklistItem}
              onDeleteChecklist={onDeleteChecklist}
            />
          </div>

          <div className="pt-4 border-t border-black/5">
            {confirmingDelete ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-foreground/80">Delete this card? This can&apos;t be undone.</p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded-xl px-3.5 py-2 text-sm font-semibold text-foreground/70 hover:bg-black/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDeleteCard}
                    className="rounded-xl bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Delete card
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
