"use client";

import * as React from "react";
import Link from "next/link";
import GestureFigure from "@/components/figures/GestureFigure";
import { GESTURES, type Gesture } from "@/lib/content/gestures";
import { useProgress } from "@/lib/progress";
import { PersonStanding } from "lucide-react";

type Level = { pairs: number; label: string };
const LEVELS: Level[] = [
  { pairs: 6, label: "მარტივი" },
  { pairs: 8, label: "საშუალო" },
  { pairs: 10, label: "რთული" },
];

interface Card {
  key: string;
  gestureId: string;
  kind: "figure" | "text";
  gesture: Gesture;
}

function shuffle<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildDeck(pairs: number): Card[] {
  const picked = shuffle(GESTURES).slice(0, pairs);
  const cards: Card[] = picked.flatMap((g) => [
    { key: `${g.id}-f`, gestureId: g.id, kind: "figure" as const, gesture: g },
    { key: `${g.id}-t`, gestureId: g.id, kind: "text" as const, gesture: g },
  ]);
  return shuffle(cards);
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function MemoryGame() {
  const [level, setLevel] = React.useState<Level | null>(null);
  const [deck, setDeck] = React.useState<Card[]>([]);
  const [flipped, setFlipped] = React.useState<string[]>([]);
  const [matched, setMatched] = React.useState<string[]>([]);
  const [moves, setMoves] = React.useState(0);
  const [seconds, setSeconds] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [lastMatch, setLastMatch] = React.useState<Gesture | null>(null);
  const { recordGame, state, ready } = useProgress();

  const start = (l: Level) => {
    setLevel(l);
    setDeck(buildDeck(l.pairs));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setDone(false);
    setLastMatch(null);
  };

  React.useEffect(() => {
    if (!level || done) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [level, done]);

  React.useEffect(() => {
    if (level && matched.length === level.pairs * 2 && matched.length > 0) {
      // ყველა წყვილის პოვნა ასრულებს რაუნდს
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDone(true);
      recordGame(`memory-${level.pairs}`, seconds, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched, level]);

  React.useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped.map((k) => deck.find((c) => c.key === k)!);
    // ორი კარტის გადაბრუნება — მომხმარებლის ქმედების შედეგი
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMoves((m) => m + 1);
    if (a.gestureId === b.gestureId) {
      setMatched((m) => [...m, a.key, b.key]);
      setLastMatch(a.gesture);
      setFlipped([]);
    } else {
      const t = setTimeout(() => setFlipped([]), 900);
      return () => clearTimeout(t);
    }
  }, [flipped, deck]);

  const flip = (key: string) => {
    if (flipped.length >= 2 || flipped.includes(key) || matched.includes(key)) return;
    setFlipped((f) => [...f, key]);
  };

  /* ------------------------ დონის არჩევა ------------------------ */
  if (!level) {
    return (
      <div className="card mx-auto max-w-lg p-7 text-center" data-reveal="scale">
        <h2 className="text-[24px]">მეხსიერების ბანქო</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          იპოვე წყვილები: ილუსტრაცია და მისი მნიშვნელობა. ყოველი შეწყვილება ჟესტს მეხსიერებაში
          ამაგრებს.
        </p>
        <div className="mt-6 grid gap-2.5">
          {LEVELS.map((l) => {
            const best = ready ? state.games[`memory-${l.pairs}`] : undefined;
            return (
              <button
                key={l.pairs}
                type="button"
                onClick={() => start(l)}
                className="focus-ring flex items-center justify-between rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]"
                style={{ borderColor: "var(--line)" }}
                data-cursor="დაწყება"
              >
                <span>
                  <span className="block text-[15px] font-semibold">{l.label}</span>
                  <span className="block text-[12.5px]" style={{ color: "var(--fg-faint)" }}>
                    {l.pairs} წყვილი · {l.pairs * 2} კარტი
                  </span>
                </span>
                {best !== undefined && (
                  <span
                    className="rounded-full px-2.5 py-1 text-[12px] font-bold tabular-nums"
                    style={{ background: "var(--color-sage-wash)", color: "var(--color-sage)" }}
                  >
                    {fmt(best)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* --------------------------- დასრულება --------------------------- */
  if (done) {
    const best = ready ? state.games[`memory-${level.pairs}`] : undefined;
    return (
      <div className="card mx-auto max-w-lg p-7 text-center" data-reveal="scale">
        <p className="font-serif text-[40px] font-bold leading-none" style={{ color: "var(--color-sage)" }}>
          {fmt(seconds)}
        </p>
        <h2 className="mt-3 text-[22px]">ყველა წყვილი იპოვე!</h2>
        <p className="mt-2 text-[14.5px]" style={{ color: "var(--fg-muted)" }}>
          {moves} სვლა · {level.pairs} წყვილი
          {best !== undefined && best === seconds ? " · ახალი რეკორდი 🎉" : ""}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => start(level)}
            className="focus-ring rounded-full px-6 py-2.5 text-[14.5px] font-medium"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            თავიდან
          </button>
          <button
            type="button"
            onClick={() => setLevel(null)}
            className="focus-ring rounded-full border px-6 py-2.5 text-[14.5px]"
            style={{ borderColor: "var(--line-strong)" }}
          >
            სხვა დონე
          </button>
          <Link
            href="/games"
            className="focus-ring rounded-full px-6 py-2.5 text-[14.5px]"
            style={{ color: "var(--brand)" }}
          >
            სხვა თამაშები
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------------------- დაფა ---------------------------- */
  return (
    <div className="mx-auto max-w-3xl">
      <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4 text-[13px]" style={{ color: "var(--fg-faint)" }}>
          <span>
            დრო <strong className="text-[16px] tabular-nums" style={{ color: "var(--fg)" }}>{fmt(seconds)}</strong>
          </span>
          <span>
            სვლა <strong className="text-[16px] tabular-nums" style={{ color: "var(--fg)" }}>{moves}</strong>
          </span>
          <span>
            ნაპოვნი{" "}
            <strong className="text-[16px] tabular-nums" style={{ color: "var(--color-sage)" }}>
              {matched.length / 2}/{level.pairs}
            </strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setLevel(null)}
          className="focus-ring rounded-full border px-3.5 py-1.5 text-[12.5px]"
          style={{ borderColor: "var(--line)" }}
        >
          დონის შეცვლა
        </button>
      </div>

      <div
        className="mt-4 grid gap-2.5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(124px, 1fr))" }}
      >
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.key) || matched.includes(card.key);
          const isMatched = matched.includes(card.key);
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => flip(card.key)}
              disabled={isMatched}
              aria-label={isFlipped ? card.gesture.title : "დახურული კარტი"}
              className="focus-ring relative aspect-[3/4] w-full rounded-xl transition-transform duration-500 disabled:cursor-default"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "none",
              }}
              data-cursor={isFlipped ? undefined : "გადაბრუნება"}
            >
              {/* ზურგი */}
              <span
                className="absolute inset-0 grid place-items-center rounded-xl border"
                style={{
                  backfaceVisibility: "hidden",
                  background: "var(--brand)",
                  borderColor: "var(--brand-deep)",
                }}
              >
                <PersonStanding className="size-7 opacity-60" color="#fff" strokeWidth={1.6} aria-hidden="true" />
              </span>

              {/* პირი */}
              <span
                className="absolute inset-0 grid grid-rows-[1fr_auto] overflow-hidden rounded-xl border p-1.5"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: isMatched ? "var(--color-sage-wash)" : "var(--bg-raised)",
                  borderColor: isMatched ? "var(--color-sage)" : "var(--line-strong)",
                }}
              >
                {card.kind === "figure" ? (
                  <>
                    <GestureFigure gesture={card.gesture} labelled={false} className="size-full" showFocus={false} />
                    <span className="pb-0.5 text-center text-[9.5px]" style={{ color: "var(--fg-faint)" }}>
                      ჟესტი
                    </span>
                  </>
                ) : (
                  <>
                    <span className="grid place-items-center px-1 text-center text-[11.5px] font-medium leading-tight">
                      {card.gesture.meaning.split(" — ")[0].replace(/\.$/, "")}
                    </span>
                    <span className="pb-0.5 text-center text-[9.5px]" style={{ color: "var(--fg-faint)" }}>
                      მნიშვნელობა
                    </span>
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {lastMatch && (
        <p
          className="mt-4 rounded-xl px-4 py-3 text-center text-[13.5px]"
          style={{ background: "var(--color-sage-wash)", color: "var(--color-ink-2)" }}
          aria-live="polite"
        >
          <strong style={{ color: "var(--color-sage)" }}>{lastMatch.title}</strong> — {lastMatch.meaning}
        </p>
      )}
    </div>
  );
}
