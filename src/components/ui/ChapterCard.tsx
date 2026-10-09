"use client";

import * as React from "react";
import Link from "next/link";
import GestureFigure from "@/components/figures/GestureFigure";
import { GESTURE_MAP } from "@/lib/content/gestures";
import type { Chapter } from "@/lib/content/chapters";
import { useProgress } from "@/lib/progress";
import { ArrowUpRight, Check } from "lucide-react";

export default function ChapterCard({
  chapter,
  index = 0,
}: {
  chapter: Chapter;
  index?: number;
}) {
  const { state, ready } = useProgress();
  const done = ready && state.read.includes(chapter.slug);
  const gesture = GESTURE_MAP[chapter.cover];

  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      className="focus-ring group relative flex flex-col"
      data-reveal="up"
      data-reveal-delay={(index % 3) * 90}
      data-cursor="წაკითხვა"
    >
      <div className="stage relative grid aspect-[5/4] place-items-center overflow-hidden transition-[border-color,box-shadow] duration-300 group-hover:border-[var(--line-strong)] group-hover:shadow-[var(--shadow-lift)]">
        <span className="num absolute left-5 top-4 text-[13px]" style={{ color: "var(--fg-faint)" }} aria-hidden="true">
          {String(chapter.order).padStart(2, "0")}
          <span style={{ color: "var(--fg-faint)", opacity: 0.6 }}> / {chapter.kicker}</span>
        </span>
        {gesture && (
          <GestureFigure
            gesture={gesture}
            labelled={false}
            className="h-[68%] w-auto transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.07]"
          />
        )}
        {done && (
          <span
            className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: "var(--color-sage)", color: "#fff" }}
          >
            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            წაკითხული
          </span>
        )}
        <span
          className="absolute bottom-4 right-4 grid size-10 translate-y-2 place-items-center rounded-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
          aria-hidden="true"
        >
          <ArrowUpRight className="size-4" strokeWidth={2.2} />
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-4 px-1 pt-4">
        <h3 className="text-[19px] leading-snug tracking-[-0.025em]">{chapter.title}</h3>
        <span className="num shrink-0 text-[12px]" style={{ color: "var(--fg-faint)" }}>
          {chapter.minutes} წთ
        </span>
      </div>
      <p className="mt-1 px-1 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        {chapter.subtitle}
      </p>
    </Link>
  );
}
