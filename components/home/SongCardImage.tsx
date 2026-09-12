"use client";

import { useState } from "react";
import { youtubeThumb } from "@/lib/utils";

type Props = {
  youtubeId: string;
};

/** YouTube maxres 404s still return a tiny 120×90 JPEG, so onError alone is not enough. */
export function SongCardImage({ youtubeId }: Props) {
  const [quality, setQuality] = useState<"max" | "mq">("max");

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={youtubeThumb(youtubeId, quality)}
      alt=""
      className="h-full w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
      onLoad={(e) => {
        if (quality === "max" && e.currentTarget.naturalWidth <= 120) {
          setQuality("mq");
        }
      }}
      onError={() => {
        if (quality === "max") setQuality("mq");
      }}
    />
  );
}
