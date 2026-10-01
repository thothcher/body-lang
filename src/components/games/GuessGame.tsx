"use client";

import * as React from "react";
import Link from "next/link";
import GestureFigure from "@/components/figures/GestureFigure";
import { GESTURES, type Gesture } from "@/lib/content/gestures";
import { useProgress } from "@/lib/progress";
import { Heart } from "lucide-react";

const ROUND_TIME = 15;
const LIVES = 3;

function shuffle<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function shortMeaning(g: Gesture) {
  return g.meaning.split(" — ")[0].replace(/\.$/, "");
}

interface Round {
  gesture: Gesture;
  options: string[];
  answer: number;
}

function makeRound(exclude: Set<string>): Round {
  const pool = GESTURES.filter((g) => !exclude.has(g.id));
  const gesture = (pool.length ? pool : GESTURES)[
    Math.floor(Math.random() * (pool.length || GESTURES.length))
  ];
  const wrong = shuffle(GESTURES.filter((g) => g.id !== gesture.id && g.tone !== gesture.tone))
    .slice(0, 3)
    .map(shortMeaning);
  const correct = shortMeaning(gesture);
  const options = shuffle([correct, ...wrong]);
  return { gesture, options, answer: options.indexOf(correct) };
}

export default function GuessGame() {
  const [started, setStarted] = React.useState(false);
  const [round, setRound] = React.useState<Round | null>(null);
  const [picked, setPicked] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [lives, setLives] = React.useState(LIVES);
  const [time, setTime] = React.useState(ROUND_TIME);
  const [over, setOver] = React.useState(false);
  const seen = React.useRef<Set<string>>(new Set());
  const { recordGame, state, ready } = useProgress();

  const best = ready ? (state.games["guess"] ?? 0) : 0;

  const nextRound = React.useCallback(() => {
    if (seen.current.size >= GESTURES.length - 4) seen.current.clear();
    setRound(makeRound(seen.current));
    setPicked(null);
    setTime(ROUND_TIME);
  }, []);

  const start = () => {
    seen.current = new Set();
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(LIVES);
    setOver(false);
    setStarted(true);
    setRound(makeRound(seen.current));
    setPicked(null);
    setTime(ROUND_TIME);
  };

  const loseLife = React.useCallback(() => {
    setStreak(0);
    setLives((l) => Math.max(0, l - 1));
  }, []);

  React.useEffect(() => {
    // სიცოცხლეების ამოწურვა ასრულებს თამაშს
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (started && lives <= 0) setOver(true);
  }, [started, lives]);

  // ტაიმერი
  React.useEffect(() => {
    if (!started || over || picked !== null || !round) return;
    if (time <= 0) {
      // ტაიმერის ამოწურვა — გარე მოვლენა
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPicked(-1);
      loseLife();
      return;
    }
    const t = setTimeout(() => setTime((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [started, over, picked, time, round, loseLife]);

  React.useEffect(() => {
    if (over) recordGame("guess", score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over]);

  const choose = (i: number) => {
    if (picked !== null || !round) return;
    setPicked(i);
    seen.current.add(round.gesture.id);
    if (i === round.answer) {
      const bonus = time > 10 ? 3 : time > 5 ? 2 : 1;
      setScore((s) => s + 10 * bonus);
      setStreak((s) => {
        const n = s + 1;
        setBestStreak((b) => Math.max(b, n));
        return n;
      });
    } else {
      loseLife();
    }
  };

  /* -------------------------- საწყისი ეკრანი -------------------------- */
  if (!started) {
    return (
      <div className="card mx-auto max-w-lg p-7 text-center" data-reveal="scale">
        <div className="grid place-items-center">
          <GestureFigure gesture={GESTURES[0]} labelled={false} className="h-44" showFocus={false} />
        </div>
        <h2 className="mt-4 text-[24px]">გამოიცანი ჟესტი</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          ნახე პოზა და აირჩიე სწორი მნიშვნელობა. {ROUND_TIME} წამი ყოველ კითხვაზე, {LIVES} სიცოცხლე.
          რაც უფრო სწრაფია პასუხი, მით მეტი ქულა.
        </p>
        {best > 0 && (
          <p className="mt-3 text-[13px]" style={{ color: "var(--fg-faint)" }}>
            შენი რეკორდი: <strong style={{ color: "var(--color-clay)" }}>{best}</strong> ქულა
          </p>
        )}
        <button
          type="button"
          onClick={start}
          className="focus-ring mt-6 rounded-full px-7 py-3 text-[15px] font-semibold transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--brand)", color: "#fff" }}
          data-cursor="დაწყება"
        >
          დაწყება
        </button>
      </div>
    );
  }

  /* --------------------------- დასრულება --------------------------- */
  if (over) {
    const isRecord = score >= best && score > 0;
    return (
      <div className="card mx-auto max-w-lg p-7 text-center" data-reveal="scale">
        <p className="font-serif text-[40px] font-bold leading-none" style={{ color: "var(--brand)" }}>
          {score}
        </p>
        <p className="mt-1 text-[13px]" style={{ color: "var(--fg-faint)" }}>
          ქულა
        </p>
        <h2 className="mt-4 text-[22px]">
          {isRecord ? "ახალი რეკორდი! 🎉" : score > 100 ? "კარგი შედეგი" : "კიდევ ერთი წრე?"}
        </h2>
        <div className="mx-auto mt-5 grid max-w-xs grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: "var(--bg-sunken)" }}>
            <p className="font-serif text-[22px] font-bold">{bestStreak}</p>
            <p className="text-[11.5px]" style={{ color: "var(--fg-faint)" }}>
              საუკეთესო სერია
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "var(--bg-sunken)" }}>
            <p className="font-serif text-[22px] font-bold">{best}</p>
            <p className="text-[11.5px]" style={{ color: "var(--fg-faint)" }}>
              რეკორდი
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={start}
            className="focus-ring rounded-full px-6 py-2.5 text-[14.5px] font-medium"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            თავიდან
          </button>
          <Link
            href="/games"
            className="focus-ring rounded-full border px-6 py-2.5 text-[14.5px]"
            style={{ borderColor: "var(--line-strong)" }}
          >
            სხვა თამაშები
          </Link>
        </div>
      </div>
    );
  }

  if (!round) return null;

  /* ---------------------------- თამაში ---------------------------- */
  return (
    <div className="mx-auto max-w-2xl">
      {/* სტატუსი */}
      <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-[13px]" style={{ color: "var(--fg-faint)" }}>
            ქულა <strong className="text-[16px] tabular-nums" style={{ color: "var(--fg)" }}>{score}</strong>
          </span>
          {streak > 1 && (
            <span
              className="rounded-full px-2.5 py-1 text-[12px] font-bold"
              style={{ background: "var(--color-amber-wash)", color: "var(--color-amber)" }}
            >
              🔥 {streak} ზედიზედ
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex gap-1" aria-label={`დარჩენილი სიცოცხლე: ${lives}`}>
            {[...Array(LIVES)].map((_, i) => (
              <Heart
                key={i}
                className="size-4 transition-transform duration-300"
                fill={i < lives ? "var(--color-clay)" : "none"}
                color={i < lives ? "var(--color-clay)" : "var(--line-strong)"}
                strokeWidth={2}
                style={{ transform: i < lives ? "scale(1)" : "scale(0.85)" }}
                aria-hidden="true"
              />
            ))}
          </span>
          <span
            className="grid size-9 place-items-center rounded-full text-[13px] font-bold tabular-nums"
            style={{
              background: time <= 5 ? "var(--color-clay-wash)" : "var(--bg-sunken)",
              color: time <= 5 ? "var(--color-clay)" : "var(--fg-muted)",
            }}
          >
            {time}
          </span>
        </div>
      </div>

      {/* დრო */}
      <div className="mt-2 h-1 overflow-hidden rounded-full" style={{ background: "var(--bg-sunken)" }}>
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-linear"
          style={{
            width: `${(time / ROUND_TIME) * 100}%`,
            background: time <= 5 ? "var(--color-clay)" : "var(--brand)",
          }}
        />
      </div>

      {/* ფიგურა */}
      <div
        className="card mt-4 grid place-items-center py-6"
        style={{ background: "var(--bg-sunken)" }}
        key={round.gesture.id}
      >
        <GestureFigure
          gesture={round.gesture}
          labelled={false}
          className="h-56 animate-[float-soft_6s_ease-in-out_infinite]"
        />
      </div>

      {/* პასუხები */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {round.options.map((opt, i) => {
          const show = picked !== null;
          const isCorrect = i === round.answer;
          const isPicked = i === picked;
          let bg = "var(--bg-raised)";
          let border = "var(--line)";
          if (show && isCorrect) {
            bg = "var(--color-sage-wash)";
            border = "var(--color-sage)";
          } else if (show && isPicked) {
            bg = "var(--color-clay-wash)";
            border = "var(--color-clay)";
          }
          return (
            <button
              key={opt}
              type="button"
              onClick={() => choose(i)}
              disabled={show}
              className="focus-ring rounded-xl border p-3.5 text-left text-[14.5px] leading-relaxed transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-[var(--brand)] disabled:cursor-default"
              style={{ background: bg, borderColor: border }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-4" data-reveal="up">
          <div
            className="rounded-xl p-4 text-[14px] leading-relaxed"
            style={{
              background: picked === round.answer ? "var(--color-sage-wash)" : "var(--color-amber-wash)",
              color: "var(--color-ink-2)",
            }}
          >
            <p className="font-semibold" style={{ color: picked === round.answer ? "var(--color-sage)" : "var(--color-amber)" }}>
              {picked === round.answer ? "სწორია" : picked === -1 ? "დრო ამოიწურა" : "არასწორია"} — {round.gesture.title}
            </p>
            <p className="mt-1">{round.gesture.detail}</p>
            <Link
              href={`/chapters/${round.gesture.chapter}`}
              className="focus-ring mt-2 inline-block text-[13px] font-semibold"
              style={{ color: "var(--brand)" }}
            >
              თავზე გადასვლა →
            </Link>
          </div>
          <button
            type="button"
            onClick={nextRound}
            className="focus-ring mt-3 w-full rounded-full px-6 py-3 text-[15px] font-semibold"
            style={{ background: "var(--brand)", color: "#fff" }}
            data-cursor="შემდეგი"
          >
            შემდეგი ჟესტი
          </button>
        </div>
      )}
    </div>
  );
}
