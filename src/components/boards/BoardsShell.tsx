"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { BoardCard } from "@/components/boards/BoardCard";
import type { Board, Card, List } from "@/types";

export function BoardsShell({
  userName,
  userRole,
  boards,
  lists,
  cards,
  banner,
  onCreateBoard,
  onDeleteBoard,
  basePath = "/app",
}: {
  userName: string;
  userRole: string;
  boards: Board[];
  lists: List[];
  cards: Card[];
  banner?: React.ReactNode;
  onCreateBoard: (name: string) => Promise<string | void> | void;
  onDeleteBoard?: (id: string) => void;
  basePath?: string;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const trimmed = name.trim() || "Untitled board";
    setSubmitting(true);
    try {
      await onCreateBoard(trimmed);
      setName("");
      setCreating(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-10 pt-6 pb-28">
      <div className="mx-auto bg-panel rounded-[38px] border border-black/5 shadow-sm p-6">
        <Header name={userName} role={userRole} />
        {banner}

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Boards</h2>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-2 transition"
            >
              + New board
            </button>
          )}
        </div>

        {creating && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-accent/30 bg-white p-3">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") {
                  setName("");
                  setCreating(false);
                }
              }}
              placeholder="Board name…"
              className="flex-1 rounded-xl border border-black/10 px-3.5 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
            <button
              onClick={submit}
              disabled={submitting}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-2 transition disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create"}
            </button>
            <button
              onClick={() => {
                setName("");
                setCreating(false);
              }}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground/60 hover:bg-black/5 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {boards.length === 0 ? (
          <div className="rounded-2xl bg-black/[0.025] border border-dashed border-black/10 p-10 text-center">
            <p className="text-sm font-semibold text-foreground/70">No boards yet</p>
            <p className="text-sm text-muted mt-1">Create your first board to start planning campaigns visually.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                listCount={lists.filter((l) => l.board_id === board.id).length}
                cardCount={cards.filter((c) => lists.some((l) => l.board_id === board.id && l.id === c.list_id)).length}
                basePath={basePath}
                onDelete={onDeleteBoard ? () => onDeleteBoard(board.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <BottomDock active="boards" basePath={basePath} />
    </div>
  );
}
