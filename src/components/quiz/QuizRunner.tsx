"use client";

import * as React from "react";
import Link from "next/link";
import GestureFigure from "@/components/figures/GestureFigure";
import { GESTURE_MAP } from "@/lib/content/gestures";
import type { Question } from "@/lib/content/quiz";
import { useProgress } from "@/lib/progress";
import { ProgressRing } from "@/components/ui/Primitives";

export interface QuizRunnerProps {
  questions: Question[];
  /** localStorage-ის გასაღები შედეგისთვის */
  testId: string;
  title?: string;
  /** დასრულების შემდეგ ბმულები */
  nextHref?: string;
  nextLabel?: string;
  compact?: boolean;
}

type Phase = "idle" | "answered" | "done";

function verdict(pct: number) {
  if (pct >= 0.9)
    return {
      title: "შესანიშნავია!",
      text: "შენ ჟესტებს კლასტერებად კითხულობ — ეს ზუსტად ის უნარია, რასაც წიგნი ასწავლის.",
      color: "var(--color-sage)",
    };
  if (pct >= 0.7)
    return {
      title: "ძალიან კარგი",
      text: "საფუძველი მყარია. გაიმეორე ის თავები, სადაც შეცდომა დაუშვი — და შედეგი 90%-ს გადააჭარბებს.",
      color: "var(--color-indigo)",
    };
  if (pct >= 0.5)
    return {
      title: "კარგი დასაწყისი",
      text: "ნახევარზე მეტი სწორია. დაუბრუნდი „სამი წესის“ თავს — ის შეცდომების უმეტესობას აღმოფხვრის.",
      color: "var(--color-amber)",
    };
  return {
    title: "ჯერ სავარჯიშოა",
    text: "არაუშავს — ეს პირველი წრეა. წაიკითხე თავები თავიდან და სცადე თამაში „გამოიცანი ჟესტი“.",
    color: "var(--color-clay)",
  };
}

