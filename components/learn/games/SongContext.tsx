"use client";

import { useEffect, useMemo } from "react";
import { SpeakButton } from "@/components/learn/SpeakButton";
import type { LyricLine, VocabItem } from "@/data/songs";
import { speakIrish } from "@/lib/speech";
import { bilingualLines, shuffle } from "@/lib/utils";
import { Choice } from "./Choice";

function lineUsesVocab(line: LyricLine, item: VocabItem): boolean {
  const hay = line.ga.toLowerCase();
  const word = item.ga.toLowerCase();
  if (hay.includes(word)) return true;
  const tokens = word.split(/\s+/).filter((token) => token.length > 2);
  if (tokens.some((token) => hay.includes(token))) return true;
  return hay.includes(item.exampleGa.toLowerCase().replace(/[.,!?]/g, ""));
}

export function SongContext({
  item,
  lines,
  locked,
  onAnswer,
}: {
  item: VocabItem;
  lines: LyricLine[];
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const { correct, options } = useMemo(() => {
    const bilingual = bilingualLines(lines);
    const pool = bilingual.length ? bilingual : lines;
    const hit = pool.find((line) => lineUsesVocab(line, item)) ?? pool[0];
    const wrong = shuffle(
      pool.filter((line) => line.ga !== hit?.ga && !lineUsesVocab(line, item)),
    )
      .slice(0, 3)
      .map((line) => line.ga);
    return { correct: hit?.ga ?? "", options: shuffle([hit?.ga ?? "", ...wrong].filter(Boolean)) };
  }, [item, lines]);

  useEffect(() => {
    void speakIrish(item.ga);
  }, [item.ga]);

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">Song context</h3>
      <p className="mt-2 text-sm text-mute">Hear the word, then find it in the lyrics.</p>
      <p className="mt-4 text-2xl">{item.en}</p>
      <div className="mt-3">
        <SpeakButton text={item.ga} label="Hear word" />
      </div>
      <p className="mt-6 text-sm text-mute">Which line uses this word?</p>
      <div className="mt-4 space-y-2">
        {options.map((opt) => (
          <Choice
            key={opt}
            label={opt}
            speakText={opt}
            disabled={locked}
            onClick={() => onAnswer(opt === correct)}
          />
        ))}
      </div>
    </div>
  );
}
