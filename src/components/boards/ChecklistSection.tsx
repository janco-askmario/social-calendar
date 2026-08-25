"use client";

import { useState } from "react";
import clsx from "clsx";
import type { ChecklistItem } from "@/types";

export function ChecklistSection({
  items,
  onAdd,
  onToggle,
  onRemoveItem,
  onDeleteChecklist,
}: {
  items: ChecklistItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string, checked: boolean) => void;
  onRemoveItem: (id: string) => void;
  onDeleteChecklist: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const total = items.length;
  const done = items.filter((i) => i.is_checked).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  function submit() {
    const trimmed = text.trim();
    if (trimmed) onAdd(trimmed);
    setText("");
    setAdding(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-foreground">Checklist</h3>
        {total > 0 && (
          <button
            onClick={() => setConfirmingDelete((v) => !v)}
            className="text-xs font-semibold text-foreground/50 hover:text-red-600 transition"
          >
            Delete
          </button>
        )}
      </div>

      {confirmingDelete && (
        <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 flex items-center justify-between">
          <p className="text-xs text-red-700">Delete the whole checklist?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmingDelete(false)}
              className="text-xs font-semibold text-foreground/70 hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDeleteChecklist();
                setConfirmingDelete(false);
              }}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {total > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-bold text-foreground/60 w-9">{pct}%</span>
          <div className="flex-1 h-2 rounded-full bg-black/[0.06] overflow-hidden">
            <div
              className={clsx(
                "h-full rounded-full transition-all",
                pct === 100 ? "bg-emerald-500" : "bg-accent"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {items.map((item) => (
          <label
            key={item.id}
            className="group flex items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-black/[0.03] transition"
          >
            <input
              type="checkbox"
              checked={item.is_checked}
              onChange={(e) => onToggle(item.id, e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-accent shrink-0"
            />
            <span
              className={clsx(
                "flex-1 text-sm text-foreground break-words",
                item.is_checked && "line-through text-foreground/40"
              )}
            >
              {item.text}
            </span>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="opacity-0 group-hover:opacity-100 text-foreground/40 hover:text-red-600 text-xs transition shrink-0"
              aria-label="Remove item"
            >
              ✕
            </button>
          </label>
        ))}
      </div>

      {adding ? (
        <div className="mt-2 space-y-1.5">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") {
                setText("");
                setAdding(false);
              }
            }}
            placeholder="Add an item…"
            className="w-full rounded-lg border border-accent/40 bg-white px-2.5 py-1.5 text-sm text-foreground outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={submit}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-2 transition"
            >
              Add
            </button>
            <button
              onClick={() => {
                setText("");
                setAdding(false);
              }}
              className="text-xs font-semibold text-foreground/60 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-1 text-sm font-semibold text-foreground/60 hover:bg-black/5 rounded-lg px-2 py-1.5 transition"
        >
          + Add an item
        </button>
      )}
    </div>
  );
}
