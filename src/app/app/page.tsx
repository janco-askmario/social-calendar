"use client";

import { AppTabsShell } from "@/components/AppTabsShell";
import { CalendarSkeleton } from "@/components/skeletons/CalendarSkeleton";
import { useAppShellData } from "@/lib/useAppShellData";

export default function AppCalendarPage() {
  const data = useAppShellData();

  if (!data.supabase) {
    return null; // handled by layout's not-configured screen
  }

  if (data.loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="page-glide-in">
      <AppTabsShell
        defaultTab="calendar"
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
