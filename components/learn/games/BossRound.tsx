"use client";

import { useEffect, useMemo, useState } from "react";
import { SpeakButton } from "@/components/learn/SpeakButton";
import type { VocabItem } from "@/data/songs";
import { shuffle } from "@/lib/utils";

export function BossRound({
  vocab,
  onDone,
  count = 5,
}: {
  vocab: VocabItem[];
  onDone: () => void;
  count?: number;
}) {
  const cards = useMemo(() => shuffle(vocab).slice(0, Math.min(count, vocab.length)), [vocab, count]);
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);
  const card = cards[index] ?? cards[0];

  useEffect(() => {
    if (cards.length === 0) onDone();
  }, [cards.length, onDone]);

  if (!card) return null;

  return (
    <div className="text-center">
      <h3 className="font-display text-2xl uppercase">Boss round</h3>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-mute">
        Flash {index + 1}/{cards.length}
      </p>
      <p className="mt-8 font-display text-4xl text-kneecap-red-hot">{card.ga}</p>
      <div className="mt-4 flex justify-center">
        <SpeakButton text={card.ga} label="Hear Irish" />
      </div>
      {reveal ? (
        <>
          <p className="mt-4 text-xl text-fluoro">{card.en}</p>
          <button
            type="button"
            onClick={() => {
              if (index >= cards.length - 1) onDone();
              else {
                setIndex((i) => i + 1);
                setReveal(false);
              }
            }}
            className="mt-6 w-full border border-kneecap-red bg-kneecap-red px-4 py-3 text-xs uppercase tracking-[0.2em] text-white"
          >
            {index >= cards.length - 1 ? "Finish" : "Next"}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setReveal(true)}
          className="mt-6 border border-white/25 px-4 py-2 text-xs uppercase tracking-[0.2em]"
        >
          Reveal
        </button>
      )}
    </div>
  );
}
