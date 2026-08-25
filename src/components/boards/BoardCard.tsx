"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Board } from "@/types";

export function BoardCard({
  board,
  cardCount,
  listCount,
  basePath = "/app",
  onDelete,
}: {
  board: Board;
  cardCount: number;
  listCount: number;
  basePath?: string;
  onDelete?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmingDelete(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="group relative rounded-[26px] border border-black/5 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
      <Link href={`${basePath}/boards/${board.id}`} className="block">
        <div className="h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 mb-4 flex items-center justify-center">
          <span className="text-2xl font-extrabold text-accent/60">
            {board.name.trim().slice(0, 1).toUpperCase() || "B"}
          </span>
        </div>
        <h3 className="text-sm font-bold text-foreground truncate group-hover:text-accent transition pr-6">
          {board.name || "Untitled board"}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {listCount} {listCount === 1 ? "list" : "lists"} · {cardCount} {cardCount === 1 ? "card" : "cards"}
        </p>
      </Link>

      {onDelete && (
        <div className="absolute top-4 right-4" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="w-6 h-6 rounded-md flex items-center justify-center text-foreground/40 hover:bg-black/5 hover:text-foreground/70 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Board menu"
          >
            ⋯
          </button>
          {menuOpen && (
            <div
              onClick={(e) => e.preventDefault()}
              className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-black/5 p-1.5 z-20"
            >
              {confirmingDelete ? (
                <div className="p-1.5 space-y-2">
                  <p className="text-xs text-foreground/70">Delete this board and everything in it?</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmingDelete(false);
                        setMenuOpen(false);
                      }}
                      className="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-foreground/70 hover:bg-black/5 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="flex-1 rounded-lg bg-red-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmingDelete(true);
                  }}
                  className="block w-full text-left text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg px-3 py-2"
                >
                  Delete board
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
