export type LyricLine = {
  startSec: number;
  /** As-sung line (Irish, English, or mixed). */
  ga: string;
  /** English gloss. Omit when the sung line is already English. */
  en?: string;
};

export type VocabItem = {
  id: string;
  ga: string;
  en: string;
  /** Shared meaning bucket for odd-one-out (e.g. "a night out"). */
  pack: string;
  pronunciation: string;
  exampleGa: string;
  exampleEn: string;
  /** Optional emoji/symbol for picture-match exercises. */
  icon?: string;
};

export type Song = {
  id: string;
  title: string;
  year: number;
  youtubeId: string;
  spotifyId?: string;
  geniusUrl?: string;
  durationSec: number;
  blurb: string;
  lines: LyricLine[];
  vocab: VocabItem[];
};
