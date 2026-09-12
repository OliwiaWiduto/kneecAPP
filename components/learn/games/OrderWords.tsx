"use client";

import { useEffect, useMemo, useState } from "react";
import { SpeakButton } from "@/components/learn/SpeakButton";
import type { VocabItem } from "@/data/songs";
import { shuffle } from "@/lib/utils";

export function OrderWords({
  item,
  locked,
  onAnswer,
  sentenceGa,
  sentenceEn,
}: {
  item?: VocabItem;
  locked: boolean;
  onAnswer: (ok: boolean) => void;
  sentenceGa?: string;
  sentenceEn?: string;
}) {
  const ga = sentenceGa ?? item?.exampleGa ?? "";
  const en = sentenceEn ?? item?.exampleEn ?? "";

  const words = useMemo(
    () => ga.replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean),
    [ga],
  );
  const [pool, setPool] = useState<string[]>([]);
  const [ordered, setOrdered] = useState<string[]>([]);

  useEffect(() => {
    setPool(shuffle(words));
    setOrdered([]);
  }, [words]);

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">Order the words</h3>
      <p className="mt-2 text-sm text-mute">{en}</p>
      <div className="mt-4 min-h-12 border border-dashed border-white/20 p-3">
        <p className="font-display text-lg text-fluoro">
          {ordered.length ? ordered.join(" ") : "…"}
        </p>
      </div>
      <div className="mt-3">
        <SpeakButton text={ga} label="Hear sentence" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((word, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            disabled={locked}
            onClick={() => {
              setOrdered((o) => [...o, word]);
              setPool((p) => p.filter((_, idx) => idx !== i));
            }}
            className="border border-white/25 px-3 py-2 text-sm"
          >
            {word}
          </button>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          disabled={locked}
          onClick={() => {
            setPool(shuffle(words));
            setOrdered([]);
          }}
          className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.15em] text-mute"
        >
          Reset
        </button>
        <button
          type="button"
          disabled={locked || ordered.length === 0}
          onClick={() => onAnswer(ordered.join(" ") === words.join(" "))}
          className="border border-kneecap-red bg-kneecap-red px-4 py-2 text-xs uppercase tracking-[0.15em] text-white disabled:opacity-40"
        >
          Check
        </button>
      </div>
    </div>
  );
}
