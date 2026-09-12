"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "@/components/auth/ProgressProvider";
export function AuthBar() {
  const pathname = usePathname();
  const { configured, ready, user, streak, signOut } = useProgress();
  const onLogin = pathname === "/login";

  return (
    <nav className="font-elite sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/10 bg-ink/85 px-5 py-3 backdrop-blur-sm sm:px-8">
      <Link href="/" className="flex shrink-0 items-center" aria-label="kneecapp home">
        <img src="/kneecap-mark.png" alt="" width={32} height={32} className="h-8 w-8" />
      </Link>
      <div className="flex min-h-7 flex-wrap items-center justify-end gap-x-4 gap-y-1 text-xs uppercase tracking-[0.16em]">
        {!ready ? (
          <span className="inline-block h-7 w-36" aria-hidden />
        ) : user ? (
          <>
            <span className="text-fluoro">{user.displayName}</span>
            <span className="text-mute">
              <span className="text-kneecap-red-hot">{streak}</span> day streak
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-mute transition hover:text-bone"
            >
              Sign out
            </button>
          </>
        ) : onLogin ? null : configured ? (
          <Link
            href="/login"
            className="border border-white/20 px-3 py-1.5 text-bone transition hover:border-fluoro hover:text-fluoro"
          >
            Sign in to keep streak
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-mute transition hover:text-bone"
          >
            Set up sign-in
          </Link>
        )}
      </div>
    </nav>
  );
}
