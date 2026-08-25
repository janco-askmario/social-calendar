import { UserMenu } from "@/components/UserMenu";
import { LiquidNavLinks } from "@/components/LiquidNavLinks";

export function Header({
  name,
  role,
  active = "calendar",
  basePath = "/app",
}: {
  name: string;
  role: string;
  active?: "calendar" | "boards";
  basePath?: string;
}) {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5">
        <h1 className="text-xl font-extrabold text-foreground">Social Media Calendar</h1>
        <LiquidNavLinks
          active={active}
          items={[
            { value: "calendar", label: "Calendar", href: basePath },
            { value: "boards", label: "Boards", href: `${basePath}/boards` },
          ]}
        />
      </div>
      <UserMenu name={name} role={role} />
    </div>
  );
}
