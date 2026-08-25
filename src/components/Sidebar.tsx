import { ScheduleList } from "@/components/ScheduleList";
import { PlatformFilter } from "@/components/PlatformFilter";
import { TeamMemberList } from "@/components/TeamMemberList";
import type { CalendarEvent, Platform, Profile } from "@/types";

export function Sidebar({
  events,
  onSelectEvent,
  selectedPlatforms,
  onTogglePlatform,
  members,
}: {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  selectedPlatforms: Set<Platform>;
  onTogglePlatform: (p: Platform) => void;
  members: Pick<Profile, "id" | "name">[];
}) {
  return (
    <aside className="w-full lg:w-72 shrink-0 bg-panel rounded-[38px] border border-black/5 shadow-sm p-6 flex flex-col gap-8 h-fit lg:sticky lg:top-6">
      <h1 className="text-2xl font-extrabold text-foreground">Schedule</h1>
      <ScheduleList events={events} onSelect={onSelectEvent} />
      <PlatformFilter selected={selectedPlatforms} onToggle={onTogglePlatform} />
      <TeamMemberList members={members} />
    </aside>
  );
}
