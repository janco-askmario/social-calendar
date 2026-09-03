"use client";

import { AppTabsShell } from "@/components/AppTabsShell";
import { BoardsListSkeleton } from "@/components/skeletons/BoardsListSkeleton";
import { useAppShellData } from "@/lib/useAppShellData";

export default function BoardsPage() {
  const data = useAppShellData();

  if (!data.supabase) return null;

  if (data.loading) {
    return <BoardsListSkeleton />;
  }

  return (
    <div className="page-glide-in">
      <AppTabsShell
        defaultTab="boards"
        profile={data.profile}
        events={data.events}
        members={data.members}
        onCreate={data.handleCreate}
        onUpdate={data.handleUpdate}
        onDelete={data.handleDelete}
        boards={data.boards}
        lists={data.lists}
        cards={data.cards}
        onCreateBoard={data.handleCreateBoard}
        onDeleteBoard={data.handleDeleteBoard}
        error={data.error}
      />
    </div>
  );
}
