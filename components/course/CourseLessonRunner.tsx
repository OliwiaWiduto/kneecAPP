"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "@/components/auth/ProgressProvider";
import {
  BossRound,
  LearnWord,
  ListenPick,
  MatchGame,
  OrderWords,
  PictureMatch,
  ReviewRound,
  SentenceFillBlank,
  TranslateVocab,
  TypeWord,
  type Feedback,
} from "@/components/learn/games";
import {
  courseLessonId,
  getCourseVocab,
  getCourseVocabList,
  getStepSentences,
  type CourseLesson,
  type CourseStep,
  type Exercise,
} from "@/data/course";
import { courseLessonXp } from "@/lib/progress";

type Props = {
  step: CourseStep;
  lesson: CourseLesson;
};

export function CourseLessonRunner({ step, lesson }: Props) {
  const { completeCourseLesson, user, configured } = useProgress();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const stepVocab = useMemo(() => getCourseVocabList(step.vocabIds), [step.vocabIds]);
  const sentences = useMemo(() => getStepSentences(step.id), [step.id]);
  const exercises = lesson.exercises;

  const total = exercises.length;
  const exercise = exercises[exerciseIndex];
  const isBossLesson = lesson.number === 10;
  const xpEarned = courseLessonXp(isBossLesson);

  function goNext(correct: boolean) {
    if (!correct) {
      setFeedback("wrong");
      window.setTimeout(() => setFeedback("idle"), 700);
      return;
    }

    setFeedback("correct");
    setScore((s) => s + 1);
    window.setTimeout(() => {
      setFeedback("idle");
      if (exerciseIndex >= total - 1) {
        void completeCourseLesson(courseLessonId(step.id, lesson.number), isBossLesson);
        setFinished(true);
      } else {
        setExerciseIndex((i) => i + 1);
      }
    }, 650);
  }

  function renderExercise(ex: Exercise) {
    switch (ex.type) {
      case "learn": {
        const item = getCourseVocab(ex.vocabId);
        if (!item) return null;
        return <LearnWord item={item} onContinue={() => goNext(true)} />;
      }
      case "match":
        return (
          <MatchGame
            vocab={getCourseVocabList(ex.vocabIds)}
            locked={feedback !== "idle"}
            onDone={(ok) => goNext(ok)}
          />
        );
      case "picture": {
        const item = getCourseVocab(ex.vocabId);
        if (!item) return null;
        return (
          <PictureMatch
            item={item}
            vocab={stepVocab}
            locked={feedback !== "idle"}
            onAnswer={goNext}
          />
        );
      }
      case "listen": {
        const item = getCourseVocab(ex.vocabId);
        if (!item) return null;
        return (
          <ListenPick
            item={item}
            vocab={stepVocab}
            locked={feedback !== "idle"}
            onAnswer={goNext}
            mode={ex.mode}
          />
        );
      }
      case "translate": {
        const item = getCourseVocab(ex.vocabId);
        if (!item) return null;
        return (
          <TranslateVocab
            item={item}
            vocab={stepVocab}
            direction={ex.direction}
            locked={feedback !== "idle"}
            onAnswer={goNext}
          />
        );
      }
      case "type": {
        const item = getCourseVocab(ex.vocabId);
        if (!item) return null;
        return <TypeWord item={item} locked={feedback !== "idle"} onAnswer={goNext} />;
      }
      case "order": {
        if (ex.sentenceId) {
          const sentence = sentences.find((s) => s.id === ex.sentenceId);
          if (!sentence) return null;
          return (
            <OrderWords
              locked={feedback !== "idle"}
              onAnswer={goNext}
              sentenceGa={sentence.ga}
              sentenceEn={sentence.en}
            />
          );
        }
        const item = ex.vocabId ? getCourseVocab(ex.vocabId) : undefined;
        if (!item) return null;
        return <OrderWords item={item} locked={feedback !== "idle"} onAnswer={goNext} />;
      }
      case "fillBlank": {
        const sentence = sentences.find((s) => s.id === ex.sentenceId);
        if (!sentence?.blankWord) return null;
        return (
          <SentenceFillBlank
            sentenceGa={sentence.ga}
            sentenceEn={sentence.en}
            blankWord={sentence.blankWord}
            vocab={stepVocab}
            locked={feedback !== "idle"}
            onAnswer={goNext}
          />
        );
      }
      case "sentenceBuild": {
        const sentence = sentences.find((s) => s.id === ex.sentenceId);
        if (!sentence) return null;
        return (
          <OrderWords
            locked={feedback !== "idle"}
            onAnswer={goNext}
            sentenceGa={sentence.ga}
            sentenceEn={sentence.en}
          />
        );
      }
      case "review":
        return (
          <ReviewRound
            vocab={getCourseVocabList(ex.vocabIds)}
            locked={feedback !== "idle"}
            onDone={(ok) => goNext(ok)}
          />
        );
      case "boss":
        return (
          <BossRound
            vocab={getCourseVocabList(ex.vocabIds)}
            count={Math.min(5, ex.vocabIds.length)}
            onDone={() => goNext(true)}
          />
        );
      default:
        return null;
    }
  }

  if (finished) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-fluoro">
          {isBossLesson ? "Step clear" : "Lesson clear"}
        </p>
        <h2 className="mt-4 font-display text-5xl uppercase text-bone">+{xpEarned} XP</h2>
        <p className="mt-3 text-bone/70">
          {step.number}.{lesson.number} {lesson.title} · {score}/{total}
        </p>
        {!user && configured ? (
          <p className="mt-4 text-sm text-bone/65">
            <Link href="/login" className="text-fluoro underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            to keep this streak against your name.
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/course"
            className="border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.2em] hover:border-bone"
          >
            Course path
          </Link>
          {lesson.number < 10 ? (
            <Link
              href={`/course/step/${step.id}/lesson/${lesson.number + 1}`}
              className="border border-kneecap-red bg-kneecap-red px-5 py-3 text-xs uppercase tracking-[0.2em] text-white"
            >
              Next lesson
            </Link>
          ) : (
            <Link
              href="/course"
              className="border border-kneecap-red bg-kneecap-red px-5 py-3 text-xs uppercase tracking-[0.2em] text-white"
            >
              Back to path
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.2em] text-mute">
          <span>
            {step.number}.{lesson.number} · {exerciseIndex + 1}/{total}
          </span>
          <span className="text-fluoro">{score} correct</span>
        </div>
        <div className="h-1.5 bg-white/10">
          <div
            className="h-full bg-kneecap-red transition-all"
            style={{ width: `${((exerciseIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="border border-white/15 bg-black/50 p-5 sm:p-8">
        {exercise ? renderExercise(exercise) : null}

        {feedback === "wrong" && (
          <p className="mt-4 text-sm text-kneecap-red-hot">Not that one — try again.</p>
        )}
        {feedback === "correct" && <p className="mt-4 text-sm text-fluoro">Solid.</p>}
      </div>
    </div>
  );
}
