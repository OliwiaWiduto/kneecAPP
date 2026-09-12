export { basicsVocab } from "./basics";
export {
  buildStepLessons,
  courseLessonId,
  getLesson,
  getStepLessons,
  getStepSentences,
  parseCourseLessonId,
} from "./buildLessons";
export { lessonTitle } from "./lessonTemplates";
export { courseSentences } from "./sentences";
export { courseSteps } from "./steps";
export type {
  CourseLesson,
  CourseLessonContext,
  CourseSentence,
  CourseStep,
  Exercise,
} from "./types";
export { getAllCourseVocab, getCourseVocab, getCourseVocabList } from "./vocab";

import { courseSteps } from "./steps";

export function getStep(stepId: string) {
  return courseSteps.find((s) => s.id === stepId);
}

export function getStepByNumber(number: number) {
  return courseSteps.find((s) => s.number === number);
}
