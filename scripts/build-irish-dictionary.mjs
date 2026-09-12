/**
 * Builds data/irishDictionary.json from cupla-focail (curated Irish–English entries).
 * Uses hand-checked definitions only — 1–2 senses per word, not WordNet noise.
 *
 * Source: https://github.com/m4cd4r4/cupla-focail (MIT)
 * Run: npm run build-irish-dictionary
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const DICT_URL =
  "https://raw.githubusercontent.com/m4cd4r4/cupla-focail/master/src/data/irish-dictionary-data.json";
const CACHE_DIR = new URL("../.cache/", import.meta.url);
const CACHE_FILE = new URL("../.cache/irish-dictionary-data.json", import.meta.url);
const OUTPUT_FILE = new URL("../data/irishDictionary.json", import.meta.url);

const MAX_MEANINGS = 2;
const IRISH_CHAR = /[áéíóúÁÉÍÓÚ]/;
const WORD = /['']?[\wáéíóúÁÉÍÓÚ'-]+/g;

/** Slang, verbal forms, and fixes where the open dictionary is wrong or incomplete. */
const MANUAL_GLOSS = {
  foc: { en: "fuck", pos: "noun" },
  focan: { en: "fuck", pos: "noun" },
  focain: { en: "fucking", pos: "noun" },
  go: { en: "to / that", pos: "conjunction" },
  bhfuil: { en: "is / are", pos: "verb" },
  bí: { en: "to be", pos: "verb" },
  bi: { en: "to be", pos: "verb" },
  táim: { en: "I am", pos: "verb" },
  taim: { en: "I am", pos: "verb" },
  táimid: { en: "we are", pos: "verb" },
  taimid: { en: "we are", pos: "verb" },
  níl: { en: "there is not", pos: "verb" },
  nil: { en: "there is not", pos: "verb" },
  níor: { en: "did not", pos: "verb" },
  nior: { en: "did not", pos: "verb" },
  "n-éiríonn": { en: "gets / becomes", pos: "verb" },
  "n-eirionn": { en: "gets / becomes", pos: "verb" },
};

/** Pronominal / inflected forms that need a clearer gloss than the base lemma. */
const INFLECTION_GLOSS = {
  liom: { en: "with me", pos: "preposition" },
  leat: { en: "with you", pos: "preposition" },
  leis: { en: "with him / it", pos: "preposition" },
  léi: { en: "with her", pos: "preposition" },
  linn: { en: "with us", pos: "preposition" },
  libh: { en: "with you (plural)", pos: "preposition" },
  leo: { en: "with them", pos: "preposition" },
  agam: { en: "at me / I have", pos: "preposition" },
  agat: { en: "at you / you have", pos: "preposition" },
  aige: { en: "at him / he has", pos: "preposition" },
  aici: { en: "at her / she has", pos: "preposition" },
  againn: { en: "at us / we have", pos: "preposition" },
  agaibh: { en: "at you (plural)", pos: "preposition" },
  acu: { en: "at them / they have", pos: "preposition" },
  dom: { en: "to me / for me", pos: "preposition" },
  duit: { en: "to you", pos: "preposition" },
  dó: { en: "to him", pos: "preposition" },
  di: { en: "to her", pos: "preposition" },
  orm: { en: "on me", pos: "preposition" },
  ort: { en: "on you", pos: "preposition" },
  air: { en: "on him / it", pos: "preposition" },
  uirthi: { en: "on her", pos: "preposition" },
  orainn: { en: "on us", pos: "preposition" },
  oraibh: { en: "on you (plural)", pos: "preposition" },
  orthu: { en: "on them", pos: "preposition" },
  chugam: { en: "towards me", pos: "preposition" },
  chugat: { en: "towards you", pos: "preposition" },
  chuige: { en: "towards him", pos: "preposition" },
  chuici: { en: "towards her", pos: "preposition" },
  chugainn: { en: "towards us", pos: "preposition" },
  chugaibh: { en: "towards you (plural)", pos: "preposition" },
  chucu: { en: "towards them", pos: "preposition" },
};

