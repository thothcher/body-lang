"use client";

import * as React from "react";
import Link from "next/link";
import GestureCard from "@/components/ui/GestureCard";
import { ProgressRing } from "@/components/ui/Primitives";
import { CHAPTERS } from "@/lib/content/chapters";
import { GESTURE_MAP, GESTURES } from "@/lib/content/gestures";
import { TEST_TOPICS } from "@/lib/content/quiz";
import { computeStreak, useProgress } from "@/lib/progress";
import { Check } from "lucide-react";

function fmtTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** წახალისება პროგრესის მიხედვით */
function encouragement(pct: number, streak: number) {
  if (pct === 0)
    return {
      title: "წარმატებები! 🍀",
      text: "ყველაფერი ცარიელი ფურცლიდან იწყება. პირველი თავი 7 წუთია — ზუსტად იმდენი, რამდენიც ყავის დასალევად გჭირდება.",
    };
  if (pct < 0.3)
    return {
      title: "კარგი დასაწყისი!",
      text: "პირველი ნაბიჯები გადადგმულია. გახსოვდეს: „სამი წესის“ თავი ყველაზე მნიშვნელოვანია — მის გარეშე დანარჩენი შეცდომებს მოგიტანს.",
    };
  if (pct < 0.6)
    return {
      title: "ნახევარ გზაზე ხარ!",
      text: "ახლა უკვე ჟესტების კლასტერებს ამჩნევ. სცადე ტელევიზორი ხმის გარეშე — შედეგი გაგაკვირვებს.",
    };
  if (pct < 1)
    return {
      title: "ფინიშთან ახლოს ხარ!",
      text: "რამდენიმე თავი დარჩა. შემდეგი ეტაპი პრაქტიკაა: დღეში 15 წუთი დაკვირვება რეალურ ადამიანებზე.",
    };
  return {
    title: "მთელი კურსი დაასრულე! 🎉",
    text: `ყველა ${CHAPTERS.length} თავი წაკითხულია${streak > 1 ? ` და ${streak} დღეა ზედიზედ ბრუნდები` : ""}. ახლა ყველაზე მნიშვნელოვანი იწყება — ცოდნა უნარად აქციე. სცადე სრული ტესტი და სცენების გაშიფვრა.`,
  };
}

