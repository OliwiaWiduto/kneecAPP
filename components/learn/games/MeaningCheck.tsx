"use client";

import { useMemo } from "react";
import { SpeakButton } from "@/components/learn/SpeakButton";
import type { LyricLine } from "@/data/songs";
import { shuffle, translationFor } from "@/lib/utils";
import { Choice } from "./Choice";

export function MeaningCheck({
  line,
  lines,
  locked,
  onAnswer,
}: {
  line: LyricLine;
  lines: LyricLine[];
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const options = useMemo(() => {
    const answer = translationFor(line) ?? line.ga;
    const wrong = shuffle(lines.filter((l) => translationFor(l) !== answer))
      .slice(0, 3)
      .map((l) => translationFor(l) ?? l.ga);
    return shuffle([answer, ...wrong]);
  }, [line, lines]);

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">Meaning check</h3>
      <p className="mt-4 font-display text-xl text-kneecap-red-hot">{line.ga}</p>
      <div className="mt-3">
        <SpeakButton text={line.ga} label="Hear line" />
      </div>
      <p className="mt-4 text-sm text-mute">What does this mean?</p>
      <div className="mt-6 space-y-2">
        {options.map((opt) => (
          <Choice
            key={opt}
            label={opt}
            disabled={locked}
            onClick={() => onAnswer(opt === (translationFor(line) ?? line.ga))}
          />
        ))}
      </div>
    </div>
  );
}
