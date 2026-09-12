import { buildLessonExercises, lessonTitle } from "./lessonTemplates";
import { courseSentences } from "./sentences";
import { courseSteps } from "./steps";
import type { CourseLesson, CourseStep } from "./types";

export function getStepSentences(stepId: string) {
  return courseSentences.filter((s) => s.stepId === stepId);
}

export function buildStepLessons(step: CourseStep): CourseLesson[] {
  const priorVocabIds = courseSteps
    .filter((s) => s.number < step.number)
    .flatMap((s) => s.vocabIds);

  const sentences = getStepSentences(step.id);

  return Array.from({ length: 10 }, (_, i) => {
    const number = i + 1;
    const pad = String(number).padStart(2, "0");
    return {
      id: `${step.id}-lesson-${pad}`,
      stepId: step.id,
      number,
      title: lessonTitle(number),
      exercises: buildLessonExercises(step, number, step.vocabIds, priorVocabIds, sentences),
    };
  });
}

const lessonsByStep = new Map<string, CourseLesson[]>(
  courseSteps.map((step) => [step.id, buildStepLessons(step)]),
);

export function getStepLessons(stepId: string): CourseLesson[] {
  return lessonsByStep.get(stepId) ?? [];
}

export function getLesson(stepId: string, lessonNumber: number): CourseLesson | undefined {
  return getStepLessons(stepId).find((l) => l.number === lessonNumber);
}

export function courseLessonId(stepId: string, lessonNumber: number): string {
  const pad = String(lessonNumber).padStart(2, "0");
  return `course:${stepId}:lesson-${pad}`;
}

export function parseCourseLessonId(id: string): { stepId: string; lessonNumber: number } | null {
  const match = /^course:(step-\d{2}):lesson-(\d{2})$/.exec(id);
  if (!match) return null;
  return { stepId: match[1], lessonNumber: Number(match[2]) };
}
