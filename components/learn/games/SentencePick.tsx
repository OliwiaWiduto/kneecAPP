"use client";

import { useMemo } from "react";
import { SpeakButton } from "@/components/learn/SpeakButton";
import type { VocabItem } from "@/data/songs";
import { shuffle } from "@/lib/utils";
import { Choice } from "./Choice";

export function SentencePick({
  item,
  vocab,
  locked,
  onAnswer,
}: {
  item: VocabItem;
  vocab: VocabItem[];
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const options = useMemo(() => {
    const wrong = shuffle(vocab.filter((v) => v.id !== item.id))
      .slice(0, 3)
      .map((v) => v.exampleGa);
    return shuffle([item.exampleGa, ...wrong]);
  }, [item, vocab]);

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">Use it in a sentence</h3>
      <p className="mt-2 text-sm text-mute">
        Irish sentence for <span className="text-kneecap-red">{item.ga}</span>
      </p>
      <div className="mt-3">
        <SpeakButton text={item.ga} label="Hear word" />
      </div>
      <p className="mt-4 text-bone/80">{item.exampleEn}</p>
      <div className="mt-6 space-y-2">
        {options.map((opt) => (
          <Choice
            key={opt}
            label={opt}
            speakText={opt}
            disabled={locked}
            onClick={() => onAnswer(opt === item.exampleGa)}
          />
        ))}
      </div>
    </div>
  );
}
