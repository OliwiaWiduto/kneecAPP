export function youtubeThumb(youtubeId: string, quality: "hq" | "mq" | "max" = "hq") {
  const map = {
    hq: "hqdefault",
    mq: "mqdefault",
    max: "maxresdefault",
  } as const;
  return `https://i.ytimg.com/vi/${youtubeId}/${map[quality]}.jpg`;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Highlight uses raw YouTube time ± user sync offset (no fake lead). */
export function pickActiveLineIndex(lines: { startSec: number }[], currentSec: number): number {
  let active = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startSec <= currentSec) active = i;
    else break;
  }
  return active;
}

const IRISH_HINT =
  /[áéíóúÁÉÍÓÚ]|\b(?:agus|ach|anois|tá|táim|táimid|isteach|troid|oíche|cúpla|líne|áit|foighde|barraíocht|saoirse|tiocfaidh|éist|scéal|teolaí|buíochas|fiacha|mothaímse|mothaím|dorchadas|sráide|rialtas|sporán|imithe|ríthe|ballaí|scríobhneacht|ceart|cearta|gceart|chur|lámha|bróga|póca|bpóca|coladh|leaba|cinneadh|chac|cheannaireacht|raic|dúbh|dóite|teach|pingin|bocht|anocht|haifreann|doirteán|airgead|amharc|inár|insan|mise|muid|báite|tuilte|dtús|aghaidh|íoctha|bhfiacha|chrónaigh|sibh|sula|n-éiríonn|ndéantar|aisteach|achan|péas|'?nois|focain|gaelgiggolos|tomhas|gach|cuma|liom|faoi|gharda|goitse|deifir|gheall|cheann|dúshlán|soicind|anáil|duitse|doire|corcaigh|caol|sheasamh|stuama|maidin)\b/i;

function normalizeLyric(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** English gloss under the sung line — never a duplicate of already-English lyrics. */
export function translationFor(line: { ga: string; en?: string }): string | null {
  const sung = line.ga.trim();
  const gloss = line.en?.trim() ?? "";
  if (!gloss) return null;
  if (normalizeLyric(sung) === normalizeLyric(gloss)) return null;
  if (!IRISH_HINT.test(sung)) return null;
  return gloss;
}

export function bilingualLines<T extends { ga: string; en?: string }>(lines: T[]): T[] {
  return lines.filter((line) => translationFor(line) !== null);
}
