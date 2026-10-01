"use client";

import * as React from "react";
import Link from "next/link";
import { TEST_TOPICS, ALL_QUESTIONS, questionsForPart } from "@/lib/content/quiz";
import { CHAPTERS } from "@/lib/content/chapters";
import { useProgress } from "@/lib/progress";
import { ProgressRing } from "@/components/ui/Primitives";
import { ArrowRight, Brain, Eye, Footprints, Hand, ScanFace, Shield, UserRound, type LucideIcon } from "lucide-react";

/** თითოეულ თემას — შესაბამისი სხეულის ნაწილის ხატულა */
const TOPIC_ICON: Record<string, LucideIcon> = {
  general: Brain,
  hands: Hand,
  face: ScanFace,
  eyes: Eye,
  arms: Shield,
  legs: Footprints,
  head: UserRound,
};

export default function TestHub() {
  const { state, ready } = useProgress();

  const counts = React.useMemo(
    () =>
      Object.fromEntries(
        TEST_TOPICS.map((t) => [
          t.id,
          t.part ? questionsForPart(t.part).length : ALL_QUESTIONS.length,
        ]),
      ) as Record<string, number>,
    [],
  );

  return (
    <>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TEST_TOPICS.map((t, i) => {
          const res = ready ? state.quiz[`topic:${t.id}`] : undefined;
          const pct = res && res.total ? res.best / res.total : 0;
          const Icon = TOPIC_ICON[t.id] ?? Brain;
          return (
            <Link
              key={t.id}
              href={`/test/${t.id}`}
              className="card focus-ring group flex items-start gap-4 p-5 transition-all duration-400 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              data-reveal="up"
              data-reveal-delay={(i % 3) * 80}
              data-cursor="ტესტი"
            >
              <span
                className="grid size-12 shrink-0 place-items-center rounded-2xl transition-transform duration-400 group-hover:scale-110"
                style={{ background: "var(--brand-wash)" }}
              >
                <Icon className="size-6" strokeWidth={1.8} style={{ color: "var(--brand)" }} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-serif text-[18px] font-semibold transition-colors group-hover:text-[var(--brand)]">
                    {t.title}
                  </span>
                  {res && <ProgressRing value={pct} size={34} stroke={3.5} label={`რეკორდი ${res.best}/${res.total}`} />}
                </span>
                <span className="mt-1 block text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  {t.description}
                </span>
                <span className="mt-2 block text-[12px]" style={{ color: "var(--fg-faint)" }}>
                  {counts[t.id]} კითხვა
                  {res && ` · რეკორდი ${res.best}/${res.total} · ${res.attempts} მცდელობა`}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <section className="mt-14" aria-labelledby="per-chapter">
        <h2 id="per-chapter" className="text-[22px]">
          თავების მიხედვით
        </h2>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--fg-muted)" }}>
          მოკლე ტესტი თითოეულ თავზე — ზუსტად ის კითხვები, რომლებიც იმ მასალას ეხება.
        </p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((c, i) => {
            const res = ready ? state.quiz[`chapter:${c.slug}`] : undefined;
            const done = ready && state.read.includes(c.slug);
            return (
              <Link
                key={c.slug}
                href={`/test/${c.slug}`}
                className="card focus-ring group flex items-center justify-between gap-3 p-4 transition-all hover:-translate-y-0.5"
                data-reveal="up"
                data-reveal-delay={(i % 3) * 60}
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[11px]" style={{ color: "var(--fg-faint)" }}>
                    <span>თავი {c.order}</span>
                    {done && (
                      <span className="rounded-full px-1.5 py-0.5 font-semibold" style={{ background: "var(--color-sage-wash)", color: "var(--color-sage)" }}>
                        წაკითხული
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[15px] font-medium transition-colors group-hover:text-[var(--brand)]">
                    {c.title}
                  </span>
                </span>
                {res ? (
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold tabular-nums"
                    style={{
                      background: res.best / res.total >= 0.7 ? "var(--color-sage-wash)" : "var(--color-amber-wash)",
                      color: res.best / res.total >= 0.7 ? "var(--color-sage)" : "var(--color-amber)",
                    }}
                  >
                    {res.best}/{res.total}
                  </span>
                ) : (
                  <ArrowRight
                    className="size-4 shrink-0 transition-transform group-hover:translate-x-1"
                    strokeWidth={2.2}
                    style={{ color: "var(--fg-faint)" }}
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
