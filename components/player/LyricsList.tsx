"use client";

import { memo } from "react";
import type { LyricLine, VocabItem } from "@/data/songs";
import { LyricLineText } from "@/components/player/LyricLineText";
import { translationFor } from "@/lib/utils";

type Props = {
  lines: LyricLine[];
  vocab: VocabItem[];
  activeIndex: number;
  lyricsMode: boolean;
  canHover: boolean;
  lineRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  onSeekLine: (index: number) => void;
};

export const LyricsList = memo(function LyricsList({
  lines,
  vocab,
  activeIndex,
  lyricsMode,
  canHover,
  lineRefs,
  onSeekLine,
}: Props) {
  return (
    <ul
      className={`mx-auto max-w-2xl space-y-5 pb-4 ${
        lyricsMode ? "space-y-6 pb-6 pt-[16vh] md:max-w-3xl" : "pt-2 md:max-w-none"
      }`}
    >
      {lines.map((line, index) => {
        const isActive = index === activeIndex;
        const isPast = index < activeIndex;
        const gloss = translationFor(line);

        return (
          <li key={`${line.ga}-${index}`} className="overflow-visible">
            <button
              type="button"
              ref={(el) => {
                lineRefs.current[index] = el;
              }}
              onClick={() => onSeekLine(index)}
              className={`block w-full text-left transition-all duration-200 ${
                isActive
                  ? "lyric-active"
                  : isPast
                    ? "opacity-30"
                    : "opacity-50 hover:opacity-90"
              }`}
            >
              <span
                className={`block font-display leading-tight ${
                  isActive
                    ? lyricsMode
                      ? "text-3xl sm:text-4xl [text-shadow:0_0_28px_rgba(225,6,0,0.35)]"
                      : "text-2xl sm:text-3xl [text-shadow:0_0_24px_rgba(225,6,0,0.35)]"
                    : lyricsMode
                      ? "text-xl sm:text-2xl"
                      : "text-lg sm:text-xl"
                }`}
              >
                <LyricLineText
                  text={line.ga}
                  vocab={vocab}
                  isActive={isActive}
                  canHover={canHover}
                />
              </span>
              {gloss ? (
                <span
                  className={`mt-1 block font-body text-sm leading-snug sm:text-[0.95rem] ${
                    isActive ? "text-bone/70" : "text-mute"
                  }`}
                >
                  {gloss}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
});
