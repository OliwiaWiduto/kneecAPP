"use client";

import { useEffect, useMemo, useState } from "react";
import type { VocabItem } from "@/data/songs";
import { shuffle } from "@/lib/utils";
import { TranslateVocab } from "./TranslateVocab";

export function ReviewRound({
  vocab,
  locked,
  onDone,
}: {
  vocab: VocabItem[];
  locked: boolean;
  onDone: (ok: boolean) => void;
}) {
  const rounds = useMemo(() => {
    const items = shuffle(vocab).slice(0, Math.min(3, vocab.length));
    return items.map((item, i) => ({
      item,
      direction: (i % 2 === 0 ? "ga-en" : "en-ga") as "ga-en" | "en-ga",
    }));
  }, [vocab]);

  const [round, setRound] = useState(0);
  const current = rounds[round];

  useEffect(() => {
    if (rounds.length === 0) onDone(true);
  }, [onDone, rounds.length]);

  if (!current) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-mute">
        Review {round + 1}/{rounds.length}
      </p>
      <TranslateVocab
        item={current.item}
        vocab={vocab}
        direction={current.direction}
        locked={locked}
        onAnswer={(ok) => {
          if (!ok) {
            onDone(false);
            return;
          }
          if (round >= rounds.length - 1) onDone(true);
          else setRound((r) => r + 1);
        }}
      />
    </div>
  );
}
