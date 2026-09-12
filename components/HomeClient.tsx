"use client";

import Link from "next/link";
import { useProgress } from "@/components/auth/ProgressProvider";
import { CourseCard } from "@/components/home/CourseCard";
import { songs } from "@/data/songs";
import { youtubeThumb } from "@/lib/utils";

export function HomeClient() {
  const { xp, streak, completed, user, configured } = useProgress();

  return (
    <main className="relative mx-auto min-h-dvh max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
      <header className="animate-rise mb-14 max-w-3xl">
        <h1 className="font-display text-5xl leading-[0.9] text-bone sm:text-7xl md:text-8xl">
          kneec<span className="text-kneecap-red">APP</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-bone/75 sm:text-xl">
          Start the Irish course, or pick a track — listen to the lyrics, then drill the vocab in a
          10-question game.
        </p>
        <div className="mt-8 flex flex-wrap gap-6 text-sm uppercase tracking-[0.2em] text-mute">
          {user ? (
            <span>
              <span className="text-fluoro">{user.displayName}</span>
            </span>
          ) : null}
          <span>
            <span className="text-fluoro">{xp}</span> XP
          </span>
          <span>
            <span className="text-kneecap-red-hot">{streak}</span> day streak
          </span>
        </div>
        {!user && configured ? (
          <p className="mt-4 text-sm text-bone/60">
            <Link href="/login" className="text-fluoro underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            so the streak sits against your name, not just this browser.
          </p>
        ) : null}
      </header>

      <section className="animate-rise-delay">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl uppercase tracking-wide text-bone sm:text-3xl">
            Course & tracks
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] text-mute">1 course · 6 songs</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <CourseCard />
          {songs.map((song, i) => {
            const done = completed.includes(song.id);
            return (
              <article
                key={song.id}
                className="group relative overflow-hidden border border-white/15 bg-ink-soft transition duration-300 hover:border-kneecap-red"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <div
                  className="aspect-[4/3] bg-cover bg-center grayscale transition duration-500 group-hover:grayscale-0"
                  style={{ backgroundImage: `url(${youtubeThumb(song.youtubeId)})` }}
                />
                <div className="space-y-3 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-xl uppercase leading-none text-bone">
                        {song.title}
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-mute">
                        {song.year} · Kneecap
                      </p>
                    </div>
                    {done && (
                      <span className="border border-fluoro px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-fluoro">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-bone/70">{song.blurb}</p>
                  <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                    <Link
                      href={`/listen/${song.id}`}
                      className="inline-flex flex-1 items-center justify-center border border-kneecap-red bg-kneecap-red px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-kneecap-red-hot"
                    >
                      Listen
                    </Link>
                    <Link
                      href={`/learn/${song.id}`}
                      className="inline-flex flex-1 items-center justify-center border border-white/25 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-bone transition hover:border-fluoro hover:text-fluoro"
                    >
                      Learn
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
