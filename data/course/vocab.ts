import { songs } from "@/data/songs";
import type { VocabItem } from "@/data/songs";
import { basicsVocab } from "./basics";

const vocabById = new Map<string, VocabItem>();

for (const item of basicsVocab) {
  vocabById.set(item.id, item);
}

for (const song of songs) {
  for (const item of song.vocab) {
    vocabById.set(item.id, item);
  }
}

export function getCourseVocab(id: string): VocabItem | undefined {
  return vocabById.get(id);
}

export function getCourseVocabList(ids: string[]): VocabItem[] {
  return ids.map((id) => vocabById.get(id)).filter((v): v is VocabItem => Boolean(v));
}

export function getAllCourseVocab(): VocabItem[] {
  return [...vocabById.values()];
}
