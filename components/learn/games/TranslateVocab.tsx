"use client";

import { useMemo } from "react";
import { SpeakButton } from "@/components/learn/SpeakButton";
import type { VocabItem } from "@/data/songs";
import { shuffle } from "@/lib/utils";
import { Choice } from "./Choice";

export function TranslateVocab({
  item,
  vocab,
  direction,
  locked,
  onAnswer,
}: {
  item: VocabItem;
  vocab: VocabItem[];
  direction: "ga-en" | "en-ga";
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const irishToEnglish = direction === "ga-en";
  const answer = irishToEnglish ? item.en : item.ga;
  const options = useMemo(() => {
    const wrong = shuffle(vocab.filter((v) => v.id !== item.id))
      .slice(0, 3)
      .map((v) => (irishToEnglish ? v.en : v.ga));
    return shuffle([answer, ...wrong]);
  }, [answer, irishToEnglish, item.id, vocab]);

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">
        {irishToEnglish ? "Translate Irish → EN" : "Translate EN → Irish"}
      </h3>
      <p className="mt-2 text-sm text-mute">Pick the matching meaning.</p>
      {irishToEnglish ? (
        <div className="mt-4">
          <p className="font-display text-3xl text-kneecap-red-hot">{item.ga}</p>
          <div className="mt-3">
            <SpeakButton text={item.ga} label="Hear word" />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-2xl">{item.en}</p>
      )}
      <div className="mt-6 space-y-2">
        {options.map((opt) => (
          <Choice
            key={opt}
            label={opt}
            speakText={irishToEnglish ? undefined : opt}
            disabled={locked}
            onClick={() => onAnswer(opt === answer)}
          />
        ))}
      </div>
    </div>
  );
}
