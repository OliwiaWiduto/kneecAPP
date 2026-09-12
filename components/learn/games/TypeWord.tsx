"use client";

import { useEffect, useMemo, useState } from "react";
import { SpeakButton } from "@/components/learn/SpeakButton";
import type { VocabItem } from "@/data/songs";
import { shuffle } from "@/lib/utils";

function normalizeIrish(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function toTiles(word: string): string[] {
  const tiles: string[] = [];
  for (const char of word) {
    if (/\s/.test(char)) continue;
    tiles.push(char);
  }
  return tiles;
}

export function TypeWord({
  item,
  locked,
  onAnswer,
}: {
  item: VocabItem;
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const target = item.ga.replace(/[.,!?]/g, "").trim();
  const tiles = useMemo(() => shuffle(toTiles(target)), [target]);
  const [pool, setPool] = useState<string[]>([]);
  const [built, setBuilt] = useState<string[]>([]);

  useEffect(() => {
    setPool(shuffle(toTiles(target)));
    setBuilt([]);
  }, [target]);

  const display = built.join("");

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">Spell it</h3>
      <p className="mt-2 text-sm text-mute">
        Build the Irish for <span className="text-bone">{item.en}</span>
      </p>
      <div className="mt-3">
        <SpeakButton text={item.ga} label="Hear word" />
      </div>
      <div className="mt-4 min-h-14 border border-dashed border-white/20 p-3">
        <p className="font-display text-2xl text-fluoro">{display || "…"}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((tile, i) => (
          <button
            key={`${tile}-${i}`}
            type="button"
            disabled={locked}
            onClick={() => {
              setBuilt((b) => [...b, tile]);
              setPool((p) => p.filter((_, idx) => idx !== i));
            }}
            className="border border-white/25 px-3 py-2 font-display text-lg"
          >
            {tile}
          </button>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          disabled={locked}
          onClick={() => {
            setPool(shuffle(toTiles(target)));
            setBuilt([]);
          }}
          className="border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.15em] text-mute"
        >
          Reset
        </button>
        <button
          type="button"
          disabled={locked || built.length === 0}
          onClick={() => onAnswer(normalizeIrish(display) === normalizeIrish(target))}
          className="border border-kneecap-red bg-kneecap-red px-4 py-2 text-xs uppercase tracking-[0.2em] text-white disabled:opacity-40"
        >
          Check
        </button>
      </div>
    </div>
  );
}
