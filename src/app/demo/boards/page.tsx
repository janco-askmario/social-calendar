"use client";

import { BoardsShell } from "@/components/boards/BoardsShell";
import { BackToHomeBanner } from "@/components/CalendarShell";
import { useDemoBoards } from "@/components/boards/DemoBoardsProvider";

export default function DemoBoardsPage() {
  const { boards, lists, cards, createBoard } = useDemoBoards();

  return (
    <BoardsShell
      userName="Demo User"
      userRole="Manager"
      boards={boards}
      lists={lists}
      cards={cards}
      onCreateBoard={(name) => {
        createBoard(name);
      }}
      banner={<BackToHomeBanner />}
      basePath="/demo"
    />
  );
}
