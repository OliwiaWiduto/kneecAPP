import type { VocabItem } from "@/data/songs";

const PACK_ICONS: Record<string, string> = {
  "a night out": "🍺",
  "a feeling": "😤",
  place: "📍",
  talk: "💬",
  time: "⏱",
  people: "👥",
  amount: "🔢",
  greeting: "👋",
};

export function iconForVocab(item: VocabItem): string {
  if (item.icon) return item.icon;
  return PACK_ICONS[item.pack] ?? "🇮🇪";
}
