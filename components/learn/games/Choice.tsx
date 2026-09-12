"use client";

import { speakIrish } from "@/lib/speech";
import type { Feedback } from "./types";

export function Choice({
  label,
  disabled,
  tone,
  speakText,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  tone?: Feedback;
  speakText?: string;
  onClick: () => void;
}) {
  const border =
    tone === "correct"
      ? "border-fluoro text-fluoro"
      : tone === "wrong"
        ? "border-kneecap-red text-kneecap-red-hot"
        : "border-white/20 hover:border-bone";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`min-w-0 flex-1 border px-4 py-3 text-left transition ${border} disabled:opacity-50`}
      >
        {label}
      </button>
      {speakText ? (
        <button
          type="button"
          aria-label={`Hear ${speakText}`}
          onClick={(e) => {
            e.stopPropagation();
            void speakIrish(speakText);
          }}
          className="shrink-0 border border-kneecap-red/70 px-3 text-kneecap-red-hot transition hover:bg-kneecap-red hover:text-white"
        >
          ▶
        </button>
      ) : null}
    </div>
  );
}
