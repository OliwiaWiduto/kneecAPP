"use client";

import { useMemo } from "react";
import type { VocabItem } from "@/data/songs";
import { shuffle } from "@/lib/utils";
import { Choice } from "./Choice";

export function SentenceFillBlank({
  sentenceGa,
  sentenceEn,
  blankWord,
  vocab,
  locked,
  onAnswer,
}: {
  sentenceGa: string;
  sentenceEn: string;
  blankWord: string;
  vocab: VocabItem[];
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const blanked = sentenceGa.replace(blankWord, "______");
  const options = useMemo(
    () =>
      shuffle([
        blankWord,
        ...shuffle(vocab.map((v) => v.ga).filter((g) => g !== blankWord)).slice(0, 3),
      ]),
    [blankWord, vocab],
  );

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">Fill the blank</h3>
      <p className="mt-2 text-sm text-mute">{sentenceEn}</p>
      <p className="mt-4 font-display text-xl">{blanked}</p>
      <div className="mt-6 space-y-2">
        {options.map((opt) => (
          <Choice
            key={opt}
            label={opt}
            speakText={opt}
            disabled={locked}
            onClick={() => onAnswer(opt === blankWord)}
          />
        ))}
      </div>
    </div>
  );
}
