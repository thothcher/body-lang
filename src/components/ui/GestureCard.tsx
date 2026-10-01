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
      className="card group scroll-mt-24 overflow-hidden transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]"
      data-reveal="up"
    >
      <div
        className="relative grid place-items-center px-4 pt-5"
        style={{ background: "var(--bg-sunken)" }}
      >
        <GestureFigure
          gesture={gesture}
          className={`w-full transition-transform duration-500 group-hover:scale-[1.04] ${
            compact ? "h-36" : "h-52"
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
            borderColor: saved ? "var(--color-clay)" : "var(--line)",
            background: saved ? "var(--color-clay)" : "color-mix(in srgb, var(--bg-raised) 80%, transparent)",
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

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ToneBadge tone={gesture.tone} />
          <span className="text-[11px] font-medium" style={{ color: "var(--fg-faint)" }}>
            {PART_LABEL[gesture.part]}
          </span>
        </div>

        <h3 className="mt-2.5 text-[18px] leading-snug">{gesture.title}</h3>
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
                className="mt-3 rounded-xl px-3.5 py-2.5 text-[13.5px] leading-relaxed"
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
          className="focus-ring mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
          style={{ color: "var(--brand)" }}
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
