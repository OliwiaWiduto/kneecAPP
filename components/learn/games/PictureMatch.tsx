"use client";

import { useMemo } from "react";
import type { VocabItem } from "@/data/songs";
import { shuffle } from "@/lib/utils";
import { iconForVocab } from "./packIcons";
import { Choice } from "./Choice";

export function PictureMatch({
  item,
  vocab,
  locked,
  onAnswer,
  mode = "pick-irish",
}: {
  item: VocabItem;
  vocab: VocabItem[];
  locked: boolean;
  onAnswer: (ok: boolean) => void;
  mode?: "pick-irish" | "pick-english";
}) {
  const icon = iconForVocab(item);
  const options = useMemo(() => {
    const wrong = shuffle(vocab.filter((v) => v.id !== item.id))
      .slice(0, 3)
      .map((v) => (mode === "pick-irish" ? v.ga : v.en));
    const answer = mode === "pick-irish" ? item.ga : item.en;
    return shuffle([answer, ...wrong]);
  }, [item, mode, vocab]);

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">Match the picture</h3>
      <p className="mt-2 text-sm text-mute">
        {mode === "pick-irish" ? "Which Irish word fits?" : "What does this mean?"}
      </p>
      <div className="mx-auto mt-6 flex aspect-[4/3] max-w-xs items-center justify-center border border-white/20 bg-ink-soft">
        <span className="text-7xl" role="img" aria-hidden>
          {icon}
        </span>
      </div>
      <div className="mt-6 space-y-2">
        {options.map((opt) => (
          <Choice
            key={opt}
            label={opt}
            speakText={mode === "pick-irish" ? opt : undefined}
            disabled={locked}
            onClick={() => onAnswer(opt === (mode === "pick-irish" ? item.ga : item.en))}
          />
        ))}
      </div>
    </div>
  );
}
