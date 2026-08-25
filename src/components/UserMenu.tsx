"use client";

import { useState, useRef, useEffect } from "react";
import { SignOutLink } from "@/components/SignOutLink";

export function UserMenu({ name, role }: { name: string; role: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-foreground leading-tight">{name}</p>
          <p className="text-xs text-muted leading-tight">{role}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-sm">
          {initials || "?"}
        </div>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-black/5 p-2 z-10">
          <SignOutLink className="block w-full text-left text-sm font-semibold text-foreground/80 hover:bg-black/5 rounded-lg px-3 py-2" />
        </div>
      )}
    </div>
  );
}