const ENGLISH_IN_LYRICS = new Set([
  "a", "i", "the", "and", "or", "but", "for", "to", "in", "on", "at", "of", "with",
  "is", "are", "was", "be", "do", "it", "its", "you", "your", "me", "my", "we", "he",
  "she", "they", "that", "this", "what", "when", "our", "get", "out", "now", "lad",
  "kid", "man", "least", "first", "one", "two", "way", "tell", "him", "who", "most",
  "violent", "person", "know", "except", "oh", "would", "equals", "again", "fucking",
  "fuck", "fuckin", "too", "many", "much", "some", "all", "best", "poor", "like",
  "not", "see", "want", "has", "had", "can", "will", "just", "still", "then", "here",
  "there", "from", "into", "about", "cause", "yeah", "black", "twenty", "dj", "hide",
  "stash", "keep", "her", "lit", "off", "lowlife", "scum", "double", "dog", "job",
  "beat", "car", "note", "gonna", "throw", "hook", "jab", "boot", "same", "name",
  "change", "need", "plead", "beg", "head", "knees", "chest", "respect", "please",
  "lost", "pass", "bus", "ticket", "shopping", "nose", "tag", "ankle", "curfew",
  "overnight", "cop", "shop", "grams", "pocket", "reputation", "known", "being",
  "rocket", "dreams", "loaded", "9mm", "low", "life", "sittin", "flat", "sippin",
  "cans", "smokin", "rollies", "jobs", "taken", "doggies", "fash", "sesh", "bloodbath",
  "sneak", "quick", "toot", "fire", "callin", "fruit", "tryna", "take", "loot",
  "billy", "wont", "bothering", "anymore", "hoods", "ya", "provai", "lead", "miss",
  "son", "bag", "jesus", "said", "cross", "boost", "fegs", "next", "lookin", "tins",
  "cocktail", "bred", "unleashin", "beast", "fella", "falls", "asleep", "does",
  "every", "week", "brits", "micky", "spliff", "craic", "questions", "weird", "lines",
  "couple", "before", "peelers", "place", "patience", "losing", "another", "beating",
  "thrown", "pints", "snuff", "fight", "freedom", "church", "cill", "day", "come",
  "night", "big", "listen", "sober", "tonight", "here", "im", "h", "o", "d", "r",
  "u", "c", "s", "t", "n", "m", "re", "ve", "ll", "if", "gets", "kneecap", "arlene",
  "moglai", "seamus", "barra", "tinky", "winky", "back", "over", "got", "his", "mad",
  "made", "never", "time", "bandit", "their", "think", "bit", "new", "more", "us",
  "getting", "touchy", "mate", "whacked", "things", "focus", "music", "stolen",
  "stoley", "left", "thank", "let", "round", "generation", "history", "throughout",
  "uprising", "player", "advice", "stranger", "sick", "scared", "cheeky", "little",
  "guess", "coming", "after", "forever", "escape", "second", "standing", "long",
  "break", "rule", "except", "slender", "bread", "dream", "sleep", "easy", "yokes",
  "hit", "plenty", "guard", "accepted", "good", "focus", "don't", "cunts", "we're",
  "you're", "there's", "that's", "i'm", "it's", "i'll", "he's", "she's",
]);

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9'-]/g, "")
    .trim();
}

