"use client";

import { useState } from "react";

export function CardDescription({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function startEdit() {
    setDraft(value);
    setEditing(true);
  }

  function save() {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }

  function discard() {
    setDraft(value);
    setEditing(false);
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-2">Description</h3>
      {editing ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            rows={5}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a more detailed description…"
            className="w-full rounded-xl border border-accent/40 bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/25 resize-y"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-accent-2 transition"
            >
              Save
            </button>
            <button
              onClick={discard}
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-foreground/60 hover:bg-black/5 transition"
            >
              Discard
            </button>
          </div>
        </div>
      ) : value ? (
        <button
          onClick={startEdit}
          className="w-full text-left rounded-xl bg-black/[0.03] hover:bg-black/[0.05] px-3 py-2.5 text-sm text-foreground/80 whitespace-pre-wrap transition"
        >
          {value}
        </button>
      ) : (
        <button
          onClick={startEdit}
          className="w-full text-left rounded-xl bg-black/[0.03] hover:bg-black/[0.05] px-3 py-2.5 text-sm text-foreground/50 transition"
        >
          Add a more detailed description…
        </button>
      )}
    </div>
  );
}
