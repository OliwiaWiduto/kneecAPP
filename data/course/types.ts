import type { VocabItem } from "@/data/songs";

export type CourseSentence = {
  id: string;
  stepId: string;
  ga: string;
  en: string;
  blankWord?: string;
};

export type CourseStep = {
  id: string;
  number: number;
  title: string;
  blurb: string;
  theme: string;
  vocabIds: string[];
  songRefs?: string[];
  /** When false, step is visible but not playable yet. */
  available: boolean;
};

export type Exercise =
  | { type: "learn"; vocabId: string }
  | { type: "match"; vocabIds: string[] }
  | { type: "picture"; vocabId: string }
  | { type: "listen"; vocabId: string; mode: "ga-to-en" | "en-to-ga" }
  | { type: "translate"; vocabId: string; direction: "ga-en" | "en-ga" }
  | { type: "type"; vocabId: string }
  | { type: "order"; vocabId?: string; sentenceId?: string }
  | { type: "fillBlank"; sentenceId: string }
  | { type: "sentenceBuild"; sentenceId: string }
  | { type: "review"; vocabIds: string[] }
  | { type: "boss"; vocabIds: string[] };

export type CourseLesson = {
  id: string;
  stepId: string;
  number: number;
  title: string;
  exercises: Exercise[];
};

export type CourseLessonContext = {
  step: CourseStep;
  lesson: CourseLesson;
  vocab: VocabItem[];
  allVocab: VocabItem[];
  sentences: CourseSentence[];
};
