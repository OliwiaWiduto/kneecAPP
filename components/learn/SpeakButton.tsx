"use client";

import { useState, type MouseEvent } from "react";
import { speakIrish } from "@/lib/speech";

type Props = {
  text: string;
  label?: string;
  className?: string;
};

export function SpeakButton({ text, label = "Hear Irish", className = "" }: Props) {
  const [speaking, setSpeaking] = useState(false);

  async function onSpeak(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!text.trim() || speaking) return;
    setSpeaking(true);
    try {
      await speakIrish(text);
    } finally {
      setSpeaking(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onSpeak}
      aria-label={`Speak Irish: ${text}`}
      className={`inline-flex items-center gap-2 border border-kneecap-red/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-kneecap-red-hot transition hover:bg-kneecap-red hover:text-white ${
        speaking ? "animate-pulse bg-kneecap-red text-white" : ""
      } ${className}`}
    >
      <span aria-hidden="true">{speaking ? "▮▮" : "▶"}</span>
      {label}
    </button>
  );
}
