"use client";

import { SpeakButton } from "@/components/learn/SpeakButton";
import type { VocabItem } from "@/data/songs";

export function LearnWord({ item, onContinue }: { item: VocabItem; onContinue: () => void }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-mute">New word</p>
      <h3 className="mt-4 font-display text-5xl text-kneecap-red-hot">{item.ga}</h3>
      <p className="mt-3 text-xl">{item.en}</p>
      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-mute">{item.pronunciation}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <SpeakButton text={item.ga} label="Hear word" />
        <SpeakButton text={item.exampleGa} label="Hear sentence" />
      </div>
      <p className="mt-6 text-bone/75">
        <span className="text-fluoro">{item.exampleGa}</span>
        <br />
        {item.exampleEn}
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="mt-8 border border-kneecap-red bg-kneecap-red px-6 py-3 text-xs uppercase tracking-[0.2em] text-white"
      >
        Got it
      </button>
    </div>
  );
}