function bareWord(word) {
  return word.replace(/^['"'(]+|['"',.:;!?()]+$/g, "");
}

function lookupKeys(word) {
  const bare = bareWord(word);
  const keys = [];
  if (IRISH_CHAR.test(bare)) {
    keys.push(bare.toLowerCase().replace(/[^a-záéíóú'-]/g, ""));
  }
  const norm = normalize(bare);
  if (norm && !keys.includes(norm)) keys.push(norm);
  return keys;
}

function isLikelyIrishToken(word) {
  const bare = bareWord(word);
  if (!bare || bare.length < 2) return false;
  if (IRISH_CHAR.test(bare)) return true;
  const key = normalize(bare);
  return !ENGLISH_IN_LYRICS.has(key);
}

function trimMeanings(meanings) {
  const seen = new Set();
  const out = [];
  for (const m of meanings) {
    const key = m.en.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
    if (out.length >= MAX_MEANINGS) break;
  }
  return out;
}

function isCleanSense(text) {
  return text.length <= 40 && !text.includes(".") && !text.includes("whose");
}

function sensesFromEntry(entry) {
  const pos = entry.partOfSpeech;
  const lemma = entry.irish ?? entry.id;
  return trimMeanings(
    [entry.english, ...(entry.englishAlt ?? [])]
      .map((s) => s?.trim())
      .filter(Boolean)
      .filter(isCleanSense)
      .map((en) => ({ en, pos, lemma })),
  );
}

async function downloadDictionary() {
  mkdirSync(CACHE_DIR, { recursive: true });
  if (existsSync(CACHE_FILE)) {
    console.log("Using cached dictionary at .cache/irish-dictionary-data.json");
    return JSON.parse(readFileSync(CACHE_FILE, "utf8"));
  }

  console.log("Downloading cupla-focail dictionary (~53 MB)...");
  const response = await fetch(DICT_URL);
  if (!response.ok) throw new Error(`Failed to download dictionary: ${response.status}`);

  const fileStream = createWriteStream(CACHE_FILE);
  await pipeline(Readable.fromWeb(response.body), fileStream);
  console.log("Download complete.");
  return JSON.parse(readFileSync(CACHE_FILE, "utf8"));
}

function setIndexTerm(index, term, payload, isLemma) {
  if (!term) return;
  const existing = index.get(term);
  if (existing?.isLemma && !isLemma) return;
  index.set(term, { ...payload, isLemma });
}

function buildCuratedIndex(entries) {
  /** @type {Map<string, { irish?: string, meanings: Array<{en:string,pos?:string,lemma?:string}>, isLemma?: boolean }>} */
  const index = new Map();

  for (const entry of entries.filter((e) => e.source === "curated")) {
    const lemma = entry.irish ?? entry.id;
    const meanings = sensesFromEntry(entry);
    if (meanings.length === 0) continue;

    const lemmaTerms = [
      normalize(entry.id),
      normalize(lemma),
      lemma.toLowerCase().replace(/[^a-záéíóú'-]/g, ""),
    ];

    for (const term of lemmaTerms) {
      setIndexTerm(index, term, { irish: lemma, meanings }, true);
    }

    for (const raw of entry.inflections ?? []) {
      const t = raw.trim();
      if (!t || t.includes(" ") || t.startsWith("no-table") || t.includes("-self")) continue;
      for (const term of [normalize(t), t.toLowerCase().replace(/[^a-záéíóú'-]/g, "")]) {
        const override = INFLECTION_GLOSS[term];
        const bucketMeanings = override ? trimMeanings([override, ...meanings]) : meanings;
        setIndexTerm(index, term, { irish: lemma, meanings: bucketMeanings }, false);
      }
    }
  }

  for (const [term, gloss] of Object.entries({ ...MANUAL_GLOSS, ...INFLECTION_GLOSS })) {
    setIndexTerm(index, term, { irish: term, meanings: trimMeanings([gloss]) }, true);
    setIndexTerm(index, normalize(term), { irish: term, meanings: trimMeanings([gloss]) }, true);
  }

  return index;
}

function buildLsgFallback(entries) {
  /** @type {Map<string, { en: string, pos?: string, lemma: string }>} */
  const fallback = new Map();

  for (const entry of entries.filter((e) => e.source === "lsg")) {
    const lemma = entry.irish ?? entry.id;
    const en = entry.english?.trim();
    if (!en || en.length > 60) continue;

    const terms = new Set([
      normalize(entry.id),
      normalize(lemma),
      lemma.toLowerCase().replace(/[^a-záéíóú'-]/g, ""),
    ]);

    for (const term of terms) {
      if (!term || fallback.has(term)) continue;
      fallback.set(term, { en, pos: entry.partOfSpeech, lemma });
    }
  }

  return fallback;
}

function lookupWord(curatedIndex, lsgFallback, word) {
  for (const key of lookupKeys(word)) {
    const manual = MANUAL_GLOSS[key] ?? INFLECTION_GLOSS[key];
    if (manual) return trimMeanings([manual]);

    const hit = curatedIndex.get(key);
    if (hit?.meanings.length) return hit.meanings;

    const lsg = lsgFallback.get(key);
    if (lsg) return trimMeanings([lsg]);
  }
  return [];
}

async function loadSongTokens() {
  const { songs } = await import("../data/songs/index.ts");
  const tokens = new Set();

  for (const song of songs) {
    for (const item of song.vocab) {
      for (const part of item.ga.split(/\s+/)) {
        if (isLikelyIrishToken(part)) {
          for (const key of lookupKeys(part)) tokens.add(key);
        }
      }
    }
    for (const line of song.lines) {
      for (const match of line.ga.matchAll(WORD)) {
        const word = match[0];
        if (!isLikelyIrishToken(word)) continue;
        for (const key of lookupKeys(word)) tokens.add(key);
      }
    }
  }

  return tokens;
}

async function main() {
  const entries = await downloadDictionary();
  console.log(`Loaded ${entries.length.toLocaleString()} dictionary entries.`);

  const curatedIndex = buildCuratedIndex(entries);
  const lsgFallback = buildLsgFallback(entries);
  console.log(`Curated index: ${curatedIndex.size.toLocaleString()} terms.`);

  const tokens = await loadSongTokens();
  console.log(`Found ${tokens.size.toLocaleString()} unique Irish tokens in song lyrics.`);

  /** @type {Record<string, { irish?: string, meanings: Array<{en:string,pos?:string,lemma?:string}> }>} */
  const output = {};

  for (const token of tokens) {
    const meanings = lookupWord(curatedIndex, lsgFallback, token);
    if (meanings.length === 0) continue;
    const curated = curatedIndex.get(token);
    output[token] = {
      irish: curated?.irish ?? meanings[0]?.lemma,
      meanings,
    };
  }

  for (const [key, value] of Object.entries({ ...output })) {
    if (value.irish) {
      const accented = value.irish.toLowerCase().replace(/[^a-záéíóú'-]/g, "");
      if (accented && !output[accented]) output[accented] = value;
    }
  }

  const sorted = Object.fromEntries(Object.entries(output).sort(([a], [b]) => a.localeCompare(b)));

  writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      {
        _meta: {
          source: "cupla-focail curated entries (https://github.com/m4cd4r4/cupla-focail)",
          license: "MIT",
          builtAt: new Date().toISOString(),
          entryCount: Object.keys(sorted).length,
          maxMeaningsPerWord: MAX_MEANINGS,
        },
        entries: sorted,
      },
      null,
      2,
    ) + "\n",
  );

  const counts = Object.values(sorted).map((e) => e.meanings.length);
  const avg = (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1);
  console.log(`Wrote ${Object.keys(sorted).length} entries (avg ${avg} meanings/word).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
