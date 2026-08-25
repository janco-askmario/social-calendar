"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormField, NotConfiguredNotice, inputClass, primaryButtonClass } from "@/components/AuthShell";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!supabase) {
    return <NotConfiguredNotice />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase!
        .from("profiles")
        .select("approved")
        .eq("id", data.user.id)
        .single();

      if (!profile?.approved) {
        router.push("/awaiting-approval");
        return;
      }
    }

    const redirectedFrom = params.get("redirectedFrom");
    router.push(redirectedFrom || "/app");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {error}
        </div>
      )}
      <FormField label="Email">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@company.com"
        />
      </FormField>
      <FormField label="Password">
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="••••••••"
        />
      </FormField>
      <div className="flex justify-end -mt-1">
        <Link href="/forgot-password" className="text-xs font-semibold text-accent hover:text-accent-2">
          Forgot password?
        </Link>
      </div>
      <button type="submit" disabled={loading} className={primaryButtonClass}>
        {loading ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-accent hover:text-accent-2">
          Create account
        </Link>
      </p>
    </form>
  );
}
