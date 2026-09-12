"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Mode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const supabase = tryCreateBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured yet. Add your project keys to .env.local.");
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (mode === "signup" && trimmedName.length < 2) {
      setError("Pick a name so the streak sits against you.");
      return;
    }
    if (password.length < 6) {
      setError("Password needs at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const origin = window.location.origin;
        const { data, error: signError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { display_name: trimmedName },
            emailRedirectTo: `${origin}/auth/callback`,
          },
        });
        if (signError) {
          setError(signError.message);
          return;
        }
        if (!data.session) {
          setInfo("Check your email to confirm the account, then sign in.");
          return;
        }
        router.push("/");
        router.refresh();
        return;
      }

      const { error: signError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="border border-white/15 bg-ink-soft p-6 text-sm leading-relaxed text-bone/75">
        <p className="font-display text-lg uppercase text-bone">Supabase is not wired yet</p>
        <p className="mt-3">
          Create a project at supabase.com, then put{" "}
          <code className="text-fluoro">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-fluoro">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in{" "}
          <code className="text-fluoro">.env.local</code>. Run the SQL in{" "}
          <code className="text-fluoro">supabase/migrations/</code> so streaks save against each
          name.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div className="flex border border-white/15">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 px-4 py-2 text-xs uppercase tracking-[0.18em] ${
            mode === "signin" ? "bg-kneecap-red text-white" : "text-mute hover:text-bone"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 px-4 py-2 text-xs uppercase tracking-[0.18em] ${
            mode === "signup" ? "bg-kneecap-red text-white" : "text-mute hover:text-bone"
          }`}
        >
          Sign up
        </button>
      </div>

      {mode === "signup" ? (
        <label className="block space-y-1.5 text-xs uppercase tracking-[0.16em] text-mute">
          Name
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-white/20 bg-ink px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-fluoro"
            placeholder="Your name"
          />
        </label>
      ) : null}

      <label className="block space-y-1.5 text-xs uppercase tracking-[0.16em] text-mute">
        Email
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-white/20 bg-ink px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-fluoro"
          placeholder="you@example.com"
        />
      </label>

      <label className="block space-y-1.5 text-xs uppercase tracking-[0.16em] text-mute">
        Password
        <input
          required
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-white/20 bg-ink px-3 py-2.5 text-sm normal-case tracking-normal text-bone outline-none focus:border-fluoro"
          placeholder="At least 6 characters"
        />
      </label>

      {error ? <p className="text-sm text-kneecap-red-hot">{error}</p> : null}
      {info ? <p className="text-sm text-fluoro">{info}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full border border-kneecap-red bg-kneecap-red px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-kneecap-red-hot disabled:opacity-60"
      >
        {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
