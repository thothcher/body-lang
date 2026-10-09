import * as React from "react";
import Link from "next/link";
import { TONE_COLOR, TONE_LABEL, type Tone } from "@/lib/content/gestures";
import type { Callout as CalloutType } from "@/lib/content/chapters";
import { FlaskConical, Lightbulb, MessageCircleQuestion, TriangleAlert, type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */

export function ToneBadge({ tone, className = "" }: { tone: Tone; className?: string }) {
  const c = TONE_COLOR[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
      style={{ background: c.bg, color: c.fg }}
    >
      <span className="size-1.5 rounded-full" style={{ background: c.dot }} />
      {TONE_LABEL[tone]}
    </span>
  );
}

/* ------------------------------------------------------------------ */

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

/** ტექსტის ბოლოს წერტილი — ბრენდის ხელწერა („ჟესტი.“) */
export function Stop({ text }: { text: string }) {
  if (/[.?!…:»“"]$/.test(text.trim())) return <>{text}</>;
  return (
    <>
      {text}
      <span className="dot">.</span>
    </>
  );
}

/**
 * სექციის სათაური — რედაქციული ბადე: მარცხნივ ნომერი და კიკერი,
 * მარჯვნივ დიდი სათაური. ვიწრო კონტეინერში თავისით ლაგდება ერთ სვეტად.
 */
export function SectionHeading({
  kicker,
  title,
  lead,
  index,
  id,
  stacked = false,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  /** სექციის ნომერი — „01“ */
  index?: string;
  /** @deprecated სათაურები ყოველთვის მარცხნივაა; შენარჩუნებულია თავსებადობისთვის */
  align?: "start" | "center";
  id?: string;
  /** ერთ სვეტად, განურჩევლად სიგანისა */
  stacked?: boolean;
}) {
  return (
    <header className="@container" data-reveal="up">
      <div className={stacked ? "grid gap-3" : "grid gap-3 @3xl:grid-cols-12 @3xl:gap-8"}>
        {(kicker || index) && (
          <div className={stacked ? "" : "@3xl:col-span-4 @3xl:pt-3"}>
            <p className="eyebrow">
              {index && <span className="num" style={{ color: "var(--fg)" }}>{index}</span>}
              {kicker}
            </p>
          </div>
        )}
        <div className={stacked ? "" : kicker || index ? "@3xl:col-span-8" : "@3xl:col-span-12"}>
          <h2 id={id} className="max-w-[22ch] text-balance text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.02] tracking-[-0.045em]">
            <Stop text={title} />
          </h2>
          {lead && (
            <p className="mt-4 max-w-[58ch] text-pretty text-[16px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {lead}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * გვერდის სათაური — „თავები. ისწავლე თანმიმდევრობით.“ დიდი, მკვრივი
 * h1 მარცხნივ, განმარტება კი ქვემოთ მარჯვნივ, ბაზისურ ხაზზე.
 */
export function PageHeading({
  kicker,
  title,
  tagline,
  lead,
  children,
}: {
  kicker?: string;
  title: string;
  tagline?: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="grid gap-6 pb-2 pt-4 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pt-8">
      <div className="lg:col-span-8 xl:col-span-9">
        {kicker && (
          <p className="eyebrow mb-5" data-reveal="down">
            {kicker}
          </p>
        )}
        <h1 className="display text-balance text-[clamp(2.6rem,5.2vw,5rem)]" data-reveal="up">
          <Stop text={title} />
          {tagline && (
            <>
              {" "}
              <span style={{ color: "var(--fg-faint)" }}>
                <Stop text={tagline} />
              </span>
            </>
          )}
        </h1>
      </div>
      {(lead || children) && (
        <div className="lg:col-span-4 lg:pb-2 xl:col-span-3" data-reveal="up" data-reveal-delay="120">
          {lead && (
            <p className="max-w-[46ch] text-pretty text-[15.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {lead}
            </p>
          )}
          {children}
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */

const CALLOUT_STYLE: Record<
  CalloutType["kind"],
  { bg: string; fg: string; label: string; icon: LucideIcon }
> = {
  tip: {
    bg: "var(--color-sage-wash)",
    fg: "var(--color-sage)",
    label: "რჩევა",
    icon: Lightbulb,
  },
  warning: {
    bg: "var(--color-clay-wash)",
    fg: "var(--color-clay)",
    label: "ფრთხილად",
    icon: TriangleAlert,
  },
  myth: {
    bg: "var(--color-amber-wash)",
    fg: "var(--color-amber)",
    label: "მითი",
    icon: MessageCircleQuestion,
  },
  study: {
    bg: "var(--color-indigo-wash)",
    fg: "var(--color-indigo)",
    label: "კვლევა",
    icon: FlaskConical,
  },
};

export function Callout({ data }: { data: CalloutType }) {
  const s = CALLOUT_STYLE[data.kind];
  const Icon = s.icon;
  return (
    <aside
      className="my-8 grid gap-x-5 gap-y-2 rounded-[var(--radius-card)] p-6 sm:grid-cols-[120px_1fr]"
      style={{ background: s.bg }}
      data-reveal="up"
    >
      <div className="flex items-center gap-2 self-start sm:pt-1" style={{ color: s.fg }}>
        <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
        <span className="text-[12px] font-bold">{s.label}</span>
      </div>
      <div>
      <p className="text-[18px] font-bold leading-snug tracking-[-0.02em]" style={{ color: "var(--color-ink)" }}>
        {data.title}
      </p>
      <p className="mt-1.5 text-[14.5px] leading-relaxed" style={{ color: "var(--color-ink-2)" }}>
        {data.text}
      </p>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */

export function ProgressRing({
  value,
  size = 44,
  stroke = 4,
  label,
  track = "var(--line)",
  bar = "var(--brand)",
  text = "var(--fg)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  track?: string;
  bar?: string;
  text?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, value));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${Math.round(p * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={bar}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - p)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset .7s var(--ease-out-soft)" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.28}
        fontWeight="700"
        fill={text}
      >
        {Math.round(p * 100)}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */

export function CTA({
  href,
  children,
  variant = "solid",
  className = "",
  cursor,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
  cursor?: string;
}) {
  const base =
    "focus-ring group/cta inline-flex items-center justify-center gap-2 text-[14.5px] font-semibold transition-all duration-300";
  const variants: Record<string, string> = {
    solid: "rounded-full px-5 py-3 bg-[var(--fg)] text-[var(--bg)] hover:bg-[var(--hot)] hover:text-white",
    outline:
      "rounded-full border border-[var(--line-strong)] px-5 py-3 text-[var(--fg)] hover:border-[var(--fg)] hover:bg-[var(--bg-raised)]",
    ghost: "ink-link px-0.5 py-1 text-[var(--fg)]",
  };
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} data-cursor={cursor}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */

export function Stat({
  value,
  label,
  sub,
  accent = "var(--fg)",
}: {
  value: string;
  label: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="border-t pt-5" style={{ borderColor: "var(--line-strong)" }} data-reveal="up">
      <p className="display text-[clamp(2.6rem,5.4vw,4.4rem)]" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-3 text-[14px] font-semibold">{label}</p>
      {sub && (
        <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: "var(--fg-faint)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
