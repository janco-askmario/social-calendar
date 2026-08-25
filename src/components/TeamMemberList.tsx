import type { Profile } from "@/types";

export function TeamMemberList({ members }: { members: Pick<Profile, "id" | "name">[] }) {
  return (
    <div>
      <h2 className="text-xs font-bold tracking-wider text-muted uppercase mb-3">Team member</h2>
      {members.length === 0 ? (
        <p className="text-sm text-muted">No teammates yet.</p>
      ) : (
        <div className="flex flex-wrap -space-x-2">
          {members.map((m) => {
            const initials = m.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <div
                key={m.id}
                title={m.name}
                className="w-9 h-9 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center border-2 border-white"
              >
                {initials || "?"}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
