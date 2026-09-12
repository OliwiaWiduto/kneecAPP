import { NextRequest } from "next/server";

const ABAIR_VOICE = "ga_UL_anb_piper";
const MAX_CHARS = 240;

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!text || text.length > MAX_CHARS) {
    return new Response("Missing Irish text", { status: 400 });
  }

  const url = new URL("https://synthesis.abair.ie/api/synthesise");
  url.searchParams.set("input", text);
  url.searchParams.set("voice", ABAIR_VOICE);
  url.searchParams.set("normalise", "true");

  const abair = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "kneecAPP/0.1 (Irish learning)",
    },
    cache: "force-cache",
  });

  if (!abair.ok) {
    return new Response("Irish speech unavailable", { status: 502 });
  }

  const payload = (await abair.json()) as { audioContent?: string };
  if (!payload.audioContent) {
    return new Response("Irish speech unavailable", { status: 502 });
  }

  const audio = Buffer.from(payload.audioContent, "base64");
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
