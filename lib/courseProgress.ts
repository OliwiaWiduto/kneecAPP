import {
  courseLessonId,
  courseSteps,
  getStep,
  getStepLessons,
  parseCourseLessonId,
} from "@/data/course";

export function isCourseLessonComplete(completed: string[], stepId: string, lessonNumber: number): boolean {
  return completed.includes(courseLessonId(stepId, lessonNumber));
}

export function isStepComplete(completed: string[], stepId: string): boolean {
  return isCourseLessonComplete(completed, stepId, 10);
}

export function isStepUnlocked(completed: string[], stepId: string): boolean {
  const step = getStep(stepId);
  if (!step?.available) return false;
  if (step.number === 1) return true;
  const prior = courseSteps.find((s) => s.number === step.number - 1);
  if (!prior) return false;
  return isStepComplete(completed, prior.id);
}

export function isLessonUnlocked(completed: string[], stepId: string, lessonNumber: number): boolean {
  if (!isStepUnlocked(completed, stepId)) return false;
  if (lessonNumber === 1) return true;
  return isCourseLessonComplete(completed, stepId, lessonNumber - 1);
}

export function getCompletedCourseLessons(completed: string[]): string[] {
  return completed.filter((id) => id.startsWith("course:"));
}

export function getCourseProgressSummary(completed: string[]) {
  const completedSteps = courseSteps.filter((s) => isStepComplete(completed, s.id)).length;
  const totalSteps = courseSteps.length;

  let currentStep = courseSteps[0];
  for (const step of courseSteps) {
    if (!isStepUnlocked(completed, step.id)) break;
    if (!isStepComplete(completed, step.id)) {
      currentStep = step;
      break;
    }
    currentStep = step;
  }

  const stepLessons = getStepLessons(currentStep.id);
  const completedInStep = stepLessons.filter((l) =>
    isCourseLessonComplete(completed, currentStep.id, l.number),
  ).length;

  const courseDone = completedSteps >= totalSteps && isStepComplete(completed, courseSteps[totalSteps - 1].id);

  return {
    completedSteps,
    totalSteps,
    currentStep,
    completedInStep,
    lessonsInStep: stepLessons.length,
    courseDone,
  };
}

export function nextLessonHref(completed: string[]): string | null {
  for (const step of courseSteps) {
    if (!isStepUnlocked(completed, step.id)) continue;
    const lessons = getStepLessons(step.id);
    for (const lesson of lessons) {
      if (!isCourseLessonComplete(completed, step.id, lesson.number)) {
        return `/course/step/${step.id}/lesson/${lesson.number}`;
      }
    }
  }
  return null;
}

export { parseCourseLessonId, courseLessonId };
