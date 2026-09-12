"use client";

import { useMemo } from "react";
import type { LyricLine, VocabItem } from "@/data/songs";
import { shuffle, translationFor } from "@/lib/utils";
import { Choice } from "./Choice";

export function FillBlank({
  line,
  word,
  vocab,
  locked,
  onAnswer,
}: {
  line: LyricLine;
  word: VocabItem;
  vocab: VocabItem[];
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const token = line.ga.includes(word.ga) ? word.ga : (line.ga.split(/\s+/)[1] ?? word.ga);
  const blanked = line.ga.replace(token, "______");
  const options = useMemo(
    () =>
      shuffle([
        token,
        ...shuffle(vocab.map((v) => v.ga).filter((g) => g !== token)).slice(0, 3),
      ]),
    [token, vocab],
  );

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">Fill the blank</h3>
      <p className="mt-2 text-sm text-mute">{translationFor(line) ?? ""}</p>
      <p className="mt-4 font-display text-xl">{blanked}</p>
      <div className="mt-6 space-y-2">
        {options.map((opt) => (
          <Choice
            key={opt}
            label={opt}
            speakText={opt}
            disabled={locked}
            onClick={() => onAnswer(opt === token)}
          />
        ))}
      </div>
    </div>
  );
}
