"use client";

import * as React from "react";
import Link from "next/link";
import GestureFigure from "@/components/figures/GestureFigure";
import { GESTURE_MAP } from "@/lib/content/gestures";
import { SCENES, type Scene } from "@/lib/content/games";
import { useProgress } from "@/lib/progress";
import { ProgressRing } from "@/components/ui/Primitives";

export default function DecodeGame() {
  const [i, setI] = React.useState(0);
  const [picked, setPicked] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const { recordGame, state, ready } = useProgress();
  const saved = React.useRef(false);

  const scene: Scene = SCENES[i];
  const best = ready ? (state.games["decode"] ?? 0) : 0;

  React.useEffect(() => {
    if (done && !saved.current) {
      saved.current = true;
      recordGame("decode", score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === scene.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (i + 1 >= SCENES.length) setDone(true);
    else {
      setI((v) => v + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    saved.current = false;
  };

  if (done) {
    const pct = score / SCENES.length;
    return (
      <div className="card mx-auto max-w-lg p-7 text-center" data-reveal="scale">
        <ProgressRing value={pct} size={92} stroke={8} label={`${score} ${SCENES.length}-დან`} />
        <h2 className="mt-4 text-[23px]">
          {pct >= 0.85 ? "შენ სცენებს კითხულობ" : pct >= 0.6 ? "კარგი თვალი" : "ჯერ სავარჯიშოა"}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {score} სწორი {SCENES.length} სცენიდან.
          {best > score ? ` შენი რეკორდი: ${best}.` : " ეს შენი საუკეთესო შედეგია."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={restart}
            className="focus-ring rounded-full px-6 py-2.5 text-[14.5px] font-medium"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            თავიდან
          </button>
          <Link href="/games" className="focus-ring rounded-full border px-6 py-2.5 text-[14.5px]" style={{ borderColor: "var(--line-strong)" }}>
            სხვა თამაშები
          </Link>
        </div>
      </div>
    );
  }

  const cluster = scene.cluster.map((id) => GESTURE_MAP[id]).filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--fg-faint)" }}>
          სცენა {i + 1} / {SCENES.length}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--bg-sunken)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${((i + (picked !== null ? 1 : 0)) / SCENES.length) * 100}%`, background: "var(--brand)" }}
          />
        </div>
        <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--color-sage)" }}>
          ✓ {score}
        </span>
      </div>

      <article className="card mt-4 overflow-hidden">
        {/* სცენის აღწერა */}
        <div className="border-b p-5" style={{ background: "var(--bg-sunken)" }}>
          <p className="eyebrow">სიტუაცია</p>
          <p className="mt-1.5 text-[15.5px] leading-relaxed">{scene.setup}</p>
          {scene.says && (
            <p
              className="mt-3 border-l-[3px] pl-3 font-serif text-[16px] italic"
              style={{ borderColor: "var(--color-clay)", color: "var(--fg-muted)" }}
            >
              {scene.says}
            </p>
          )}
        </div>

        {/* ჟესტების მტევანი */}
        <div className="grid gap-2 p-4" style={{ gridTemplateColumns: `repeat(${Math.min(cluster.length, 3)}, 1fr)` }}>
          {cluster.map((g, k) => (
            <figure
              key={g.id}
              className="grid place-items-center rounded-xl py-3"
              style={{ background: "var(--bg-sunken)" }}
              data-reveal="up"
              data-reveal-delay={k * 90}
            >
              <GestureFigure gesture={g} labelled={false} className="h-32" />
              <figcaption className="mt-1 px-1 text-center text-[11px] font-medium" style={{ color: "var(--fg-faint)" }}>
                {g.title}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* კითხვა */}
        <div className="p-5 pt-1">
          <h3 className="text-[18px] leading-snug">{scene.question}</h3>
          <div className="mt-4 grid gap-2.5">
            {scene.options.map((opt, idx) => {
              const show = picked !== null;
              const isCorrect = idx === scene.answer;
              const isPicked = idx === picked;
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
                  onClick={() => choose(idx)}
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
            <div
              className="mt-4 rounded-xl p-4 text-[14px] leading-relaxed"
              style={{
                background: picked === scene.answer ? "var(--color-sage-wash)" : "var(--color-amber-wash)",
                color: "var(--color-ink-2)",
              }}
              data-reveal="up"
            >
              <p className="font-semibold" style={{ color: picked === scene.answer ? "var(--color-sage)" : "var(--color-amber)" }}>
                {picked === scene.answer ? "ზუსტად" : "არა მთლად"}
              </p>
              <p className="mt-1">{scene.explain}</p>
              <Link
                href={`/chapters/${scene.chapter}`}
                className="focus-ring mt-2 inline-block text-[13px] font-semibold"
                style={{ color: "var(--brand)" }}
              >
                შესაბამისი თავი →
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={next}
            disabled={picked === null}
            className="focus-ring mt-5 w-full rounded-full px-6 py-3 text-[15px] font-semibold transition-opacity disabled:opacity-35"
            style={{ background: "var(--brand)", color: "#fff" }}
            data-cursor={i + 1 >= SCENES.length ? "შედეგი" : "შემდეგი"}
          >
            {i + 1 >= SCENES.length ? "შედეგის ნახვა" : "შემდეგი სცენა"}
          </button>
        </div>
      </article>
    </div>
  );
}
