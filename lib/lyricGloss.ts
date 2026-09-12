import type { VocabItem } from "@/data/songs/types";
import dictionaryData from "@/data/irishDictionary.json";

export type DictionaryMeaning = {
  en: string;
  pos?: string;
  lemma?: string;
};

export type LyricSegment = {
  text: string;
  meanings?: DictionaryMeaning[];
  glossable: boolean;
};

const IRISH_CHAR = /[áéíóúÁÉÍÓÚ]/;
const WORD = /^['']?[\wáéíóúÁÉÍÓÚ'-]+/;

const ENGLISH_IN_LYRICS = new Set([
  "a", "i", "the", "and", "or", "but", "for", "to", "in", "on", "at", "of", "with",
  "is", "are", "was", "be", "do", "it", "its", "you", "your", "me", "my", "we", "he",
  "she", "they", "that", "this", "what", "when", "our", "get", "out", "now", "lad",
  "kid", "man", "for", "least", "first", "one", "two", "way", "tell", "him", "who",
  "most", "violent", "person", "know", "except", "oh", "would", "equals", "again",
  "fucking", "fuck", "fuckin", "too", "many", "much", "some", "all", "best", "poor",
  "like", "not", "see", "want", "has", "had", "can", "will", "just", "still", "then",
  "here", "there", "from", "into", "about", "cause", "yeah", "black", "twenty", "dj",
  "r.u.c.", "hide", "stash", "keep", "her", "lit", "ta", "off", "lowlife", "scum",
  "double", "dog", "job", "beat", "car", "note", "gonna", "throw", "hook", "jab",
  "boot", "same", "name", "change", "need", "plead", "beg", "head", "knees", "chest",
  "respect", "please", "lost", "pass", "bus", "ticket", "shopping", "nose", "tag",
  "ankle", "curfew", "overnight", "cop", "shop", "grams", "pocket", "reputation",
  "known", "being", "rocket", "dreams", "loaded", "9mm", "low", "life", "sittin",
  "flat", "sippin", "cans", "smokin", "rollies", "jobs", "taken", "doggies", "fash",
  "sesh", "bloodbath", "sneak", "quick", "toot", "fire", "callin", "fruit", "tryna",
  "take", "loot", "billy", "wont", "bothering", "anymore", "hoods", "ya", "provai",
  "lead", "miss", "son", "bag", "jesus", "said", "cross", "boost", "fegs", "next",
  "lookin", "tins", "cocktail", "bred", "unleashin", "beast", "beat", "fella", "falls",
  "asleep", "does", "every", "week", "brits", "micky", "spliff", "craic", "questions",
  "weird", "lines", "couple", "before", "peelers", "place", "patience", "losing",
  "another", "beating", "thrown", "pints", "snuff", "fight", "freedom", "church",
  "cill", "day", "come", "night", "big", "out", "here", "listen", "sober", "tonight",
]);

type DictionaryRecord = {
  irish?: string;
  meanings: DictionaryMeaning[];
};

const dictionaryEntries = dictionaryData.entries as Record<string, DictionaryRecord>;
const MAX_MEANINGS = dictionaryData._meta?.maxMeaningsPerWord ?? 2;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9'-]/g, "")
    .trim();
}

function bareWord(word: string): string {
  return word.replace(/^['"'(]+|['"',.:;!?()]+$/g, "");
}

function lookupKeys(word: string): string[] {
  const bare = bareWord(word);
  const keys: string[] = [];
  if (IRISH_CHAR.test(bare)) {
    keys.push(bare.toLowerCase().replace(/[^a-záéíóú'-]/g, ""));
  }
  const norm = normalize(bare);
  if (norm && !keys.includes(norm)) keys.push(norm);
  return keys;
}

function isIrishWord(word: string): boolean {
  const bare = bareWord(word);
  if (!bare) return false;
  if (IRISH_CHAR.test(bare)) return true;
  const key = normalize(bare);
  if (ENGLISH_IN_LYRICS.has(key)) return false;
  return lookupKeys(word).some((k) => k in dictionaryEntries);
}

function lookupDictionary(word: string): DictionaryMeaning[] {
  const results: DictionaryMeaning[] = [];
  const seen = new Set<string>();

  for (const key of lookupKeys(word)) {
    const entry = dictionaryEntries[key];
    if (!entry) continue;
    for (const meaning of entry.meanings) {
      const dedupe = `${meaning.lemma ?? ""}|${meaning.en}|${meaning.pos ?? ""}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      results.push(meaning);
    }
  }

  return results;
}

/** Song vocab overrides are prepended as a contextual first sense. */
export function buildVocabOverrides(vocab: VocabItem[]): Map<string, DictionaryMeaning[]> {
  const overrides = new Map<string, DictionaryMeaning[]>();

  for (const item of vocab) {
    const meaning: DictionaryMeaning = {
      en: item.en,
      pos: "lyric",
      lemma: item.ga,
    };
    for (const key of lookupKeys(item.ga)) {
      overrides.set(key, [meaning, ...(overrides.get(key) ?? [])]);
    }
    for (const part of item.ga.split(/\s+/)) {
      for (const key of lookupKeys(part)) {
        if (!overrides.has(key)) overrides.set(key, [meaning]);
      }
    }
  }

  return overrides;
}

function lookup(
  overrides: Map<string, DictionaryMeaning[]>,
  word: string,
): DictionaryMeaning[] {
  const results: DictionaryMeaning[] = [];
  const seen = new Set<string>();

  for (const key of lookupKeys(word)) {
    const vocabHit = overrides.get(key);
    if (vocabHit) {
      for (const meaning of vocabHit) {
        const dedupe = `${meaning.lemma ?? ""}|${meaning.en}|${meaning.pos ?? ""}`;
        if (!seen.has(dedupe)) {
          seen.add(dedupe);
          results.push(meaning);
        }
      }
    }
  }

  for (const meaning of lookupDictionary(word)) {
    const dedupe = `${meaning.lemma ?? ""}|${meaning.en}|${meaning.pos ?? ""}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    results.push(meaning);
  }

  return results.slice(0, MAX_MEANINGS);
}

export function parseLyricLine(ga: string, overrides: Map<string, DictionaryMeaning[]>): LyricSegment[] {
  const segments: LyricSegment[] = [];
  let i = 0;

  while (i < ga.length) {
    const rest = ga.slice(i);
    const wordMatch = rest.match(WORD);

    if (wordMatch) {
      const text = wordMatch[0];
      const meanings = lookup(overrides, text);
      segments.push({
        text,
        meanings: meanings.length > 0 ? meanings : undefined,
        glossable: Boolean(meanings.length > 0 && isIrishWord(text)),
      });
      i += text.length;
      continue;
    }

    segments.push({ text: ga[i], glossable: false });
    i += 1;
  }

  return segments;
}
