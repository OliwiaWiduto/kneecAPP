"use client";

import Link from "next/link";
import { useProgress } from "@/components/auth/ProgressProvider";
import { courseSteps, getStepLessons } from "@/data/course";
import {
  isCourseLessonComplete,
  isLessonUnlocked,
  isStepComplete,
  isStepUnlocked,
} from "@/lib/courseProgress";

export function CoursePath() {
  const { completed } = useProgress();

  return (
    <div className="relative mx-auto max-w-xl">
      <div className="absolute bottom-0 left-[1.125rem] top-0 w-px bg-white/10" aria-hidden />

      <ol className="space-y-10">
        {courseSteps.map((step) => {
          const unlocked = isStepUnlocked(completed, step.id);
          const done = isStepComplete(completed, step.id);
          const lessons = getStepLessons(step.id);
          const completedCount = lessons.filter((l) =>
            isCourseLessonComplete(completed, step.id, l.number),
          ).length;

          return (
            <li key={step.id} className="relative pl-12">
              <div
                className={`absolute left-0 top-1 flex h-9 w-9 items-center justify-center border text-xs font-semibold uppercase ${
                  done
                    ? "border-fluoro bg-fluoro/10 text-fluoro"
                    : unlocked
                      ? "border-kneecap-red bg-kneecap-red/20 text-kneecap-red-hot"
                      : "border-white/15 bg-ink-soft text-mute"
                }`}
              >
                {done ? "✓" : step.number}
              </div>

              <div
                className={`border p-4 sm:p-5 ${
                  done
                    ? "border-fluoro/40 bg-fluoro/5"
                    : unlocked
                      ? "border-white/20 bg-black/40"
                      : "border-white/10 bg-ink-soft/80 opacity-60"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl uppercase text-bone">{step.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-mute">
                      Step {step.number}
                      {!step.available ? " · Coming soon" : null}
                    </p>
                  </div>
                  {done ? (
                    <span className="border border-fluoro px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-fluoro">
                      Done
                    </span>
                  ) : unlocked && step.available ? (
                    <span className="text-[10px] uppercase tracking-[0.15em] text-kneecap-red-hot">
                      {completedCount}/10
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-bone/70">{step.blurb}</p>

                {unlocked && step.available ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {lessons.map((lesson) => {
                      const lessonDone = isCourseLessonComplete(completed, step.id, lesson.number);
                      const lessonOpen = isLessonUnlocked(completed, step.id, lesson.number);
                      const href = `/course/step/${step.id}/lesson/${lesson.number}`;

                      if (!lessonOpen) {
                        return (
                          <span
                            key={lesson.id}
                            className="inline-flex h-8 w-8 items-center justify-center border border-white/10 text-[10px] text-mute"
                            title={`${step.number}.${lesson.number} locked`}
                          >
                            {lesson.number}
                          </span>
                        );
                      }

                      return (
                        <Link
                          key={lesson.id}
                          href={href}
                          title={`${step.number}.${lesson.number} ${lesson.title}`}
                          className={`inline-flex h-8 w-8 items-center justify-center border text-[10px] transition ${
                            lessonDone
                              ? "border-fluoro/50 text-fluoro hover:border-fluoro"
                              : "border-kneecap-red/60 text-kneecap-red-hot hover:border-kneecap-red hover:bg-kneecap-red/10"
                          }`}
                        >
                          {lessonDone ? "✓" : lesson.number}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 text-xs uppercase tracking-[0.15em] text-mute">
                    {step.available ? "Complete the previous step to unlock" : "Content coming in phase 2"}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
