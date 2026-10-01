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

export function SectionHeading({
  kicker,
  title,
  lead,
  align = "start",
  id,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
  id?: string;
}) {
  return (
    <header
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
      data-reveal="up"
    >
      {kicker && <Eyebrow>{kicker}</Eyebrow>}
      <h2 id={id} className="mt-2 text-balance text-[clamp(1.6rem,3.4vw,2.4rem)]">
        {title}
      </h2>
      {lead && (
        <p className="mt-3 text-pretty text-[15px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {lead}
        </p>
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
      className="my-7 rounded-[var(--radius-card)] border-l-4 p-5"
      style={{ background: s.bg, borderColor: s.fg }}
      data-reveal="up"
    >
      <div className="flex items-center gap-2" style={{ color: s.fg }}>
        <Icon className="size-4 shrink-0" strokeWidth={1.9} aria-hidden="true" />
        <span className="text-[11px] font-bold uppercase tracking-wider">{s.label}</span>
      </div>
      <p className="mt-2 font-serif text-[17px] font-semibold leading-snug" style={{ color: "var(--color-ink)" }}>
        {data.title}
      </p>
      <p className="mt-1.5 text-[14.5px] leading-relaxed" style={{ color: "var(--color-ink-2)" }}>
        {data.text}
      </p>
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
    "focus-ring inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium transition-all duration-300";
  const styles: Record<string, React.CSSProperties> = {
    solid: { background: "var(--brand)", color: "#fff" },
    outline: { border: "1px solid var(--line-strong)", color: "var(--fg)" },
    ghost: { color: "var(--brand)" },
  };
  return (
    <Link
      href={href}
      className={`${base} ${variant === "solid" ? "hover:opacity-88 hover:-translate-y-0.5" : "hover:bg-[var(--brand-wash)]"} ${className}`}
      style={styles[variant]}
      data-cursor={cursor}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */

export function Stat({
  value,
  label,
  sub,
  accent = "var(--brand)",
}: {
  value: string;
  label: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card p-5" data-reveal="up">
      <p className="font-serif text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-none" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-2 text-sm font-semibold">{label}</p>
      {sub && (
        <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--fg-faint)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
