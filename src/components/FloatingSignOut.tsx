"use client";

import { SignOutLink } from "@/components/SignOutLink";

export function FloatingSignOut() {
  return (
    <div className="fixed bottom-5 left-5 z-40">
      <SignOutLink className="flex items-center gap-2 rounded-full bg-panel border border-black/5 shadow-md px-4 py-2.5 text-sm font-semibold text-foreground/70 hover:text-red-600 hover:shadow-lg transition" />
    </div>
  );
}
