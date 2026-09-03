import { UserMenu } from "@/components/UserMenu";

export function Header({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-extrabold text-foreground">Social Media Calendar</h1>
      <UserMenu name={name} role={role} />
    </div>
  );
}
