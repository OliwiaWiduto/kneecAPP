"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { buildVocabOverrides, parseLyricLine, type DictionaryMeaning } from "@/lib/lyricGloss";
import type { VocabItem } from "@/data/songs/types";

type Props = {
  text: string;
  vocab: VocabItem[];
  isActive: boolean;
  canHover: boolean;
};

type TooltipState = {
  word: string;
  meanings: DictionaryMeaning[];
  x: number;
  y: number;
};

function formatMeaning(meaning: DictionaryMeaning): string {
  if (meaning.pos && meaning.pos !== "lyric") {
    return `${meaning.en} (${meaning.pos})`;
  }
  return meaning.en;
}

export const LyricLineText = memo(function LyricLineText({
  text,
  vocab,
  isActive,
  canHover,
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const overrides = useMemo(() => buildVocabOverrides(vocab), [vocab]);
  const segments = useMemo(() => parseLyricLine(text, overrides), [text, overrides]);

  useEffect(() => {
    if (!canHover) setTooltip(null);
  }, [canHover]);

  function showTooltip(word: string, meanings: DictionaryMeaning[], el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    setTooltip({
      word,
      meanings,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 6,
    });
  }

  const lineColor = isActive ? "text-kneecap-red-hot" : "text-bone";

  return (
    <span className={`inline ${lineColor}`}>
      {segments.map((segment, index) => {
        if (!segment.glossable || !segment.meanings?.length || !canHover) {
          return <span key={`${index}-${segment.text}`}>{segment.text}</span>;
        }

        return (
          <span
            key={`${index}-${segment.text}`}
            className="group/word relative inline"
            onMouseEnter={(e) => {
              e.stopPropagation();
              showTooltip(segment.text, segment.meanings!, e.currentTarget);
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <span className="cursor-help underline decoration-fluoro/25 decoration-dotted underline-offset-[0.2em] transition-colors duration-150 group-hover/word:text-fluoro group-hover/word:decoration-fluoro/70">
              {segment.text}
            </span>
          </span>
        );
      })}

      {tooltip && typeof document !== "undefined"
        ? createPortal(
            <span
              role="tooltip"
              style={{ left: tooltip.x, top: tooltip.y }}
              className="pointer-events-none fixed z-[200] w-max max-w-[18rem] -translate-x-1/2 border border-fluoro/80 bg-ink/95 px-3 py-2 text-left font-body text-[11px] normal-case leading-snug tracking-normal text-bone shadow-[0_0_24px_rgba(57,255,20,0.15)] backdrop-blur-sm"
            >
              <span
                className="absolute left-1/2 bottom-full h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 border-l border-t border-fluoro/80 bg-ink/95"
                aria-hidden
              />
              <span className="block text-[9px] uppercase tracking-[0.22em] text-fluoro">
                {tooltip.word}
              </span>
              <ul className="mt-1.5 space-y-1">
                {tooltip.meanings.map((meaning, i) => (
                  <li key={`${meaning.en}-${meaning.pos}-${i}`} className="leading-snug">
                    {formatMeaning(meaning)}
                  </li>
                ))}
              </ul>
            </span>,
            document.body,
          )
        : null}
    </span>
  );
});
