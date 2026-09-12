"use client";

import { useMemo, useState } from "react";
import type { VocabItem } from "@/data/songs";
import { speakIrish } from "@/lib/speech";
import { shuffle } from "@/lib/utils";

export function MatchGame({
  vocab,
  locked,
  onDone,
}: {
  vocab: VocabItem[];
  locked: boolean;
  onDone: (ok: boolean) => void;
}) {
  const pairs = useMemo(() => {
    const items = shuffle(vocab).slice(0, Math.min(4, vocab.length));
    return { left: items, right: shuffle(items) };
  }, [vocab]);

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);

  return (
    <div>
      <h3 className="font-display text-2xl uppercase">Match Irish → English</h3>
      <p className="mt-2 text-sm text-mute">Tap Irish, then its English.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pairs.left.map((item) => (
            <div key={item.id} className="flex gap-1">
              <button
                type="button"
                disabled={locked || matched.includes(item.id)}
                onClick={() => setSelected(item.id)}
                className={`min-w-0 flex-1 border px-3 py-3 text-left ${
                  matched.includes(item.id)
                    ? "border-fluoro/40 opacity-40"
                    : selected === item.id
                      ? "border-kneecap-red"
                      : "border-white/20"
                }`}
              >
                {item.ga}
              </button>
              <button
                type="button"
                aria-label={`Hear ${item.ga}`}
                onClick={() => void speakIrish(item.ga)}
                className="shrink-0 border border-kneecap-red/70 px-2 text-kneecap-red-hot hover:bg-kneecap-red hover:text-white"
              >
                ▶
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {pairs.right.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={locked || matched.includes(item.id) || !selected}
              onClick={() => {
                if (!selected || locked) return;
                if (selected === item.id) {
                  const next = [...matched, item.id];
                  setMatched(next);
                  setSelected(null);
                  if (next.length >= pairs.left.length) onDone(true);
                } else {
                  setSelected(null);
                  onDone(false);
                }
              }}
              className={`w-full border px-3 py-3 text-left ${
                matched.includes(item.id) ? "border-fluoro/40 opacity-40" : "border-white/20"
              }`}
            >
              {item.en}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
