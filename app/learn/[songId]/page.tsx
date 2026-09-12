import Link from "next/link";
import { notFound } from "next/navigation";
import { GameShell } from "@/components/learn/GameShell";
import { getSong, songs } from "@/data/songs";

type Props = {
  params: Promise<{ songId: string }>;
};

export function generateStaticParams() {
  return songs.map((song) => ({ songId: song.id }));
}

export default async function LearnPage({ params }: Props) {
  const { songId } = await params;
  const song = getSong(songId);
  if (!song) notFound();

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-5 pb-20 pt-8 sm:px-8">
      <div className="mb-8">
        <Link
          href={`/listen/${song.id}`}
          className="text-xs uppercase tracking-[0.25em] text-mute transition hover:text-kneecap-red"
        >
          ← {song.title}
        </Link>
        <h1 className="mt-3 font-display text-4xl uppercase leading-none text-bone sm:text-5xl">
          Learning Mode
        </h1>
        <p className="mt-2 text-sm text-bone/65">10 mini games · vocab from this track</p>
      </div>
      <GameShell song={song} />
    </main>
  );
}
