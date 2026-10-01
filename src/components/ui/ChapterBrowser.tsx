"use client";

import * as React from "react";
import ChapterCard from "./ChapterCard";
import GestureCard from "./GestureCard";
import { CHAPTERS } from "@/lib/content/chapters";
import {
  GESTURES,
  PART_LABEL,
  TONE_LABEL,
  type BodyPart,
  type Tone,
} from "@/lib/content/gestures";
import { useProgress } from "@/lib/progress";
import { ProgressRing } from "./Primitives";
import { Search, X } from "lucide-react";

const PARTS: BodyPart[] = ["palms", "hands", "face", "arms", "legs", "head", "eyes", "space", "look"];
const TONES: Tone[] = ["open", "closed", "dominant", "deceptive", "evaluating", "neutral"];

function norm(s: string) {
  return s.toLowerCase().replace(/[„“"'.,!?—–-]/g, " ");
}

export default function ChapterBrowser() {
  const [q, setQ] = React.useState("");
  const [part, setPart] = React.useState<BodyPart | "all">("all");
  const [tone, setTone] = React.useState<Tone | "all">("all");
  const [onlySaved, setOnlySaved] = React.useState(false);
  const { state, ready } = useProgress();

  const query = norm(q).trim();

  const chapters = React.useMemo(() => {
    if (!query) return CHAPTERS;
    return CHAPTERS.filter((c) =>
      norm(
        [c.title, c.subtitle, c.kicker, c.intro, c.keyPoints.join(" "), c.summary].join(" "),
      ).includes(query),
    );
  }, [query]);

  const gestures = React.useMemo(() => {
    return GESTURES.filter((g) => {
      if (part !== "all" && g.part !== part) return false;
      if (tone !== "all" && g.tone !== tone) return false;
      if (onlySaved && !state.saved.includes(g.id)) return false;
      if (!query) return true;
      return norm([g.title, g.meaning, g.detail, g.tags.join(" "), PART_LABEL[g.part]].join(" ")).includes(
        query,
      );
    });
  }, [query, part, tone, onlySaved, state.saved]);

  const readCount = ready ? state.read.length : 0;
  const pct = CHAPTERS.length ? readCount / CHAPTERS.length : 0;

  const chipStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "var(--brand)" : "var(--bg-raised)",
    color: active ? "#fff" : "var(--fg-muted)",
    borderColor: active ? "var(--brand)" : "var(--line)",
  });

  return (
    <>
      {/* --- ძიება და პროგრესი --- */}
      <div className="card sticky top-[72px] z-40 mt-8 p-4 backdrop-blur" style={{ background: "color-mix(in srgb, var(--bg-raised) 90%, transparent)" }}>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-full border px-4 py-2.5" style={{ borderColor: "var(--line)" }}>
            <Search className="size-4 shrink-0" strokeWidth={1.9} style={{ color: "var(--fg-faint)" }} aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="მოძებნე თავი ან ჟესტი — „ცხვირი“, „ბარიერი“, „მზერა“"
              className="w-full bg-transparent text-[14.5px] outline-none"
              aria-label="ძიება თავებსა და ჟესტებში"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="ძიების გასუფთავება"
                className="focus-ring shrink-0 rounded-full p-1"
                style={{ color: "var(--fg-faint)" }}
              >
                <X className="size-3.5" strokeWidth={2.4} aria-hidden="true" />
              </button>
            )}
          </label>

          {ready && (
            <div className="flex items-center gap-2.5 rounded-full px-3 py-1.5" style={{ background: "var(--bg-sunken)" }}>
              <ProgressRing value={pct} size={34} stroke={3.5} label={`წაკითხულია ${readCount} თავი`} />
              <span className="text-[12.5px] leading-tight" style={{ color: "var(--fg-muted)" }}>
                <strong className="font-semibold">{readCount}</strong>/{CHAPTERS.length}
                <br />
                <span style={{ color: "var(--fg-faint)" }}>წაკითხული</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* --- თავები --- */}
      <section className="mt-10" aria-labelledby="ch-heading">
        <h2 id="ch-heading" className="text-[22px]">
          თავები{" "}
          <span className="text-[15px] font-normal" style={{ color: "var(--fg-faint)" }}>
            ({chapters.length})
          </span>
        </h2>
        {chapters.length === 0 ? (
          <p className="mt-4 text-sm" style={{ color: "var(--fg-faint)" }}>
            ამ ძიებაზე თავი ვერ მოიძებნა.
          </p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((c, i) => (
              <ChapterCard key={c.slug} chapter={c} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* --- ჟესტების ბიბლიოთეკა --- */}
      <section className="mt-16" aria-labelledby="g-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="g-heading" className="text-[22px]">
            ჟესტების ბიბლიოთეკა{" "}
            <span className="text-[15px] font-normal" style={{ color: "var(--fg-faint)" }}>
              ({gestures.length})
            </span>
          </h2>
          {ready && state.saved.length > 0 && (
            <button
              type="button"
              onClick={() => setOnlySaved((v) => !v)}
              className="focus-ring rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
              style={chipStyle(onlySaved)}
              aria-pressed={onlySaved}
            >
              ★ შენახული ({state.saved.length})
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="eyebrow mr-1">ნაწილი</span>
            <button
              type="button"
              onClick={() => setPart("all")}
              className="focus-ring rounded-full border px-3 py-1.5 text-[12.5px] transition-colors"
              style={chipStyle(part === "all")}
            >
              ყველა
            </button>
            {PARTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPart(p)}
                className="focus-ring rounded-full border px-3 py-1.5 text-[12.5px] transition-colors"
                style={chipStyle(part === p)}
              >
                {PART_LABEL[p]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="eyebrow mr-1">ტონი</span>
            <button
              type="button"
              onClick={() => setTone("all")}
              className="focus-ring rounded-full border px-3 py-1.5 text-[12.5px] transition-colors"
              style={chipStyle(tone === "all")}
            >
              ყველა
            </button>
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className="focus-ring rounded-full border px-3 py-1.5 text-[12.5px] transition-colors"
                style={chipStyle(tone === t)}
              >
                {TONE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {gestures.length === 0 ? (
          <p className="mt-6 text-sm" style={{ color: "var(--fg-faint)" }}>
            ამ ფილტრებით ჟესტი ვერ მოიძებნა. სცადე სხვა კომბინაცია.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gestures.map((g) => (
              <GestureCard key={g.id} gesture={g} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
