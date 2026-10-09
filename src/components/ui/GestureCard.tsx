"use client";

import * as React from "react";
import GestureFigure from "@/components/figures/GestureFigure";
import { ToneBadge } from "./Primitives";
import { PART_LABEL, type Gesture } from "@/lib/content/gestures";
import { useProgress } from "@/lib/progress";
import { Bookmark, BookmarkCheck, ChevronDown } from "lucide-react";

export default function GestureCard({
  gesture,
  defaultOpen = false,
  compact = false,
}: {
  gesture: Gesture;
  defaultOpen?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const { state, ready, toggleSaved } = useProgress();
  const saved = ready && state.saved.includes(gesture.id);

  return (
    <article
      id={`g-${gesture.id}`}
      className="group flex scroll-mt-28 flex-col"
      data-reveal="up"
    >
      <div className="stage relative grid place-items-center overflow-hidden px-4 pt-6 transition-[border-color,box-shadow] duration-300 group-hover:border-[var(--line-strong)] group-hover:shadow-[var(--shadow-lift)]">
        <GestureFigure
          gesture={gesture}
          className={`w-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05] ${
            compact ? "h-40" : "h-56"
          }`}
        />
        <button
          type="button"
          onClick={() => toggleSaved(gesture.id)}
          aria-pressed={saved}
          aria-label={saved ? "შენახულიდან ამოშლა" : "შენახვა"}
          title={saved ? "შენახულია" : "შეინახე"}
          data-cursor={saved ? "ამოშლა" : "შენახვა"}
          className="focus-ring absolute right-3 top-3 grid size-9 place-items-center rounded-full border backdrop-blur transition-colors"
          style={{
            borderColor: saved ? "var(--hot)" : "var(--line)",
            background: saved ? "var(--hot)" : "var(--glass)",
            color: saved ? "#fff" : "var(--fg-muted)",
          }}
        >
          {saved ? (
            <BookmarkCheck className="size-4" strokeWidth={2} aria-hidden="true" />
          ) : (
            <Bookmark className="size-4" strokeWidth={1.8} aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[18px] leading-snug tracking-[-0.025em]">{gesture.title}</h3>
          <ToneBadge tone={gesture.tone} className="mt-0.5 shrink-0" />
        </div>
        <p className="mt-0.5 text-[12px]" style={{ color: "var(--fg-faint)" }}>
          {PART_LABEL[gesture.part]}
        </p>
        <p className="mt-1.5 text-[14.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {gesture.meaning}
        </p>

        <div
          className="grid transition-[grid-template-rows] duration-500"
          style={{ gridTemplateRows: open ? "1fr" : "0fr", ["--ease" as string]: "var(--ease-out-soft)" }}
        >
          <div className="overflow-hidden">
            <p className="pt-3 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {gesture.detail}
            </p>
            {gesture.response && (
              <p
                className="mt-3 rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed"
                style={{ background: "var(--brand-wash)", color: "var(--brand-deep)" }}
              >
                <strong className="font-semibold">რა ვქნა: </strong>
                {gesture.response}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {gesture.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full px-2 py-0.5 text-[11px]"
                  style={{ background: "var(--bg-sunken)", color: "var(--fg-faint)" }}
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="focus-ring mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors hover:text-[var(--hot)]"
          style={{ color: "var(--fg)" }}
        >
          {open ? "დახურვა" : "ვრცლად"}
          <ChevronDown
            className="size-3.5 transition-transform duration-300"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
}
