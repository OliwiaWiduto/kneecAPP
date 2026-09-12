#!/usr/bin/env python3
"""
Force-align kneecAPP Genius lyric lines to official YouTube audio.

This does NOT re-transcribe (Whisper free-guess fails on Irish rap).
It takes the known lyric text and finds when each line occurs in the audio
via stable-ts / Whisper forced alignment.

Requires:
  pip install --target .python-packages yt-dlp stable-ts torch torchaudio

Usage:
  npm run align-lyrics
  PYTHONPATH=./.python-packages python3 scripts/align_lyrics.py --song hood
  PYTHONPATH=./.python-packages python3 scripts/align_lyrics.py --model small
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SONGS_DIR = ROOT / "data" / "songs"
AUDIO_DIR = ROOT / "tmp" / "audio"

SONG_META = {
    "hood": {"file": "hood.ts", "youtube": "h1J_DVutL-w", "duration": 174},
    "recap": {"file": "recap.ts", "youtube": "nXFM81b-gBk", "duration": 182},
    "guilty-conscience": {
        "file": "guilty-conscience.ts",
        "youtube": "pa3ki8r8tVI",
        "duration": 199,
    },
    "brits-out": {
        "file": "brits-out.ts",
        "youtube": "2SsOmjwZKrI",
        "duration": 190,
    },
    "better-way-to-live": {
        "file": "better-way-to-live.ts",
        "youtube": "KSnF7RaeoXE",
        "duration": 204,
    },
    "cearta": {"file": "cearta.ts", "youtube": "8Sf0htzbMKk", "duration": 250},
    "fine-art": {
        "file": "fine-art.ts",
        "youtube": "-b9GQ_nm9pc",
        "duration": 167,
    },
    "fenian": {"file": "fenian.ts", "youtube": "PLDHQVJZuGQ", "duration": 208},
    "smugglers-and-scholars": {
        "file": "smugglers-and-scholars.ts",
        "youtube": "gHU5UJxRjxY",
        "duration": 172,
    },
    "liars-tale": {
        "file": "liars-tale.ts",
        "youtube": "e061Py8MTHg",
        "duration": 210,
    },
    "no-comment": {
        "file": "no-comment.ts",
        "youtube": "ss9fRdpYdyI",
        "duration": 124,
    },
    "sick-in-the-head": {
        "file": "sick-in-the-head.ts",
        "youtube": "dDdnqCBPvFQ",
        "duration": 159,
    },
    "its-been-ages": {
        "file": "its-been-ages.ts",
        "youtube": "B8-_ogy-eGE",
        "duration": 152,
    },
    "thart-agus-thart": {
        "file": "thart-agus-thart.ts",
        "youtube": "bI4QhEh-jk4",
        "duration": 146,
    },
    "amach-anocht": {
        "file": "amach-anocht.ts",
        "youtube": "L9TJMrKpe0k",
        "duration": 252,
    },
}

MIN_LINE_SEC = 0.85


def extract_lines_block(ts_source: str) -> list[dict]:
    match = re.search(r"lines:\s*\[(.*?)\],\s*vocab:", ts_source, re.S)
    if not match:
        raise RuntimeError("Could not find lines: [...] block")
    block = match.group(1)
    objs = re.findall(
        r"\{\s*startSec:\s*([0-9.]+)\s*,\s*ga:\s*(\"((?:\\.|[^\"])*)\"|'((?:\\.|[^'])*)')\s*,\s*en:\s*(\"((?:\\.|[^\"])*)\"|'((?:\\.|[^'])*)')\s*,?\s*\}",
        block,
    )
    lines = []
    for start, _gq, ga_dq, ga_sq, _eq, en_dq, en_sq in objs:
        ga = (ga_dq or ga_sq).replace('\\"', '"').replace("\\\\", "\\")
        en = (en_dq or en_sq).replace('\\"', '"').replace("\\\\", "\\")
        lines.append({"startSec": float(start), "ga": ga, "en": en})
    if not lines:
        raise RuntimeError("No lyric objects parsed — check quoting in .ts file")
    return lines


def _find_downloaded_audio(stem: Path) -> Path | None:
    for ext in (".wav", ".m4a", ".webm", ".opus", ".mp3", ".ogg", ".mp4"):
        p = stem.with_suffix(ext)
        if p.exists() and p.stat().st_size > 1000:
            return p
    return None


def download_audio(youtube_id: str, out_wav: Path) -> Path:
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    stem = out_wav.with_suffix("")
    existing = _find_downloaded_audio(stem)
    if existing:
        print(f"  audio exists: {existing.name}")
        return existing

    url = f"https://www.youtube.com/watch?v={youtube_id}"
    out_tmpl = str(stem) + ".%(ext)s"
    attempts = [
        [
            "-f",
            "bestaudio/best",
            "--extractor-args",
            "youtube:player_client=android,ios,tv",
            "-o",
            out_tmpl,
            url,
        ],
        [
            "-f",
            "bestaudio/best",
            "--extractor-args",
            "youtube:player_client=android_music,android,ios",
            "--cookies-from-browser",
            "chrome",
            "-o",
            out_tmpl,
            url,
        ],
    ]
    print("  downloading", url)
    last_err: Exception | None = None
    for args in attempts:
        cmd = [sys.executable, "-m", "yt_dlp", *args]
        try:
            subprocess.check_call(cmd, cwd=str(ROOT))
            found = _find_downloaded_audio(stem)
            if found:
                return found
        except subprocess.CalledProcessError as e:
            last_err = e
            print("  download attempt failed, trying fallback…")

    raise RuntimeError(
        "Could not download YouTube audio. Update yt-dlp or pass browser cookies."
    ) from last_err


def lyrics_for_align(line: dict) -> str:
    """Prefer sung line (ga); fall back to English gloss. Strip fancy dashes."""
    ga = (line.get("ga") or "").strip()
    en = (line.get("en") or "").strip()
    text = ga or en
    # Em/en dashes break Whisper token alignment on mixed Irish/English lines
    return text.replace("—", " - ").replace("–", "-").replace("  ", " ").strip()


def force_align(
    audio: Path, lines: list[dict], model_name: str, song_duration: float
) -> list[float]:
    import stable_whisper

    print(f"  loading Whisper '{model_name}' for forced alignment…")
    model = stable_whisper.load_model(model_name)

    # One lyric line per newline → original_split keeps line grouping
    text = "\n".join(lyrics_for_align(line) for line in lines)
    print(f"  aligning {len(lines)} known lyric lines to {audio.name}…")

    result = model.align(
        str(audio),
        text,
        language="en",  # Irish bars aligned phonetically against EN model
        original_split=True,
        token_step=120,
        word_dur_factor=2.5,
        max_word_dur=4.0,
        nonspeech_skip=8.0,
        failure_threshold=0.35,
    )
    if result is None or not getattr(result, "segments", None):
        raise RuntimeError("Forced alignment returned no segments")

    segs = list(result.segments)
    print(f"  aligned segments: {len(segs)}")

    stamps: list[float] = []
    if len(segs) == len(lines):
        for seg in segs:
            stamps.append(float(seg.start))
    else:
        # Fallback: walk words in order and take start of each line's first word
        print(
            f"  warning: segment count {len(segs)} != lines {len(lines)}; "
            "mapping by word groups"
        )
        words = []
        for seg in segs:
            for w in seg.words or []:
                if w.word and str(w.word).strip():
                    words.append(w)
        if not words:
            raise RuntimeError("No aligned words")
        # Proportional word slices
        n = len(lines)
        for i in range(n):
            wi = min(len(words) - 1, int(round(i * (len(words) - 1) / max(1, n - 1))))
            stamps.append(float(words[wi].start))

    return enforce_spacing(stamps, song_duration)


def enforce_spacing(stamps: list[float], song_duration: float) -> list[float]:
    """Keep monotonic readable gaps without crushing the alignment."""
    n = len(stamps)
    if n == 0:
        return []
    out = [max(0.0, float(stamps[0]))]
    for i in range(1, n):
        t = float(stamps[i])
        if t < out[-1] + MIN_LINE_SEC:
            t = out[-1] + MIN_LINE_SEC
        out.append(t)

    # If we spilled past the song, gently compress while keeping order
    if out[-1] > song_duration - 0.4:
        span = out[-1] - out[0]
        target = max(n * MIN_LINE_SEC, (song_duration - 0.5) - out[0])
        if span > 0:
            scale = target / span
            base = out[0]
            out = [base + (t - base) * scale for t in out]
        for i in range(1, n):
            if out[i] < out[i - 1] + 0.55:
                out[i] = out[i - 1] + 0.55
    return [round(t, 2) for t in out]


def ts_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace('"', '\\"')


def write_stamps(ts_path: Path, lines: list[dict], stamps: list[float]) -> None:
    src = ts_path.read_text(encoding="utf-8")
    if len(lines) != len(stamps):
        raise RuntimeError("lines/stamps length mismatch")

    objs = []
    for line, t in zip(lines, stamps):
        ga = ts_escape(line["ga"])
        en = ts_escape(line["en"])
        objs.append(f'    {{ startSec: {t}, ga: "{ga}", en: "{en}" }}')
    block = "lines: [\n" + ",\n".join(objs) + ",\n  ],\n  vocab:"

    updated, n = re.subn(
        r"lines:\s*\[.*?\],\s*vocab:",
        block,
        src,
        count=1,
        flags=re.S,
    )
    if n != 1:
        raise RuntimeError("Failed to rewrite lines block")
    ts_path.write_text(updated, encoding="utf-8")
    print(f"  wrote {len(stamps)} timestamps → {ts_path.name}")


def process_song(song_id: str, model_name: str) -> None:
    meta = SONG_META[song_id]
    ts_path = SONGS_DIR / meta["file"]
    wav = AUDIO_DIR / f"{song_id}.wav"
    print(f"\n=== {song_id} ===")
    lines = extract_lines_block(ts_path.read_text(encoding="utf-8"))
    print(f"  {len(lines)} lyric lines (Genius ground truth)")
    audio = download_audio(meta["youtube"], wav)
    duration = float(meta["duration"])
    stamps = force_align(audio, lines, model_name, duration)

    gaps = [stamps[i + 1] - stamps[i] for i in range(len(stamps) - 1)]
    cramped = sum(1 for g in gaps if g < 0.7)
    print(
        f"  range {stamps[0]:.1f}→{stamps[-1]:.1f}s  "
        f"median_gap={sorted(gaps)[len(gaps)//2] if gaps else 0:.2f}  "
        f"cramped={cramped}"
    )
    # Preview a few
    for i in (0, 1, 2, len(lines) // 2, len(lines) - 1):
        if 0 <= i < len(lines):
            print(f"    {stamps[i]:6.2f}  {lines[i]['ga'][:56]}")

    write_stamps(ts_path, lines, stamps)
    (AUDIO_DIR / f"{song_id}.stamps.json").write_text(
        json.dumps({"songId": song_id, "method": "stable-ts-align", "stamps": stamps}, indent=2),
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--song", choices=list(SONG_META), help="Only one song")
    parser.add_argument(
        "--model",
        default="base",
        help="Whisper model for alignment (tiny/base/small/medium). base is a good default.",
    )
    args = parser.parse_args()
    ids = [args.song] if args.song else list(SONG_META)
    for song_id in ids:
        process_song(song_id, args.model)
    print("\nDone. Hard-refresh the app (Reset sync if old local stamps linger).")


if __name__ == "__main__":
    main()
