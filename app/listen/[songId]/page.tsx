import { notFound } from "next/navigation";
import { ListenClient } from "@/components/player/ListenClient";
import { getSong, songs } from "@/data/songs";

type Props = {
  params: Promise<{ songId: string }>;
};

export function generateStaticParams() {
  return songs.map((song) => ({ songId: song.id }));
}

export default async function ListenPage({ params }: Props) {
  const { songId } = await params;
  const song = getSong(songId);
  if (!song) notFound();

  return (
    <ListenClient
      songId={song.id}
      title={song.title}
      youtubeId={song.youtubeId}
      durationSec={song.durationSec}
      lines={song.lines}
    />
  );
}
