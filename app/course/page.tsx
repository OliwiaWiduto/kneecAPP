import Link from "next/link";
import { CoursePath } from "@/components/course/CoursePath";

export default function CoursePage() {
  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-5 pb-20 pt-8 sm:px-8">
      <div className="mb-10 max-w-2xl">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.25em] text-mute transition hover:text-kneecap-red"
        >
          ← Home
        </Link>
        <h1 className="mt-3 font-display text-4xl uppercase leading-none text-bone sm:text-5xl">
          Irish Course
        </h1>
        <p className="mt-3 text-sm text-bone/65">
          10 steps · 10 lessons each · recognition to full sentences
        </p>
      </div>
      <CoursePath />
    </main>
  );
}
