import Link from "next/link";
import clsx from "clsx";
import { UserMenu } from "@/components/UserMenu";

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
        <nav className="flex items-center gap-1 bg-black/[0.03] rounded-full p-1">
          <Link
            href={basePath}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              active === "calendar" ? "bg-white text-accent shadow-sm" : "text-foreground/60 hover:text-foreground"
            )}
          >
            Calendar
          </Link>
          <Link
            href={`${basePath}/boards`}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              active === "boards" ? "bg-white text-accent shadow-sm" : "text-foreground/60 hover:text-foreground"
            )}
          >
            Boards
          </Link>
        </nav>
      </div>
      <UserMenu name={name} role={role} />
    </div>
  );
}
