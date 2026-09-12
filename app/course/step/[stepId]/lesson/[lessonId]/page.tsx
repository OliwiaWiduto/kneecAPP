import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CourseLessonGuard } from "@/components/course/CourseLessonGuard";
import { CourseLessonRunner } from "@/components/course/CourseLessonRunner";
import { getLesson, getStep, lessonTitle } from "@/data/course";
import { courseSteps } from "@/data/course/steps";

type Props = {
  params: Promise<{ stepId: string; lessonId: string }>;
};

export function generateStaticParams() {
  const params: { stepId: string; lessonId: string }[] = [];
  for (const step of courseSteps) {
    for (let n = 1; n <= 10; n += 1) {
      params.push({ stepId: step.id, lessonId: String(n) });
    }
  }
  return params;
}

export default async function CourseLessonPage({ params }: Props) {
  const { stepId, lessonId: lessonIdRaw } = await params;
  const lessonNumber = Number(lessonIdRaw);

  const step = getStep(stepId);
  if (!step || !Number.isFinite(lessonNumber) || lessonNumber < 1 || lessonNumber > 10) {
    notFound();
  }

  if (!step.available) {
    redirect("/course");
  }

  const lesson = getLesson(stepId, lessonNumber);
  if (!lesson) notFound();

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-5 pb-20 pt-8 sm:px-8">
      <div className="mb-8">
        <Link
          href="/course"
          className="text-xs uppercase tracking-[0.25em] text-mute transition hover:text-kneecap-red"
        >
          ← Course path
        </Link>
        <h1 className="mt-3 font-display text-4xl uppercase leading-none text-bone sm:text-5xl">
          {step.number}.{lesson.number} {lessonTitle(lesson.number)}
        </h1>
        <p className="mt-2 text-sm text-bone/65">
          {step.title} · {lesson.exercises.length} exercises
        </p>
      </div>
      <CourseLessonGuard stepId={step.id} lessonNumber={lesson.number}>
        <CourseLessonRunner step={step} lesson={lesson} />
      </CourseLessonGuard>
    </main>
  );
}