export default function QuizRunner({
  questions,
  testId,
  title,
  nextHref,
  nextLabel,
  compact = false,
}: QuizRunnerProps) {
  const [i, setI] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [picked, setPicked] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [wrong, setWrong] = React.useState<Question[]>([]);
  const { recordQuiz, state, ready } = useProgress();
  const saved = React.useRef(false);

  const q = questions[i];
  const total = questions.length;
  const best = ready ? state.quiz[testId] : undefined;

  const choose = (idx: number) => {
    if (phase !== "idle") return;
    setPicked(idx);
    setPhase("answered");
    if (idx === q.answer) setScore((s) => s + 1);
    else setWrong((w) => [...w, q]);
  };

  const next = () => {
    if (i + 1 >= total) setPhase("done");
    else {
      setI((v) => v + 1);
      setPicked(null);
      setPhase("idle");
    }
  };

  // საბოლოო ქულა ერთხელ ჩაიწერება, როცა ტესტი სრულდება
  React.useEffect(() => {
    if (phase === "done" && !saved.current) {
      saved.current = true;
      recordQuiz(testId, score, total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const restart = () => {
    setI(0);
    setPhase("idle");
    setPicked(null);
    setScore(0);
    setWrong([]);
    saved.current = false;
  };

  if (!total) {
    return (
      <p className="card p-6 text-center text-sm" style={{ color: "var(--fg-faint)" }}>
        ამ თემაზე კითხვები ჯერ არ არის.
      </p>
    );
  }

  /* ------------------------------ შედეგი ------------------------------ */
  if (phase === "done") {
    const pct = score / total;
    const v = verdict(pct);
    return (
      <div className="card overflow-hidden p-6 sm:p-8" data-reveal="scale">
        <div className="flex flex-col items-center text-center">
          <ProgressRing value={pct} size={96} stroke={8} label={`შედეგი ${score} ${total}-დან`} />
          <h3 className="mt-5 text-[24px]" style={{ color: v.color }}>
            {v.title}
          </h3>
          <p className="mt-1 text-[15px]" style={{ color: "var(--fg-muted)" }}>
            {score} სწორი პასუხი {total}-დან
          </p>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            {v.text}
          </p>
          {best && best.best > score && (
            <p className="mt-2 text-[13px]" style={{ color: "var(--fg-faint)" }}>
              შენი რეკორდი: {best.best}/{best.total}
            </p>
          )}
        </div>

        {wrong.length > 0 && (
          <div className="mt-7">
            <p className="eyebrow">გასამეორებელი</p>
            <ul className="mt-3 grid gap-2.5">
              {wrong.map((w) => (
                <li
                  key={w.id}
                  className="rounded-xl p-3.5 text-[13.5px] leading-relaxed"
                  style={{ background: "var(--bg-sunken)" }}
                >
                  <p className="font-semibold">
                    {w.kind === "figure" && w.gestureId ? GESTURE_MAP[w.gestureId]?.title : w.prompt}
                  </p>
                  <p className="mt-1" style={{ color: "var(--fg-muted)" }}>
                    <strong style={{ color: "var(--color-sage)" }}>სწორი: </strong>
                    {w.options[w.answer]}
                  </p>
                  <p className="mt-1" style={{ color: "var(--fg-faint)" }}>
                    {w.explain}
                  </p>
                  <Link
                    href={`/chapters/${w.chapter}`}
                    className="focus-ring mt-1.5 inline-block text-[12.5px] font-semibold"
                    style={{ color: "var(--brand)" }}
                  >
                    თავზე გადასვლა →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={restart}
            className="focus-ring rounded-full px-5 py-2.5 text-[14.5px] font-medium"
            style={{ background: "var(--brand)", color: "#fff" }}
            data-cursor="თავიდან"
          >
            თავიდან
          </button>
          {nextHref && (
            <Link
              href={nextHref}
              className="focus-ring rounded-full border px-5 py-2.5 text-[14.5px]"
              style={{ borderColor: "var(--line-strong)" }}
            >
              {nextLabel ?? "შემდეგი"}
            </Link>
          )}
          <Link
            href="/progress"
            className="focus-ring rounded-full px-5 py-2.5 text-[14.5px]"
            style={{ color: "var(--brand)" }}
          >
            ჩემი პროგრესი
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------ კითხვა ------------------------------ */
  const gesture = q.kind === "figure" && q.gestureId ? GESTURE_MAP[q.gestureId] : undefined;

  return (
    <div className="card overflow-hidden">
      {/* პროგრესი */}
      <div className="flex items-center gap-3 border-b px-5 py-3">
        <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--fg-faint)" }}>
          {i + 1} / {total}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--bg-sunken)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${((i + (phase === "answered" ? 1 : 0)) / total) * 100}%`, background: "var(--brand)" }}
          />
        </div>
        <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--color-sage)" }}>
          ✓ {score}
        </span>
      </div>

      <div className={compact ? "p-5" : "p-5 sm:p-7"}>
        {title && <p className="eyebrow mb-2">{title}</p>}

        {gesture && (
          <div
            className="mb-5 grid place-items-center rounded-2xl py-4"
            style={{ background: "var(--bg-sunken)" }}
          >
            <GestureFigure gesture={gesture} labelled={false} className={compact ? "h-40" : "h-52"} />
          </div>
        )}

        <h3 className="text-[19px] leading-snug">{q.prompt}</h3>

        <div className="mt-4 grid gap-2.5">
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.answer;
            const isPicked = idx === picked;
            const show = phase === "answered";
            let bg = "var(--bg-raised)";
            let border = "var(--line)";
            let color = "var(--fg)";
            if (show && isCorrect) {
              bg = "var(--color-sage-wash)";
              border = "var(--color-sage)";
              color = "var(--color-ink)";
            } else if (show && isPicked) {
              bg = "var(--color-clay-wash)";
              border = "var(--color-clay)";
              color = "var(--color-ink)";
            }
            return (
              <button
                key={opt}
                type="button"
                onClick={() => choose(idx)}
                disabled={show}
                className="focus-ring flex items-start gap-3 rounded-xl border p-3.5 text-left text-[14.5px] leading-relaxed transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-[var(--brand)] disabled:cursor-default"
                style={{ background: bg, borderColor: border, color }}
              >
                <span
                  className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold"
                  style={{
                    borderColor: show && (isCorrect || isPicked) ? "transparent" : "var(--line-strong)",
                    background: show && isCorrect ? "var(--color-sage)" : show && isPicked ? "var(--color-clay)" : "transparent",
                    color: show && (isCorrect || isPicked) ? "#fff" : "var(--fg-faint)",
                  }}
                >
                  {show && isCorrect ? "✓" : show && isPicked ? "✕" : String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {phase === "answered" && (
          <div
            className="mt-4 rounded-xl p-4 text-[14px] leading-relaxed"
            style={{
              background: picked === q.answer ? "var(--color-sage-wash)" : "var(--color-amber-wash)",
              color: "var(--color-ink-2)",
            }}
            data-reveal="up"
          >
            <p className="font-semibold" style={{ color: picked === q.answer ? "var(--color-sage)" : "var(--color-amber)" }}>
              {picked === q.answer ? "სწორია" : "არასწორია"}
            </p>
            <p className="mt-1">{q.explain}</p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <Link
            href={`/chapters/${q.chapter}`}
            className="focus-ring text-[13px] font-medium"
            style={{ color: "var(--fg-faint)" }}
          >
            თავი →
          </Link>
          <button
            type="button"
            onClick={next}
            disabled={phase !== "answered"}
            className="focus-ring rounded-full px-5 py-2.5 text-[14.5px] font-medium transition-opacity disabled:opacity-35"
            style={{ background: "var(--brand)", color: "#fff" }}
            data-cursor={i + 1 >= total ? "დასრულება" : "შემდეგი"}
          >
            {i + 1 >= total ? "შედეგის ნახვა" : "შემდეგი"}
          </button>
        </div>
      </div>
    </div>
  );
}
