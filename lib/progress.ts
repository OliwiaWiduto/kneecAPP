const XP_KEY = "kneecapp-xp";
const STREAK_KEY = "kneecapp-streak";
const COMPLETED_KEY = "kneecapp-completed";
const LAST_PLAY_KEY = "kneecapp-last-play";
const OWNER_KEY = "kneecapp-owner";

export type ProgressSnapshot = {
  xp: number;
  streak: number;
  lastPlayDate: string | null;
  completedLessons: string[];
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().slice(0, 10);
}

function readNumber(key: string, fallback = 0): number {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  const n = raw ? Number(raw) : fallback;
  return Number.isFinite(n) ? n : fallback;
}

export function emptyProgress(): ProgressSnapshot {
  return { xp: 0, streak: 0, lastPlayDate: null, completedLessons: [] };
}

export function getProgressOwner(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(OWNER_KEY);
}

export function setProgressOwner(owner: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OWNER_KEY, owner);
}

export function readLocalProgress(): ProgressSnapshot {
  if (typeof window === "undefined") return emptyProgress();
  return {
    xp: readNumber(XP_KEY),
    streak: readNumber(STREAK_KEY),
    lastPlayDate: window.localStorage.getItem(LAST_PLAY_KEY),
    completedLessons: getCompletedLessons(),
  };
}

export function writeLocalProgress(snapshot: ProgressSnapshot): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(XP_KEY, String(snapshot.xp));
  window.localStorage.setItem(STREAK_KEY, String(snapshot.streak));
  window.localStorage.setItem(COMPLETED_KEY, JSON.stringify(snapshot.completedLessons));
  if (snapshot.lastPlayDate) {
    window.localStorage.setItem(LAST_PLAY_KEY, snapshot.lastPlayDate);
  } else {
    window.localStorage.removeItem(LAST_PLAY_KEY);
  }
}

export function getXp(): number {
  return readLocalProgress().xp;
}

export function getStreak(): number {
  return readLocalProgress().streak;
}

export function getCompletedLessons(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMPLETED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function bumpStreakOn(snapshot: ProgressSnapshot): ProgressSnapshot {
  const today = todayISO();
  if (snapshot.lastPlayDate === today) return snapshot;

  const streak = snapshot.lastPlayDate === yesterdayISO() ? snapshot.streak + 1 : 1;
  return { ...snapshot, streak, lastPlayDate: today };
}

export function completeLessonOn(snapshot: ProgressSnapshot, songId: string): ProgressSnapshot {
  const completed = new Set(snapshot.completedLessons);
  completed.add(songId);
  const bumped = bumpStreakOn(snapshot);
  return {
    ...bumped,
    completedLessons: [...completed],
    xp: bumped.xp + 120,
  };
}

export function mergeProgress(
  local: ProgressSnapshot,
  remote: ProgressSnapshot,
): ProgressSnapshot {
  const completedLessons = [...new Set([...local.completedLessons, ...remote.completedLessons])];
  const xp = Math.max(local.xp, remote.xp);
  const localDate = local.lastPlayDate ?? "";
  const remoteDate = remote.lastPlayDate ?? "";

  let streak = remote.streak;
  let lastPlayDate = remote.lastPlayDate;

  if (localDate && localDate > remoteDate) {
    streak = local.streak;
    lastPlayDate = local.lastPlayDate;
  } else if (localDate === remoteDate) {
    streak = Math.max(local.streak, remote.streak);
    lastPlayDate = local.lastPlayDate ?? remote.lastPlayDate;
  } else if (!remoteDate && localDate) {
    streak = local.streak;
    lastPlayDate = local.lastPlayDate;
  }

  return { xp, streak, lastPlayDate, completedLessons };
}

export function markLessonComplete(songId: string): ProgressSnapshot {
  const next = completeLessonOn(readLocalProgress(), songId);
  writeLocalProgress(next);
  return next;
}

export const SONG_LESSON_XP = 120;
export const COURSE_LESSON_XP = 40;
export const COURSE_BOSS_BONUS = 80;

export function isCourseLessonId(id: string): boolean {
  return id.startsWith("course:");
}

export function courseLessonXp(isBoss: boolean): number {
  return COURSE_LESSON_XP + (isBoss ? COURSE_BOSS_BONUS : 0);
}

export function completeCourseLessonOn(
  snapshot: ProgressSnapshot,
  lessonId: string,
  isBoss = false,
): ProgressSnapshot {
  const completed = new Set(snapshot.completedLessons);
  completed.add(lessonId);
  const bumped = bumpStreakOn(snapshot);
  return {
    ...bumped,
    completedLessons: [...completed],
    xp: bumped.xp + courseLessonXp(isBoss),
  };
}
