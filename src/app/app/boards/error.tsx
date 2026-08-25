"use client";

import { useEffect } from "react";

export default function BoardsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center bg-panel rounded-[28px] border border-black/5 p-8">
        <h1 className="text-lg font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">
          This board may have changed while you were viewing it (e.g. a list or card was deleted by someone else).
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-2 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
