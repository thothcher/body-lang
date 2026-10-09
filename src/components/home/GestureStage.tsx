"use client";

import * as React from "react";
import Link from "next/link";
import GestureFigure from "@/components/figures/GestureFigure";
import { ToneBadge } from "@/components/ui/Primitives";
import { GESTURES, PART_LABEL, TONE_LABEL, type Tone } from "@/lib/content/gestures";
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const TONES: Tone[] = ["open", "closed", "dominant", "deceptive", "evaluating"];
const PAGE = 12;

/**
 * მთავარი გვერდის „სცენა“ — მარცხნივ დიდი ფიგურა, მარჯვნივ ჟესტების
 * ბადე ფილტრებით. ბადეში არჩეული ჟესტი მაშინვე სცენაზე გამოდის.
 */
export default function GestureStage({ first = "palm-up" }: { first?: string }) {
  const [tone, setTone] = React.useState<Tone | "all">("all");
  const [shown, setShown] = React.useState(PAGE);
  const [selectedId, setSelectedId] = React.useState(first);
  const stageRef = React.useRef<HTMLDivElement>(null);

  const choose = (id: string) => {
    setSelectedId(id);
    // მობილურზე სცენა ბადის ზემოთაა — არჩევისას მასთან ავდივართ
    if (window.matchMedia("(max-width: 1023px)").matches) {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const list = React.useMemo(
    () => (tone === "all" ? GESTURES : GESTURES.filter((g) => g.tone === tone)),
    [tone],
  );
  const selected = GESTURES.find((g) => g.id === selectedId) ?? GESTURES[0];
  const pos = list.findIndex((g) => g.id === selected.id);

  const step = (dir: 1 | -1) => {
    if (!list.length) return;
    const i = pos === -1 ? 0 : (pos + dir + list.length) % list.length;
    setSelectedId(list[i].id);
    if (i >= shown) setShown(Math.ceil((i + 1) / PAGE) * PAGE);
  };

  const pickTone = (t: Tone | "all") => {
    setTone(t);
    setShown(PAGE);
    const next = t === "all" ? GESTURES : GESTURES.filter((g) => g.tone === t);
    if (next.length && !next.some((g) => g.id === selectedId)) setSelectedId(next[0].id);
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:h-[calc(100svh-68px-28px)] lg:min-h-[660px] lg:grid-cols-[minmax(0,1.07fr)_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-[clamp(20px,2.6vw,44px)] lg:gap-y-0">
      {/* ------------------------------ სცენა ------------------------------ */}
      <div ref={stageRef} className="stage relative h-[min(72svh,620px)] scroll-mt-20 overflow-hidden lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-auto">
        <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3">
          <span className="glass num pointer-events-auto rounded-full px-3 py-1.5 text-[12px]" style={{ color: "var(--fg-muted)" }}>
            {String(pos + 1 || 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
          </span>
          <span className="glass rounded-full px-3 py-1.5 text-[12px]" style={{ color: "var(--fg-muted)" }}>
            {PART_LABEL[selected.part]}
          </span>
        </div>

        {/* ფონური უზარმაზარი ნომერი */}
        <span
          aria-hidden="true"
          className="display pointer-events-none absolute -left-2 bottom-[-0.12em] select-none text-[clamp(9rem,22vw,20rem)] leading-none"
          style={{ color: "var(--fg)", opacity: 0.045 }}
        >
          {String(GESTURES.indexOf(selected) + 1).padStart(2, "0")}
        </span>

        <div className="absolute inset-x-0 bottom-[132px] top-14 grid place-items-center px-6">
          <GestureFigure
            key={selected.id}
            gesture={selected}
            className="animate-stage-in h-full max-h-[520px] w-auto max-w-full"
          />
        </div>

        <div className="glass absolute bottom-4 left-1/2 z-10 w-[min(calc(100%-32px),460px)] -translate-x-1/2 rounded-[22px_22px_22px_6px] p-2" style={{ boxShadow: "var(--shadow-lift)" }}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              className="focus-ring grid size-11 shrink-0 place-items-center rounded-[14px] transition-colors hover:bg-[var(--bg-raised)]"
              aria-label="წინა ჟესტი"
            >
              <ChevronLeft className="size-5" strokeWidth={1.8} aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1 px-1 text-center" aria-live="polite">
              <p className="truncate text-[15px] font-bold tracking-[-0.02em]">{selected.title}</p>
              <p className="truncate text-[12.5px]" style={{ color: "var(--fg-muted)" }}>
                {selected.meaning}
              </p>
            </div>
            <button
              type="button"
              onClick={() => step(1)}
              className="focus-ring grid size-11 shrink-0 place-items-center rounded-[14px] transition-colors hover:bg-[var(--bg-raised)]"
              aria-label="შემდეგი ჟესტი"
            >
              <ChevronRight className="size-5" strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2 border-t px-2 pt-2" style={{ borderColor: "var(--line)" }}>
            <ToneBadge tone={selected.tone} />
            <Link
              href={`/chapters/${selected.chapter}#g-${selected.id}`}
              className="focus-ring ink-link text-[12.5px] font-semibold"
              data-cursor="თავი"
            >
              წაიკითხე თავში →
            </Link>
          </div>
        </div>
      </div>

      {/* ---------------------------- სათაური + ბადე ---------------------------- */}
      <header className="order-first pt-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:pb-6 lg:pt-4">
          <p className="eyebrow" data-reveal="down">
            ალან პიზის წიგნის მიხედვით · ქართულად
          </p>
          <h1 className="display mt-4 text-[clamp(2.6rem,11vw,3.6rem)] lg:text-[clamp(3rem,4.6vw,4.8rem)]" data-reveal="up" data-reveal-delay="60">
            ჟესტი<span className="dot">.</span>
            <br />
            <span style={{ color: "var(--fg-faint)" }}>
              იპოვე მისი აზრი<span className="dot">.</span>
            </span>
          </h1>
          <p className="mt-4 max-w-[44ch] text-[15.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }} data-reveal="up" data-reveal-delay="120">
            დაათვალიერე ჟესტები და ნახე სხეულზე — ადამიანები სიტყვებამდე ლაპარაკობენ.
          </p>
      </header>

      <div className="flex min-h-0 flex-col lg:col-start-2 lg:row-start-2">
        <div className="flex items-center gap-2" role="group" aria-label="ტონის ფილტრი">
          <div className="no-scrollbar -mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 py-1">
            <button type="button" className="focus-ring chip" aria-pressed={tone === "all"} onClick={() => pickTone("all")}>
              ყველა
            </button>
            {TONES.map((t) => (
              <button key={t} type="button" className="focus-ring chip" aria-pressed={tone === t} onClick={() => pickTone(t)}>
                {TONE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <div
          className="mt-3 min-h-0 flex-1 overscroll-contain lg:overflow-y-auto lg:pr-2"
          data-lenis-prevent
          style={{ scrollbarWidth: "thin" }}
        >
          <ul className="grid grid-cols-2 gap-x-3 gap-y-5 pb-2 pt-1 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {list.slice(0, shown).map((g) => {
              const active = g.id === selected.id;
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => choose(g.id)}
                    aria-pressed={active}
                    className="focus-ring group block w-full text-left"
                    data-cursor="სცენაზე"
                  >
                    <span
                      className="grid aspect-[4/5] place-items-center overflow-hidden rounded-[18px_18px_18px_4px] border p-3 transition-[border-color,box-shadow,background] duration-200"
                      style={{
                        background: active ? "var(--bg-raised)" : "color-mix(in srgb, var(--bg-raised) 55%, var(--bg))",
                        borderColor: active ? "var(--hot)" : "var(--line)",
                        boxShadow: active ? "0 0 0 3px color-mix(in srgb, var(--hot) 18%, transparent)" : "none",
                      }}
                    >
                      <GestureFigure
                        gesture={g}
                        labelled={false}
                        showFocus={false}
                        className="h-full w-full transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                    </span>
                    <span className="mt-2 flex items-baseline justify-between gap-2 px-0.5">
                      <span className="line-clamp-2 text-[13px] font-medium leading-snug tracking-[-0.01em]">{g.title}</span>
                      {active && <span className="size-1.5 shrink-0 rounded-full" style={{ background: "var(--hot)" }} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {shown < list.length && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE)}
              className="focus-ring chip mx-auto mt-6 flex"
            >
              მეტი ჟესტი
              <ArrowDown className="size-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          )}
          <p className="num mt-4 text-center text-[11.5px]" style={{ color: "var(--fg-faint)" }}>
            {list.length} ჟესტი
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-5" style={{ borderColor: "var(--line)" }}>
          <Link
            href="/chapters/safuzvlebi"
            className="focus-ring inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14.5px] font-semibold transition-colors duration-300 hover:bg-[var(--hot)] hover:text-white"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
            data-cursor="დაწყება"
          >
            დაიწყე სწავლა
            <ArrowRight className="size-4" strokeWidth={2.2} aria-hidden="true" />
          </Link>
          <Link
            href="/studio"
            className="focus-ring inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[14.5px] font-semibold transition-colors hover:border-[var(--fg)]"
            style={{ borderColor: "var(--line-strong)" }}
            data-cursor="3D"
          >
            3D სტუდია
          </Link>
        </div>
      </div>
    </div>
  );
}
