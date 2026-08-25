"use client";

import Link from "next/link";
import type { Board } from "@/types";

export function BoardCard({
  board,
  cardCount,
  listCount,
  basePath = "/app",
}: {
  board: Board;
  cardCount: number;
  listCount: number;
  basePath?: string;
}) {
  return (
    <Link
      href={`${basePath}/boards/${board.id}`}
      className="group block rounded-[26px] border border-black/5 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 mb-4 flex items-center justify-center">
        <span className="text-2xl font-extrabold text-accent/60">
          {board.name.trim().slice(0, 1).toUpperCase() || "B"}
        </span>
      </div>
      <h3 className="text-sm font-bold text-foreground truncate group-hover:text-accent transition">
        {board.name || "Untitled board"}
      </h3>
      <p className="mt-1 text-xs text-muted">
        {listCount} {listCount === 1 ? "list" : "lists"} · {cardCount} {cardCount === 1 ? "card" : "cards"}
      </p>
    </Link>
  );
}
