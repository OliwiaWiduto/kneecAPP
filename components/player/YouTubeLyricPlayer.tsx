"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LyricLine, VocabItem } from "@/data/songs";
import { LyricsList } from "@/components/player/LyricsList";
import { pickActiveLineIndex, youtubeThumb } from "@/lib/utils";
import type { YTPlayer } from "@/types/youtube";

type Props = {
  youtubeId: string;
  title: string;
  durationSec: number;
  lines: LyricLine[];
  vocab: VocabItem[];
  lyricsMode: boolean;
};

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (window.YT?.Player) resolve();
  });

  return apiPromise;
}

function formatClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function YouTubeLyricPlayer({
  youtubeId,
  title,
  durationSec,
  lines,
  vocab,
  lyricsMode,
}: Props) {
  const playerRef = useRef<YTPlayer | null>(null);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrubbingRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [clock, setClock] = useState(0);
  const [duration, setDuration] = useState(durationSec);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerId = `yt-${youtubeId}`;
  const holdActiveUntilRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let poll: number | undefined;

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT) return;

      playerRef.current = new window.YT.Player(containerId, {
        videoId: youtubeId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 1,
          disablekb: 0,
          fs: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            setReady(true);
            try {
              const d = event.target.getDuration();
              if (d > 0) setDuration(d);
              setMuted(Boolean(event.target.isMuted?.()));
            } catch {
              /* ignore */
            }
          },
          onStateChange: (event) => {
            setPlaying(event.data === window.YT?.PlayerState.PLAYING);
          },
        },
      });
    });

    poll = window.setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;
      try {
        if (!scrubbingRef.current) {
          const t = player.getCurrentTime();
          setClock(t);
          const d = player.getDuration?.();
          if (d && d > 0) setDuration(d);
          if (performance.now() >= holdActiveUntilRef.current) {
            const next = pickActiveLineIndex(lines, t);
            setActiveIndex((prev) => (prev === next ? prev : next));
          }
        }
      } catch {
        /* player not ready */
      }
    }, 50);

    return () => {
      cancelled = true;
      if (poll) window.clearInterval(poll);
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [youtubeId, lines, containerId]);

  useLayoutEffect(() => {
    if (activeIndex < 0) return;
    const el = lineRefs.current[activeIndex];
    const scroller = el?.closest("[data-lyric-scroller]");
    if (!el || !(scroller instanceof HTMLElement)) return;

    const pad = Number.parseFloat(getComputedStyle(scroller).paddingTop) || 0;
    const nextTop =
      scroller.scrollTop +
      (el.getBoundingClientRect().top - scroller.getBoundingClientRect().top) -
      pad;
    scroller.scrollTo({ top: Math.max(0, nextTop), behavior: "auto" });
  }, [activeIndex]);

  const seekToLine = useCallback((index: number) => {
    const line = lines[index];
    if (!line) return;
    playerRef.current?.seekTo(line.startSec, true);
    playerRef.current?.playVideo();
    holdActiveUntilRef.current = performance.now() + 600;
    setActiveIndex(index);
    setClock(line.startSec);
  }, [lines]);

  function togglePlay() {
    const player = playerRef.current;
    if (!player) return;
    if (playing) player.pauseVideo();
    else player.playVideo();
  }

  function nudge(delta: number) {
    const player = playerRef.current;
    if (!player) return;
    const next = Math.max(0, Math.min(duration || durationSec, clock + delta));
    player.seekTo(next, true);
    setClock(next);
    holdActiveUntilRef.current = performance.now() + 400;
    setActiveIndex(pickActiveLineIndex(lines, next));
  }

  function toggleMute() {
    const player = playerRef.current;
    if (!player?.mute) return;
    if (muted) {
      player.unMute();
      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  }

  function onScrub(value: number) {
    scrubbingRef.current = true;
    setClock(value);
    setActiveIndex(pickActiveLineIndex(lines, value));
  }

  function onScrubEnd(value: number) {
    scrubbingRef.current = false;
    playerRef.current?.seekTo(value, true);
    holdActiveUntilRef.current = performance.now() + 400;
  }

  const progress = duration > 0 ? Math.min(100, (clock / duration) * 100) : 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className={`flex min-h-0 flex-1 flex-col ${lyricsMode ? "pb-[8.75rem]" : "md:flex-row"}`}
      >
        {/* Video — stacked on mobile; 50% left column on desktop (video mode only) */}
        <div
          className={
            lyricsMode
              ? "pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0"
              : "relative w-full shrink-0 border-b border-white/10 bg-black md:w-1/2 md:border-b-0 md:border-r"
          }
        >
          <div className="relative aspect-video w-full md:sticky md:top-0 md:max-h-full">
            <div id={containerId} className="absolute inset-0 h-full w-full" />
            {!ready && !lyricsMode && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-soft text-sm uppercase tracking-[0.2em] text-mute">
                Loading track…
              </div>
            )}
          </div>
        </div>

        <div
          data-lyric-scroller
          className={`relative min-h-0 flex-1 overflow-y-auto scroll-auto px-5 [overflow-anchor:none] sm:px-8 md:min-w-0 ${
            lyricsMode ? "pt-2" : "pt-4 md:w-1/2 md:pt-6"
          }`}
        >
          <LyricsList
            lines={lines}
            vocab={vocab}
            activeIndex={activeIndex}
            lyricsMode={lyricsMode}
            canHover={!playing}
            lineRefs={lineRefs}
            onSeekLine={seekToLine}
          />
        </div>
      </div>

      {lyricsMode ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          <div className="mb-3 flex items-center gap-3">
            <span className="w-10 shrink-0 font-mono text-[10px] tabular-nums text-mute">
              {formatClock(clock)}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(1, duration)}
              step={0.1}
              value={Math.min(clock, duration || clock)}
              disabled={!ready}
              onChange={(e) => onScrub(Number(e.target.value))}
              onPointerUp={(e) => onScrubEnd(Number((e.target as HTMLInputElement).value))}
              onTouchEnd={(e) => onScrubEnd(Number((e.target as HTMLInputElement).value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-none disabled:opacity-40 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-kneecap-red [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-kneecap-red"
              style={{
                background: `linear-gradient(to right, #e10600 ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
              }}
              aria-label="Seek"
            />
            <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-mute">
              {formatClock(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={youtubeThumb(youtubeId, "mq")}
              alt=""
              className="h-14 w-14 shrink-0 border border-white/20 object-cover"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm uppercase leading-none text-bone">{title}</p>
              <p className="mt-1 truncate text-xs text-mute">Scoil Kneecap</p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => nudge(-5)}
                disabled={!ready}
                className="flex h-10 w-10 items-center justify-center font-mono text-xs text-bone/80 hover:text-bone disabled:opacity-40"
                aria-label="Back 5 seconds"
              >
                −5
              </button>
              <button
                type="button"
                onClick={togglePlay}
                disabled={!ready}
                className="flex h-12 w-12 items-center justify-center border border-bone bg-bone text-ink transition active:scale-95 hover:border-fluoro hover:bg-fluoro disabled:opacity-40"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <span className="flex gap-1" aria-hidden>
                    <span className="h-4 w-1 bg-current" />
                    <span className="h-4 w-1 bg-current" />
                  </span>
                ) : (
                  <span
                    className="ml-0.5 block h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-current"
                    aria-hidden
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => nudge(5)}
                disabled={!ready}
                className="flex h-10 w-10 items-center justify-center font-mono text-xs text-bone/80 hover:text-bone disabled:opacity-40"
                aria-label="Forward 5 seconds"
              >
                +5
              </button>
              <button
                type="button"
                onClick={toggleMute}
                disabled={!ready}
                className={`flex h-10 min-w-10 items-center justify-center px-1 font-mono text-[10px] uppercase tracking-wider disabled:opacity-40 ${
                  muted ? "text-kneecap-red-hot" : "text-mute hover:text-bone"
                }`}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? "Mute" : "Vol"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
