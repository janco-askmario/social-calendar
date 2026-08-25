"use client";

import { BoardsShell } from "@/components/boards/BoardsShell";
import { BackToHomeBanner } from "@/components/CalendarShell";
import { useDemoBoards } from "@/components/boards/DemoBoardsProvider";

export default function DemoBoardsPage() {
  const { boards, lists, cards, createBoard, deleteBoard } = useDemoBoards();

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
      onDeleteBoard={deleteBoard}
      banner={<BackToHomeBanner />}
      basePath="/demo"
    />
  );
}
