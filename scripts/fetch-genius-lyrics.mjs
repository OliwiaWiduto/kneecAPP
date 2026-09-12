#!/usr/bin/env node
/**
 * Fetch Kneecap lyrics text from Genius lyric pages (for local prototype authoring).
 * Usage: node scripts/fetch-genius-lyrics.mjs
 *
 * Genius ToS restricts automated scraping for redistribution — use for personal
 * prototype sync only, then paste into data/songs/*.ts.
 */
const SONGS = [
  {
    id: "hood",
    url: "https://genius.com/Kneecap-hood-lyrics",
  },
  {
    id: "recap",
    url: "https://genius.com/Kneecap-the-recap-bootleg-version-lyrics",
  },
  {
    id: "guilty-conscience",
    url: "https://genius.com/Kneecap-guilty-conscience-lyrics",
  },
  {
    id: "brits-out",
    url: "https://genius.com/Kneecap-get-your-brits-out-lyrics",
  },
  {
    id: "better-way-to-live",
    url: "https://genius.com/Kneecap-better-way-to-live-lyrics",
  },
  {
    id: "cearta",
    url: "https://genius.com/Kneecap-cearta-lyrics",
  },
];

async function fetchLyrics(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const html = await res.text();
  const chunks = [...html.matchAll(/data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/g)].map(
    (m) =>
      m[1]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&nbsp;/g, " ")
        .trim(),
  );
  return chunks.join("\n\n").trim();
}

for (const song of SONGS) {
  try {
    const text = await fetchLyrics(song.url);
    console.log(`\n===== ${song.id} (${song.url}) =====\n`);
    console.log(text.slice(0, 4000));
    console.log(text.length > 4000 ? "\n…[truncated]" : "");
  } catch (err) {
    console.error(song.id, err.message);
  }
}
