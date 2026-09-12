import { betterWayToLive } from "./better-way-to-live";
import { britsOut } from "./brits-out";
import { cearta } from "./cearta";
import { guiltyConscience } from "./guilty-conscience";
import { hood } from "./hood";
import { recap } from "./recap";
import type { Song } from "./types";

export const songs: Song[] = [hood, recap, guiltyConscience, britsOut, betterWayToLive, cearta];

export function getSong(id: string): Song | undefined {
  return songs.find((song) => song.id === id);
}

export type { LyricLine, Song, VocabItem } from "./types";
