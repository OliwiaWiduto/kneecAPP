"use client";

import Link from "next/link";
import { useState } from "react";
import { YouTubeLyricPlayer } from "@/components/player/YouTubeLyricPlayer";
import type { LyricLine, VocabItem } from "@/data/songs";

type Props = {
  songId: string;
  title: string;
  youtubeId: string;
  durationSec: number;
  lines: LyricLine[];
  vocab: VocabItem[];
};

export function ListenClient({ songId, title, youtubeId, durationSec, lines, vocab }: Props) {
  const [lyricsMode, setLyricsMode] = useState(false);

  return (
    <main className="bg-atmosphere flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <div className="min-w-0">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.25em] text-mute transition hover:text-kneecap-red"
          >
            ← Scoil Kneecap
          </Link>
          <h1 className="mt-1 truncate font-display text-xl uppercase leading-none text-bone sm:text-2xl">
            {title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setLyricsMode((v) => !v)}
            className={`border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition sm:px-4 ${
              lyricsMode
                ? "border-bone/50 bg-white/5 text-bone"
                : "border-white/25 text-mute hover:border-bone/50 hover:text-bone"
            }`}
          >
            {lyricsMode ? "Video mode" : "Lyrics mode"}
          </button>
          <Link
            href={`/learn/${songId}`}
            className="border border-kneecap-red bg-kneecap-red px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-kneecap-red-hot sm:px-4"
          >
            Learn
          </Link>
        </div>
      </header>

      <YouTubeLyricPlayer
        youtubeId={youtubeId}
        title={title}
        durationSec={durationSec}
        lines={lines}
        vocab={vocab}
        lyricsMode={lyricsMode}
      />
    </main>
  );
}
