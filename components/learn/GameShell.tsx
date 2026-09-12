"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/components/auth/ProgressProvider";
import {
  BossRound,
  FillBlank,
  LearnWord,
  MatchGame,
  MeaningCheck,
  OrderWords,
  SentencePick,
  SongContext,
  TranslateVocab,
  type Feedback,
} from "@/components/learn/games";
import type { Song } from "@/data/songs";
import { bilingualLines } from "@/lib/utils";

type Props = { song: Song };

const TOTAL = 10;

export function GameShell({ song }: Props) {
  const { completeLesson, user, configured } = useProgress();
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const focus = song.vocab[step % song.vocab.length];
  const learnLines = bilingualLines(song.lines);
  const linePool = learnLines.length ? learnLines : song.lines;
  const focusLine = linePool[step % linePool.length];

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
      if (step >= TOTAL - 1) {
        void completeLesson(song.id);
        setFinished(true);
      } else {
        setStep((s) => s + 1);
      }
    }, 650);
  }

  if (finished) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-fluoro">Lesson clear</p>
        <h2 className="mt-4 font-display text-5xl uppercase text-bone">+120 XP</h2>
        <p className="mt-3 text-bone/70">
          {score}/{TOTAL} on {song.title}
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
            href={`/listen/${song.id}`}
            className="border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.2em] hover:border-bone"
          >
            Lyrics
          </Link>
          <Link
            href="/"
            className="border border-kneecap-red bg-kneecap-red px-5 py-3 text-xs uppercase tracking-[0.2em] text-white"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.2em] text-mute">
          <span>
            Game {step + 1}/{TOTAL}
          </span>
          <span className="text-fluoro">{score} correct</span>
        </div>
        <div className="h-1.5 bg-white/10">
          <div
            className="h-full bg-kneecap-red transition-all"
            style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      <div className="border border-white/15 bg-black/50 p-5 sm:p-8">
        {step === 0 && <LearnWord item={focus} onContinue={() => goNext(true)} />}
        {step === 1 && (
          <MatchGame
            vocab={song.vocab}
            locked={feedback !== "idle"}
            onDone={(ok) => goNext(ok)}
          />
        )}
        {step === 2 && (
          <FillBlank
            line={focusLine}
            word={focus}
            vocab={song.vocab}
            locked={feedback !== "idle"}
            onAnswer={goNext}
          />
        )}
        {step === 3 && (
          <SentencePick
            item={focus}
            vocab={song.vocab}
            locked={feedback !== "idle"}
            onAnswer={goNext}
          />
        )}
        {step === 4 && (
          <MeaningCheck
            line={focusLine}
            lines={linePool}
            locked={feedback !== "idle"}
            onAnswer={goNext}
          />
        )}
        {step === 5 && (
          <OrderWords item={focus} locked={feedback !== "idle"} onAnswer={goNext} />
        )}
        {step === 6 && (
          <TranslateVocab
            item={focus}
            vocab={song.vocab}
            direction="ga-en"
            locked={feedback !== "idle"}
            onAnswer={goNext}
          />
        )}
        {step === 7 && (
          <TranslateVocab
            item={song.vocab[(step + 2) % song.vocab.length]}
            vocab={song.vocab}
            direction="en-ga"
            locked={feedback !== "idle"}
            onAnswer={goNext}
          />
        )}
        {step === 8 && (
          <SongContext
            item={focus}
            lines={song.lines}
            locked={feedback !== "idle"}
            onAnswer={goNext}
          />
        )}
        {step === 9 && <BossRound vocab={song.vocab} onDone={() => goNext(true)} />}

        {feedback === "wrong" && (
          <p className="mt-4 text-sm text-kneecap-red-hot">Not that one — try again.</p>
        )}
        {feedback === "correct" && <p className="mt-4 text-sm text-fluoro">Solid.</p>}
      </div>
    </div>
  );
}
