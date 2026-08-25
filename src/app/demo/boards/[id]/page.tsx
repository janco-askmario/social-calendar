"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { BoardShell } from "@/components/boards/BoardShell";
import { BackToHomeBanner } from "@/components/CalendarShell";
import { useDemoBoards } from "@/components/boards/DemoBoardsProvider";

export default function DemoBoardDetailPage() {
  const params = useParams<{ id: string }>();
  const boardId = params.id;
  const {
    boards,
    lists,
    cards,
    checklist,
    renameBoard,
    addList,
    renameList,
    deleteList,
    reorderList,
    addCard,
    reorderCard,
    deleteCard,
    updateCard,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    deleteChecklist,
  } = useDemoBoards();

  const board = boards.find((b) => b.id === boardId);

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center bg-panel rounded-[28px] border border-black/5 p-8">
          <h1 className="text-lg font-bold text-foreground">Board not found</h1>
          <p className="mt-2 text-sm text-muted">
            It may have been deleted.{" "}
            <Link href="/demo/boards" className="text-accent font-semibold underline">
              Back to boards
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const boardLists = lists.filter((l) => l.board_id === board.id);
  const boardCards = cards.filter((c) => boardLists.some((l) => l.id === c.list_id));
  const cardIds = new Set(boardCards.map((c) => c.id));
  const boardChecklist = checklist.filter((i) => cardIds.has(i.card_id));

  return (
    <div className="page-glide-in">
      <BoardShell
        userName="Demo User"
        userRole="Manager"
        board={board}
        lists={boardLists}
        cards={boardCards}
        checklist={boardChecklist}
        onRenameBoard={(name) => renameBoard(board.id, name)}
        onAddList={(name) => addList(board.id, name)}
        onRenameList={renameList}
        onDeleteList={deleteList}
        onReorderList={reorderList}
        onAddCard={addCard}
        onReorderCard={reorderCard}
        onDeleteCard={deleteCard}
        onUpdateCard={updateCard}
        onAddChecklistItem={addChecklistItem}
        onToggleChecklistItem={toggleChecklistItem}
        onRemoveChecklistItem={removeChecklistItem}
        onDeleteChecklist={deleteChecklist}
        banner={<BackToHomeBanner />}
        basePath="/demo"
      />
    </div>
  );
}
