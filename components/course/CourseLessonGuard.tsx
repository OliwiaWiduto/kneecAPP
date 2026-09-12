"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProgress } from "@/components/auth/ProgressProvider";
import { isLessonUnlocked } from "@/lib/courseProgress";

export function CourseLessonGuard({
  stepId,
  lessonNumber,
  children,
}: {
  stepId: string;
  lessonNumber: number;
  children: React.ReactNode;
}) {
  const { completed, ready } = useProgress();
  const router = useRouter();
  const unlocked = isLessonUnlocked(completed, stepId, lessonNumber);

  useEffect(() => {
    if (ready && !unlocked) router.replace("/course");
  }, [ready, unlocked, router]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center text-sm uppercase tracking-[0.2em] text-mute">
        Loading…
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm text-bone/70">This lesson is locked.</p>
        <Link
          href="/course"
          className="mt-6 inline-block border border-kneecap-red px-5 py-3 text-xs uppercase tracking-[0.2em] text-kneecap-red-hot"
        >
          Back to path
        </Link>
      </div>
    );
  }

  return children;
}
