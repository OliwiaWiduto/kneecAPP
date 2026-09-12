"use client";

let current: HTMLAudioElement | null = null;

function stopCurrent() {
  if (typeof window !== "undefined") {
    window.speechSynthesis?.cancel();
  }
  if (!current) return;
  current.pause();
  current.removeAttribute("src");
  current = null;
}

/** Ulster Irish TTS via ABAIR (Trinity College Dublin). Never fall back to English voices. */
export async function speakIrish(text: string): Promise<void> {
  const clipped = text.trim();
  if (typeof window === "undefined" || !clipped) return;

  stopCurrent();

  const src = `/api/speak?q=${encodeURIComponent(clipped)}`;
  const audio = new Audio(src);
  current = audio;

  await new Promise<void>((resolve) => {
    const done = () => {
      if (current === audio) current = null;
      resolve();
    };
    audio.addEventListener("ended", done, { once: true });
    audio.addEventListener("error", done, { once: true });
    void audio.play().catch(done);
    window.setTimeout(done, Math.min(12000, 1400 + clipped.length * 80));
  });
}
