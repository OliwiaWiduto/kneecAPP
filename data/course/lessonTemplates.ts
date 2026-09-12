import type { CourseSentence, CourseStep, Exercise } from "./types";

const LESSON_TITLES = [
  "Meet the words",
  "Match up",
  "Ear training",
  "Translate out",
  "Translate in",
  "First sentences",
  "Build it",
  "Spell it",
  "Mix & spiral",
  "Step boss",
];

export function lessonTitle(number: number): string {
  return LESSON_TITLES[number - 1] ?? `Lesson ${number}`;
}

export function buildLessonExercises(
  step: CourseStep,
  lessonNumber: number,
  stepVocabIds: string[],
  priorVocabIds: string[],
  sentences: CourseSentence[],
): Exercise[] {
  const v = stepVocabIds;
  const pick = (i: number) => v[i % v.length];
  const pick2 = (i: number) => v[(i + 1) % v.length];
  const pick3 = (i: number) => v[(i + 2) % v.length];
  const sentence = sentences[0];
  const sentence2 = sentences[1] ?? sentences[0];
  const sentenceBoss = sentences[sentences.length - 1] ?? sentences[0];

  switch (lessonNumber) {
    case 1:
      return [
        ...v.slice(0, 4).map((id) => ({ type: "learn" as const, vocabId: id })),
        { type: "listen", vocabId: pick(0), mode: "ga-to-en" },
        { type: "listen", vocabId: pick2(1), mode: "ga-to-en" },
      ];
    case 2:
      return [
        { type: "match", vocabIds: v.slice(0, Math.min(4, v.length)) },
        { type: "picture", vocabId: pick(0) },
        { type: "picture", vocabId: pick2(2) },
      ];
    case 3:
      return v.slice(0, Math.min(5, v.length)).map((id) => ({
        type: "listen" as const,
        vocabId: id,
        mode: "ga-to-en" as const,
      }));
    case 4:
      return v.slice(0, Math.min(4, v.length)).map((id) => ({
        type: "translate" as const,
        vocabId: id,
        direction: "ga-en" as const,
      }));
    case 5:
      return v.slice(0, Math.min(4, v.length)).map((id) => ({
        type: "translate" as const,
        vocabId: id,
        direction: "en-ga" as const,
      }));
    case 6:
      return [
        { type: "order", vocabId: pick(0) },
        { type: "order", vocabId: pick2(1) },
        ...(sentence
          ? [{ type: "sentenceBuild" as const, sentenceId: sentence.id }]
          : [{ type: "order" as const, vocabId: pick3(2) }]),
      ];
    case 7:
      return [
        ...(sentence2
          ? [
              { type: "order" as const, sentenceId: sentence2.id },
              { type: "fillBlank" as const, sentenceId: sentence2.id },
            ]
          : [
              { type: "order" as const, vocabId: pick(3) },
              { type: "order" as const, vocabId: pick2(4) },
            ]),
        { type: "order", vocabId: pick(5) },
      ];
    case 8:
      return v.slice(0, Math.min(4, v.length)).map((id) => ({
        type: "type" as const,
        vocabId: id,
      }));
    case 9: {
      const spiral = [...new Set([...v, ...priorVocabIds.slice(-3)])];
      return [{ type: "review", vocabIds: spiral.slice(0, Math.min(6, spiral.length)) }];
    }
    case 10:
      return [
        { type: "boss", vocabIds: v },
        ...(sentenceBoss
          ? [{ type: "sentenceBuild" as const, sentenceId: sentenceBoss.id }]
          : []),
      ];
    default:
      return [{ type: "learn", vocabId: pick(0) }];
  }
}
