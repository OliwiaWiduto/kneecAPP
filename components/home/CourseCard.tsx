"use client";

import Link from "next/link";
import { useProgress } from "@/components/auth/ProgressProvider";
import { getCourseProgressSummary, nextLessonHref } from "@/lib/courseProgress";

export function CourseCard() {
  const { completed } = useProgress();
  const summary = getCourseProgressSummary(completed);
  const continueHref = nextLessonHref(completed) ?? "/course/step/step-01/lesson/1";

  return (
    <article className="group relative overflow-hidden border border-white/15 bg-ink-soft transition duration-300 hover:border-fluoro">
      <Link
        href={continueHref}
        className="absolute inset-0 z-10"
        aria-label="Start free Irish course"
      />
      <div className="relative aspect-video w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/course-card-bg.jpg"
          alt=""
          className="h-full w-full object-cover object-center grayscale transition duration-500 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute left-4 top-4 border border-white/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-bone">
          Cúrsa
        </div>
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-xl uppercase leading-none text-bone">Free Irish Course</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-mute">
              duolingo on craic
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
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-bone/70">
          A 10-step path from hello to full sentences — built off Kneecap lyrics and street Irish.
        </p>
        <div className="relative z-20 pt-1">
          <Link
            href={continueHref}
            className="inline-flex w-full items-center justify-center border border-fluoro bg-fluoro px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-fluoro/90"
          >
            Start
          </Link>
        </div>
      </div>
    </article>
  );
}
