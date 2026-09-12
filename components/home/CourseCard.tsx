"use client";

import Link from "next/link";
import { useProgress } from "@/components/auth/ProgressProvider";
import { getCourseProgressSummary, nextLessonHref } from "@/lib/courseProgress";

export function CourseCard() {
  const { completed } = useProgress();
  const summary = getCourseProgressSummary(completed);
  const continueHref = nextLessonHref(completed) ?? "/course/step/step-01/lesson/1";

  return (
    <article className="group relative overflow-hidden border border-l-4 border-white/15 border-l-fluoro bg-ink-soft transition duration-300 hover:border-kneecap-red hover:border-l-fluoro">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-kneecap-red/30 via-ink-soft to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(57,255,20,0.12),transparent_55%)]" />
        <div className="absolute left-4 top-4 border border-fluoro/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-fluoro">
          Cúrsa
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-display text-3xl uppercase leading-none text-bone sm:text-4xl">
            Learn Irish
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-bone/60">
            10 steps · Duolingo-style
          </p>
        </div>
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-xl uppercase leading-none text-bone">Irish Course</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-mute">
              Kneecap words + basics
            </p>
          </div>
          {summary.courseDone ? (
            <span className="border border-fluoro px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-fluoro">
              Done
            </span>
          ) : summary.completedSteps > 0 || summary.completedInStep > 0 ? (
            <span className="border border-kneecap-red/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-kneecap-red-hot">
              {summary.completedSteps}/{summary.totalSteps} steps
            </span>
          ) : (
            <span className="border border-fluoro/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-fluoro">
              Start here
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-bone/70">
          A 10-step path from hello to full sentences — built off Kneecap lyrics and street Irish.
        </p>
        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <Link
            href={continueHref}
            className="inline-flex flex-1 items-center justify-center border border-kneecap-red bg-kneecap-red px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-kneecap-red-hot"
          >
            {summary.completedInStep > 0 && !summary.courseDone ? "Continue" : "Start course"}
          </Link>
          <Link
            href="/course"
            className="inline-flex flex-1 items-center justify-center border border-white/25 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-bone transition hover:border-fluoro hover:text-fluoro"
          >
            Path
          </Link>
        </div>
      </div>
    </article>
  );
}
