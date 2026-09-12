"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  completeCourseLessonOn,
  completeLessonOn,
  getProgressOwner,
  mergeProgress,
  readLocalProgress,
  setProgressOwner,
  writeLocalProgress,
  type ProgressSnapshot,
} from "@/lib/progress";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Profile } from "@/lib/supabase/types";

export type AuthUser = {
  id: string;
  displayName: string;
  email: string;
};

type ProgressContextValue = {
  ready: boolean;
  configured: boolean;
  user: AuthUser | null;
  xp: number;
  streak: number;
  completed: string[];
  completeLesson: (songId: string) => Promise<void>;
  completeCourseLesson: (lessonId: string, isBoss?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function displayNameFromUser(user: User, profile?: Profile | null): string {
  const meta = user.user_metadata?.display_name;
  const fromMeta = typeof meta === "string" ? meta.trim() : "";
  const fromProfile = profile?.display_name?.trim() ?? "";
  const fromEmail = user.email?.split("@")[0] ?? "";
  return fromProfile || fromMeta || fromEmail || "learner";
}

function snapshotFromProfile(profile: Profile | null | undefined): ProgressSnapshot {
  if (!profile) {
    return { xp: 0, streak: 0, lastPlayDate: null, completedLessons: [] };
  }
  return {
    xp: profile.xp ?? 0,
    streak: profile.streak ?? 0,
    lastPlayDate: profile.last_play_date,
    completedLessons: Array.isArray(profile.completed_lessons)
      ? profile.completed_lessons.map(String)
      : [],
  };
}

async function persistProfile(
  user: User,
  snapshot: ProgressSnapshot,
  displayName: string,
) {
  const supabase = tryCreateBrowserClient();
  if (!supabase) return;
  await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
    xp: snapshot.xp,
    streak: snapshot.streak,
    last_play_date: snapshot.lastPlayDate,
    completed_lessons: snapshot.completedLessons,
    updated_at: new Date().toISOString(),
  });
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  const applySnapshot = useCallback((snapshot: ProgressSnapshot) => {
    writeLocalProgress(snapshot);
    setXp(snapshot.xp);
    setStreak(snapshot.streak);
    setCompleted(snapshot.completedLessons);
  }, []);

  useEffect(() => {
    const local = readLocalProgress();
    applySnapshot(local);

    const supabase = tryCreateBrowserClient();
    if (!supabase) {
      setReady(true);
      return;
    }
    const client = supabase;

    let cancelled = false;

    async function hydrate(nextUser: User | null) {
      if (cancelled) return;

      if (!nextUser) {
        setUser(null);
        setProgressOwner("guest");
        setReady(true);
        return;
      }

      const { data: profile } = await client
        .from("profiles")
        .select("*")
        .eq("id", nextUser.id)
        .maybeSingle();

      if (cancelled) return;

      const displayName = displayNameFromUser(nextUser, profile);
      const remote = snapshotFromProfile(profile);
      const owner = getProgressOwner();
      const localProgress = readLocalProgress();
      const canMergeGuest = !owner || owner === "guest" || owner === nextUser.id;
      const merged = canMergeGuest ? mergeProgress(localProgress, remote) : remote;

      setProgressOwner(nextUser.id);
      applySnapshot(merged);
      setUser({
        id: nextUser.id,
        displayName,
        email: nextUser.email ?? "",
      });
      await persistProfile(nextUser, merged, displayName);
      if (!cancelled) setReady(true);
    }

    void client.auth.getUser().then(({ data }) => hydrate(data.user));

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void hydrate(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [applySnapshot]);

  const completeLesson = useCallback(
    async (songId: string) => {
      const next = completeLessonOn(readLocalProgress(), songId);
      applySnapshot(next);

      const supabase = tryCreateBrowserClient();
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      await persistProfile(data.user, next, user?.displayName || displayNameFromUser(data.user));
    },
    [applySnapshot, user?.displayName],
  );

  const completeCourseLesson = useCallback(
    async (lessonId: string, isBoss = false) => {
      const next = completeCourseLessonOn(readLocalProgress(), lessonId, isBoss);
      applySnapshot(next);

      const supabase = tryCreateBrowserClient();
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      await persistProfile(data.user, next, user?.displayName || displayNameFromUser(data.user));
    },
    [applySnapshot, user?.displayName],
  );

  const signOut = useCallback(async () => {
    const supabase = tryCreateBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProgressOwner("guest");
  }, []);

  const value = useMemo(
    () => ({
      ready,
      configured,
      user,
      xp,
      streak,
      completed,
      completeLesson,
      completeCourseLesson,
      signOut,
    }),
    [ready, configured, user, xp, streak, completed, completeLesson, completeCourseLesson, signOut],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return ctx;
}
