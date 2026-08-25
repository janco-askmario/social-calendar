import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center bg-panel rounded-[28px] border border-black/5 p-8">
          <h1 className="text-lg font-bold text-foreground">Supabase is not configured</h1>
          <p className="mt-2 text-sm text-muted">
            Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            to use the calendar app, or try the <a href="/demo" className="text-accent font-semibold">demo</a>.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase!
    .from("profiles")
    .select("approved")
    .eq("id", user.id)
    .single();

  if (!profile?.approved) redirect("/awaiting-approval");

  return <>{children}</>;
}
