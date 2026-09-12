"use client";

import { useEffect, useMemo } from "react";
import { SpeakButton } from "@/components/learn/SpeakButton";
import type { VocabItem } from "@/data/songs";
import { speakIrish } from "@/lib/speech";
import { shuffle } from "@/lib/utils";
import { Choice } from "./Choice";

export function ListenPick({
  item,
  vocab,
  locked,
  onAnswer,
  mode = "ga-to-en",
}: {
  item: VocabItem;
  vocab: VocabItem[];
  locked: boolean;
  onAnswer: (ok: boolean) => void;
  mode?: "ga-to-en" | "en-to-ga";
}) {
  const answer = mode === "ga-to-en" ? item.en : item.ga;
  const options = useMemo(() => {
    const wrong = shuffle(vocab.filter((v) => v.id !== item.id))
      .slice(0, 3)
      .map((v) => (mode === "ga-to-en" ? v.en : v.ga));
    return shuffle([answer, ...wrong]);
  }, [answer, item.id, mode, vocab]);

  useEffect(() => {
    if (mode === "ga-to-en") void speakIrish(item.ga);
  }, [item.ga, mode]);

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">Listen</h3>
      <p className="mt-2 text-sm text-mute">
        {mode === "ga-to-en" ? "What did you hear?" : "Pick the Irish you hear."}
      </p>
      <div className="mt-6 flex justify-center">
        <SpeakButton text={item.ga} label="Play again" />
      </div>
      {mode === "en-to-ga" ? (
        <p className="mt-4 text-center text-xl text-bone/80">{item.en}</p>
      ) : (
        <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-mute">
          ▶ playing…
        </p>
      )}
      <div className="mt-6 space-y-2">
        {options.map((opt) => (
          <Choice
            key={opt}
            label={opt}
            speakText={mode === "en-to-ga" ? opt : undefined}
            disabled={locked}
            onClick={() => onAnswer(opt === answer)}
          />
        ))}
      </div>
    </div>
  );
}
