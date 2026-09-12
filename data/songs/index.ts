import { amachAnocht } from "./amach-anocht";
import { betterWayToLive } from "./better-way-to-live";
import { britsOut } from "./brits-out";
import { cearta } from "./cearta";
import { fenian } from "./fenian";
import { fineArt } from "./fine-art";
import { guiltyConscience } from "./guilty-conscience";
import { hood } from "./hood";
import { itsBeenAges } from "./its-been-ages";
import { liarsTale } from "./liars-tale";
import { noComment } from "./no-comment";
import { recap } from "./recap";
import { sickInTheHead } from "./sick-in-the-head";
import { smugglersAndScholars } from "./smugglers-and-scholars";
import { thartAgusThart } from "./thart-agus-thart";
import type { Song } from "./types";

export const songs: Song[] = [
  hood,
  recap,
  guiltyConscience,
  britsOut,
  betterWayToLive,
  cearta,
  fineArt,
  fenian,
  smugglersAndScholars,
  liarsTale,
  noComment,
  sickInTheHead,
  itsBeenAges,
  thartAgusThart,
  amachAnocht,
];

export function getSong(id: string): Song | undefined {
  return songs.find((song) => song.id === id);
}

export type { LyricLine, Song, VocabItem } from "./types";