export default function ProgressClient() {
  const { state, ready, reset, unmarkRead } = useProgress();
  const [confirmReset, setConfirmReset] = React.useState(false);

  if (!ready) {
    return (
      <div className="card grid place-items-center p-12">
        <div
          className="size-7 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const readCount = state.read.length;
  const pct = readCount / CHAPTERS.length;
  const streak = computeStreak(state.visits);
  const enc = encouragement(pct, streak);

  const quizEntries = Object.entries(state.quiz);
  const totalCorrect = quizEntries.reduce((a, [, r]) => a + r.best, 0);
  const totalAsked = quizEntries.reduce((a, [, r]) => a + r.total, 0);
  const savedGestures = state.saved.map((id) => GESTURE_MAP[id]).filter(Boolean);

  const quizLabel = (key: string) => {
    if (key.startsWith("chapter:")) {
      const slug = key.slice(8);
      return CHAPTERS.find((c) => c.slug === slug)?.title ?? slug;
    }
    const id = key.slice(6);
    return TEST_TOPICS.find((t) => t.id === id)?.title ?? id;
  };
  const quizHref = (key: string) =>
    key.startsWith("chapter:") ? `/test/${key.slice(8)}` : `/test/${key.slice(6)}`;

  return (
    <>
      {/* --------------------- წახალისება --------------------- */}
      <div
        className="grain relative mt-8 overflow-hidden rounded-[24px] p-6 sm:p-8"
        style={{ background: pct === 1 ? "var(--color-sage)" : "var(--brand)" }}
        data-reveal="scale"
      >
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="shrink-0 rounded-2xl bg-white/15 p-3">
            <ProgressRing
              value={pct}
              size={72}
              stroke={7}
              label={`${readCount} თავი ${CHAPTERS.length}-დან`}
              track="rgba(255,255,255,.28)"
              bar="#fff"
              text="#fff"
            />
          </div>
          <div>
            <h2 className="font-serif text-[clamp(1.3rem,3.2vw,1.9rem)] font-bold" style={{ color: "#fff" }}>
              {enc.title}
            </h2>
            <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed" style={{ color: "rgba(255,255,255,.88)" }}>
              {enc.text}
            </p>
          </div>
        </div>
      </div>

      {/* --------------------- სტატისტიკა --------------------- */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { v: `${readCount}/${CHAPTERS.length}`, l: "წაკითხული თავი", c: "var(--brand)" },
          {
            v: totalAsked ? `${Math.round((totalCorrect / totalAsked) * 100)}%` : "—",
            l: "ტესტების სიზუსტე",
            c: "var(--color-sage)",
          },
          { v: `${state.saved.length}`, l: "შენახული ჟესტი", c: "var(--color-clay)" },
          { v: `${streak}`, l: streak === 1 ? "დღე ზედიზედ" : "დღე ზედიზედ", c: "var(--color-amber)" },
        ].map((s, i) => (
          <div key={s.l} className="card p-5" data-reveal="up" data-reveal-delay={i * 70}>
            <p className="font-serif text-[30px] font-bold leading-none" style={{ color: s.c }}>
              {s.v}
            </p>
            <p className="mt-2 text-[13.5px]" style={{ color: "var(--fg-muted)" }}>
              {s.l}
            </p>
          </div>
        ))}
      </div>

      {/* --------------------- თავები --------------------- */}
      <section className="mt-12" aria-labelledby="p-chapters">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="p-chapters" className="text-[22px]">
            თავების პროგრესი
          </h2>
          <Link href="/chapters" className="focus-ring text-[13.5px] font-semibold" style={{ color: "var(--brand)" }}>
            ყველა თავი →
          </Link>
        </div>
        <div className="mt-4 grid gap-2">
          {CHAPTERS.map((c) => {
            const done = state.read.includes(c.slug);
            const res = state.quiz[`chapter:${c.slug}`];
            return (
              <div
                key={c.slug}
                className="card flex items-center gap-3 p-3.5"
                data-reveal="up"
              >
                <button
                  type="button"
                  onClick={() => done && unmarkRead(c.slug)}
                  disabled={!done}
                  aria-label={done ? `${c.title} — მონიშვნის მოხსნა` : `${c.title} — წაუკითხავი`}
                  className="focus-ring grid size-8 shrink-0 place-items-center rounded-full border transition-colors disabled:cursor-default"
                  style={{
                    background: done ? "var(--color-sage)" : "transparent",
                    borderColor: done ? "var(--color-sage)" : "var(--line-strong)",
                    color: "#fff",
                  }}
                >
                  {done && (
                    <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                  )}
                </button>
                <Link href={`/chapters/${c.slug}`} className="focus-ring min-w-0 flex-1">
                  <span className="block text-[11px]" style={{ color: "var(--fg-faint)" }}>
                    თავი {c.order} · {c.minutes} წთ
                  </span>
                  <span className="block truncate text-[15px] font-medium">{c.title}</span>
                </Link>
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
                  <Link
                    href={`/test/${c.slug}`}
                    className="focus-ring shrink-0 rounded-full border px-3 py-1 text-[12px]"
                    style={{ borderColor: "var(--line)", color: "var(--fg-faint)" }}
                  >
                    ტესტი
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------- ტესტები --------------------- */}
      {quizEntries.length > 0 && (
        <section className="mt-12" aria-labelledby="p-tests">
          <h2 id="p-tests" className="text-[22px]">
            ტესტების შედეგები
          </h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {quizEntries
              .sort((a, b) => new Date(b[1].lastAt).getTime() - new Date(a[1].lastAt).getTime())
              .map(([key, r]) => (
                <Link
                  key={key}
                  href={quizHref(key)}
                  className="card focus-ring flex items-center justify-between gap-3 p-4 transition-all hover:-translate-y-0.5"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[14.5px] font-medium">{quizLabel(key)}</span>
                    <span className="block text-[11.5px]" style={{ color: "var(--fg-faint)" }}>
                      {r.attempts} მცდელობა · {new Date(r.lastAt).toLocaleDateString("ka-GE")}
                    </span>
                  </span>
                  <ProgressRing value={r.total ? r.best / r.total : 0} size={38} stroke={4} />
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* --------------------- თამაშები --------------------- */}
      {Object.keys(state.games).length > 0 && (
        <section className="mt-12" aria-labelledby="p-games">
          <h2 id="p-games" className="text-[22px]">
            თამაშების რეკორდები
          </h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(state.games).map(([k, v]) => {
              const label = k.startsWith("memory-")
                ? `მეხსიერების ბანქო · ${k.split("-")[1]} წყვილი`
                : k === "guess"
                  ? "გამოიცანი ჟესტი"
                  : k === "decode"
                    ? "სცენის გაშიფვრა"
                    : `კავშირები · ${k.replace("connections-", "")}`;
              const value = k.startsWith("memory-") ? fmtTime(v) : `${v}`;
              return (
                <div key={k} className="card flex items-center justify-between gap-3 p-4">
                  <span className="text-[14px]" style={{ color: "var(--fg-muted)" }}>
                    {label}
                  </span>
                  <span className="text-[15px] font-bold tabular-nums" style={{ color: "var(--color-clay)" }}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* --------------------- შენახული ჟესტები --------------------- */}
      <section className="mt-12" aria-labelledby="p-saved">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="p-saved" className="text-[22px]">
            შენახული ჟესტები{" "}
            <span className="text-[15px] font-normal" style={{ color: "var(--fg-faint)" }}>
              ({savedGestures.length})
            </span>
          </h2>
          <Link href="/chapters" className="focus-ring text-[13.5px] font-semibold" style={{ color: "var(--brand)" }}>
            ბიბლიოთეკა ({GESTURES.length}) →
          </Link>
        </div>
        {savedGestures.length === 0 ? (
          <p className="card mt-4 p-6 text-center text-[14px]" style={{ color: "var(--fg-faint)" }}>
            ჯერ არაფერი შეგინახავს. ჟესტის ბარათზე დააწკაპუნე სანიშნეს ხატულას — და აქ გამოჩნდება.
          </p>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedGestures.map((g) => (
              <GestureCard key={g.id} gesture={g} />
            ))}
          </div>
        )}
      </section>

      {/* --------------------- შენახული პოზები --------------------- */}
      {state.studio.length > 0 && (
        <section className="mt-12" aria-labelledby="p-studio">
          <h2 id="p-studio" className="text-[22px]">
            შენახული 3D პოზები
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {state.studio.map((s) => (
              <Link
                key={s.id}
                href="/studio"
                className="focus-ring rounded-full border px-4 py-2 text-[13.5px] transition-colors hover:bg-[var(--brand-wash)]"
                style={{ borderColor: "var(--line-strong)" }}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* --------------------- გასუფთავება --------------------- */}
      <section className="mt-16 border-t pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[17px]">მონაცემების გასუფთავება</h2>
            <p className="mt-1 max-w-md text-[13.5px] leading-relaxed" style={{ color: "var(--fg-faint)" }}>
              ყველა პროგრესი ინახება მხოლოდ ამ ბრაუზერში — სერვერზე არაფერი იგზავნება. გასუფთავება
              შეუქცევადია.
            </p>
          </div>
          {confirmReset ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setConfirmReset(false);
                }}
                className="focus-ring rounded-full px-4 py-2 text-[13.5px] font-medium"
                style={{ background: "var(--color-clay)", color: "#fff" }}
              >
                დიახ, წაშალე
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="focus-ring rounded-full border px-4 py-2 text-[13.5px]"
                style={{ borderColor: "var(--line-strong)" }}
              >
                გაუქმება
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="focus-ring rounded-full border px-4 py-2 text-[13.5px]"
              style={{ borderColor: "var(--line-strong)", color: "var(--color-clay)" }}
            >
              ყველაფრის წაშლა
            </button>
          )}
        </div>
      </section>
    </>
  );
}
