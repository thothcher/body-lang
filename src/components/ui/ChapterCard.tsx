"use client";

import * as React from "react";
import Link from "next/link";
import GestureFigure from "@/components/figures/GestureFigure";
import { GESTURE_MAP } from "@/lib/content/gestures";
import type { Chapter } from "@/lib/content/chapters";
import { useProgress } from "@/lib/progress";
import { ArrowRight, Check, Clock } from "lucide-react";

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
      className="card focus-ring group relative flex flex-col overflow-hidden transition-all duration-400 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
      data-reveal="up"
      data-reveal-delay={(index % 3) * 90}
      data-cursor="წაკითხვა"
    >
      <div
        className="relative grid h-44 place-items-center overflow-hidden"
        style={{ background: "var(--bg-sunken)" }}
      >
        <span
          className="absolute left-4 top-4 font-serif text-[52px] font-bold leading-none opacity-[0.14]"
          style={{ color: "var(--brand)" }}
          aria-hidden="true"
        >
          {String(chapter.order).padStart(2, "0")}
        </span>
        {gesture && (
          <GestureFigure
            gesture={gesture}
            labelled={false}
            className="h-36 w-auto transition-transform duration-600 group-hover:scale-110 group-hover:-rotate-2"
          />
        )}
        {done && (
          <span
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: "var(--color-sage)", color: "#fff" }}
          >
            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            წაკითხული
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--fg-faint)" }}>
          <span className="font-semibold uppercase tracking-wider">{chapter.kicker}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" strokeWidth={2} aria-hidden="true" />
            {chapter.minutes} წთ
          </span>
        </div>
        <h3 className="mt-2 text-[19px] leading-snug transition-colors group-hover:text-[var(--brand)]">
          {chapter.title}
        </h3>
        <p className="mt-1.5 flex-1 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {chapter.subtitle}
        </p>
        <span
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold"
          style={{ color: "var(--brand)" }}
        >
          გახსნა
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
