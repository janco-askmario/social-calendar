"use client";

import { useEffect, useRef, useState } from "react";

export function ListHeader({
  name,
  cardCount,
  onRename,
  onDelete,
  onDragPointerDown,
}: {
  name: string;
  cardCount: number;
  onRename: (name: string) => void;
  onDelete: () => void;
  onDragPointerDown: (e: React.PointerEvent) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep the local edit buffer in sync when the list is renamed elsewhere (e.g. another user via realtime)
    setValue(name);
  }, [name]);

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

  function commit() {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) onRename(trimmed);
    else setValue(name);
  }

  return (
    <div
      onPointerDown={onDragPointerDown}
      className="group/handle flex flex-col cursor-grab active:cursor-grabbing touch-none select-none"
    >
      <div className="flex justify-center pt-1.5 pb-0.5">
        <span
          aria-hidden
          className="h-1 w-9 rounded-full bg-black/10 group-hover/handle:bg-black/20 transition-colors"
        />
      </div>
      <div className="flex items-start justify-between gap-2 px-3 pt-1 pb-2">
        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setValue(name);
                setEditing(false);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 rounded-lg border border-accent/40 bg-white px-2 py-1 text-sm font-bold text-foreground outline-none"
          />
        ) : (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setEditing(true)}
            className="flex-1 min-w-0 text-left text-sm font-bold text-foreground truncate hover:text-accent transition"
          >
            {name} <span className="text-muted font-semibold">{cardCount}</span>
          </button>
        )}

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setMenuOpen((o) => !o)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-foreground/50 hover:bg-black/5 transition"
            aria-label="List menu"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-black/5 p-1.5 z-20">
              {confirmingDelete ? (
                <div className="p-1.5 space-y-2">
                  <p className="text-xs text-foreground/70">
                    Delete this list and all its cards?
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      className="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-foreground/70 hover:bg-black/5 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onDelete}
                      className="flex-1 rounded-lg bg-red-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setEditing(true);
                    }}
                    className="block w-full text-left text-sm font-semibold text-foreground/80 hover:bg-black/5 rounded-lg px-3 py-2"
                  >
                    Rename list
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="block w-full text-left text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg px-3 py-2"
                  >
                    Delete list
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
