import * as React from "react";
import BodyFigure from "./BodyFigure";

const LINE = "var(--fig-line)";
const ACCENT = "var(--fig-accent)";

/* ------------------------------------------------------------------
   7 / 38 / 55
------------------------------------------------------------------- */

const RATIO = [
  { pct: 7, label: "სიტყვები", color: "var(--color-slate-cool)", note: "რას ამბობს" },
  { pct: 38, label: "ხმის ტონი", color: "var(--color-amber)", note: "როგორ ამბობს" },
  { pct: 55, label: "სხეულის ენა", color: "var(--color-indigo)", note: "რას გრძნობს" },
];

export function RatioVisual() {
  const R = 62;
  const C = 2 * Math.PI * R;
  // რკალები წინასწარ გამოითვლება — render სუფთა რჩება
  const arcs = RATIO.reduce<{ pct: number; label: string; color: string; note: string; len: number; offset: number }[]>(
    (acc, r) => {
      const len = (r.pct / 100) * C;
      const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].len : 0;
      return [...acc, { ...r, len, offset }];
    },
    [],
  );

  return (
    <div className="my-8 grid items-center gap-8 sm:grid-cols-[180px_1fr]" data-reveal="up">
      <svg viewBox="0 0 160 160" className="mx-auto w-40" role="img" aria-label="7% სიტყვები, 38% ტონი, 55% სხეულის ენა">
        <circle cx="80" cy="80" r={R} fill="none" stroke="var(--line)" strokeWidth="18" />
        {arcs.map((r) => (
          <circle
            key={r.label}
            cx="80"
            cy="80"
            r={R}
            fill="none"
            stroke={r.color}
            strokeWidth="18"
            strokeDasharray={`${r.len} ${C - r.len}`}
            strokeDashoffset={-r.offset}
            transform="rotate(-90 80 80)"
          />
        ))}
        <text x="80" y="74" textAnchor="middle" fontSize="27" fontWeight="700" fill="var(--fg)">
          93%
        </text>
        <text x="80" y="94" textAnchor="middle" fontSize="10" fill="var(--fg-faint)">
          არა სიტყვები
        </text>
      </svg>

      <ul className="grid gap-3">
        {RATIO.map((r, i) => (
          <li key={r.label} className="flex items-center gap-3" data-reveal="left" data-reveal-delay={i * 100}>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: r.color }}>
              {r.pct}%
            </span>
            <span>
              <span className="block text-[15px] font-semibold">{r.label}</span>
              <span className="block text-[13px]" style={{ color: "var(--fg-faint)" }}>
                {r.note}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------
   პროქსემიკა — ოთხი ზონა
------------------------------------------------------------------- */

const ZONES = [
  { r: 42, label: "ინტიმური", dist: "15–46 სმ", color: "var(--color-clay)", op: 0.2 },
  { r: 78, label: "პირადი", dist: "46 სმ – 1.2 მ", color: "var(--color-amber)", op: 0.15 },
  { r: 118, label: "სოციალური", dist: "1.2–3.6 მ", color: "var(--color-indigo)", op: 0.12 },
  { r: 158, label: "საჯარო", dist: "3.6 მ+", color: "var(--color-sage)", op: 0.09 },
];

export function ZonesVisual() {
  return (
    <figure className="my-8" data-reveal="scale">
      <svg viewBox="0 0 360 360" className="mx-auto w-full max-w-md" role="img" aria-label="პირადი სივრცის ოთხი ზონა">
        {[...ZONES].reverse().map((z) => (
          <g key={z.label}>
            <circle cx="180" cy="180" r={z.r} fill={z.color} opacity={z.op} />
            <circle cx="180" cy="180" r={z.r} fill="none" stroke={z.color} strokeWidth="1.6" strokeDasharray="5 6" opacity="0.85" />
          </g>
        ))}

        {/* ზედხედი ადამიანი */}
        <circle cx="180" cy="180" r="15" fill="var(--fig-body)" stroke={LINE} strokeWidth="2.6" />
        <path d="M172 168 Q180 160 188 168" fill="none" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="175" cy="174" r="2" fill={LINE} />
        <circle cx="185" cy="174" r="2" fill={LINE} />

        {ZONES.map((z) => (
          <g key={z.label}>
            <line x1="180" y1={180 - z.r} x2="180" y2={180 - z.r + 0.1} stroke={z.color} />
            <text
              x="186"
              y={180 - z.r + 13}
              fontSize="11.5"
              fontWeight="700"
              fill={z.color}
            >
              {z.label}
            </text>
            <text x="186" y={180 - z.r + 26} fontSize="10" fill="var(--fg-faint)">
              {z.dist}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-3 text-center text-[13px]" style={{ color: "var(--fg-faint)" }}>
        ზონების ზომა კულტურაზეა დამოკიდებული — იაპონელისთვის ~25 სმ, ამერიკელისთვის ~46 სმ.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------
   ჟესტების მტევანი
------------------------------------------------------------------- */

export function ClusterVisual() {
  const items = [
    { n: "1", t: "ლოყა თითზე", d: "შეფასება" },
    { n: "2", t: "თითი პირს ფარავს", d: "ეჭვი" },
    { n: "3", t: "ფეხი ფეხზე", d: "თავდაცვა" },
    { n: "4", t: "ნიკაპი ქვემოთ", d: "კრიტიკა" },
  ];
  return (
    <figure className="my-8 grid items-center gap-6 sm:grid-cols-[1fr_1.2fr]" data-reveal="up">
      <div className="grid place-items-center rounded-[var(--radius-card)] py-4" style={{ background: "var(--bg-sunken)" }}>
        <BodyFigure pose="critical" className="h-56" />
      </div>
      <div>
        <p className="eyebrow">ოთხი ჟესტი = ერთი წინადადება</p>
        <ul className="mt-3 grid gap-2.5">
          {items.map((it, i) => (
            <li key={it.n} className="flex items-center gap-3" data-reveal="left" data-reveal-delay={i * 80}>
              <span
                className="grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold"
                style={{ background: "var(--brand-wash)", color: "var(--brand)" }}
              >
                {it.n}
              </span>
              <span className="text-[14px]">
                <strong className="font-semibold">{it.t}</strong>
                <span style={{ color: "var(--fg-faint)" }}> — {it.d}</span>
              </span>
            </li>
          ))}
        </ul>
        <p
          className="mt-4 rounded-xl px-4 py-3 font-serif text-[15px] italic"
          style={{ background: "var(--color-clay-wash)", color: "var(--color-clay)" }}
        >
          „არ მომწონს, რასაც ამბობთ, და არ გეთანხმებით.“
        </p>
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------
   კონგრუენტულობა
------------------------------------------------------------------- */

export function CongruenceVisual() {
  const panels = [
    {
      pose: "palm-up",
      say: "„სიამოვნებით დაგეხმარებით“",
      verdict: "კონგრუენტული",
      note: "სიტყვა და სხეული ემთხვევა — დაიჯერე.",
      color: "var(--color-sage)",
      bg: "var(--color-sage-wash)",
    },
    {
      pose: "arms-crossed",
      say: "„სიამოვნებით დაგეხმარებით“",
      verdict: "არაკონგრუენტული",
      note: "სხეული საპირისპიროს ამბობს — დაიჯერე სხეული.",
      color: "var(--color-clay)",
      bg: "var(--color-clay-wash)",
    },
  ];
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2" data-reveal="up">
      {panels.map((p, i) => (
        <figure key={p.verdict} className="card overflow-hidden" data-reveal="up" data-reveal-delay={i * 120}>
          <div className="grid place-items-center py-4" style={{ background: "var(--bg-sunken)" }}>
            <BodyFigure pose={p.pose} className="h-48" showFocus={false} />
          </div>
          <figcaption className="p-4">
            <p className="font-serif text-[15px] italic">{p.say}</p>
            <p className="mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: p.bg, color: p.color }}>
              {p.verdict}
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {p.note}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   სარკე
------------------------------------------------------------------- */

export function MirrorVisual() {
  return (
    <figure className="my-8" data-reveal="scale">
      <div className="card grid grid-cols-2 overflow-hidden" style={{ background: "var(--bg-sunken)" }}>
        <div className="grid place-items-center py-6">
          <BodyFigure pose="steeple-up" className="h-52" showFocus={false} />
        </div>
        <div className="grid place-items-center py-6" style={{ transform: "scaleX(-1)" }}>
          <BodyFigure pose="steeple-up" className="h-52" showFocus={false} />
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[13px]" style={{ color: "var(--fg-faint)" }}>
        ორი ადამიანი, რომლებსაც კონტაქტი აქვთ, ქვეცნობიერად ერთნაირ პოზას იღებენ.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------
   სიარულის ტიპები
------------------------------------------------------------------- */

const WALKS = [
  { pose: "open-stance", label: "თავდაჯერებული", note: "სწორი ზურგი, ფართო ნაბიჯი" },
  { pose: "behind-back", label: "ჩაფიქრებული", note: "ნელი, თავი ჩაღუნული" },
  { pose: "self-hug", label: "დაუცველი", note: "მოკლე ნაბიჯი, მხრები წინ" },
  { pose: "hips", label: "ბატონობითი", note: "მძიმე ნაბიჯი, ნიკაპი წინ" },
];

export function WalkVisual() {
  return (
    <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-4" data-reveal="up">
      {WALKS.map((w, i) => (
        <figure key={w.label} className="card overflow-hidden text-center" data-reveal="up" data-reveal-delay={i * 90}>
          <div className="grid place-items-center py-3" style={{ background: "var(--bg-sunken)" }}>
            <BodyFigure pose={w.pose} className="h-36" showFocus={false} />
          </div>
          <figcaption className="px-3 py-3">
            <p className="text-[13.5px] font-semibold">{w.label}</p>
            <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: "var(--fg-faint)" }}>
              {w.note}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   აქსესუარები — სტატიკური რუკა
------------------------------------------------------------------- */

const ACCESSORY_PINS = [
  { x: 128, y: 52, label: "სათვალე", note: "ცხვირწვერზე დაწეული = კრიტიკა" },
  { x: 78, y: 96, label: "საყელო", note: "დაჭიმვა = ბრაზი ან სიცრუე" },
  { x: 143, y: 186, label: "საათი", note: "შეხება = შენიღბული ბარიერი" },
  { x: 62, y: 200, label: "ბეჭედი", note: "ტრიალი = შფოთვა თემასთან" },
  { x: 100, y: 236, label: "ჩანთა/ტელეფონი", note: "სხეულის წინ = ბარიერი" },
];

export function AccessoriesVisual() {
  return (
    <figure className="my-8" data-reveal="up">
      <div className="card grid place-items-center py-6" style={{ background: "var(--bg-sunken)" }}>
        <div className="relative mx-auto aspect-[200/340] w-full max-w-[280px]">
          <BodyFigure pose="thumbs-pockets" className="absolute inset-0 size-full" showFocus={false} />
          <svg viewBox="0 0 200 340" className="absolute inset-0 size-full" aria-hidden="true">
            {ACCESSORY_PINS.map((p, i) => (
              <g key={p.label}>
                <circle cx={p.x} cy={p.y} r="12" fill="none" stroke={ACCENT} strokeWidth="1.6" strokeDasharray="3 4" opacity="0.7" />
                <circle cx={p.x} cy={p.y} r="5.5" fill={ACCENT} />
                <text x={p.x} y={p.y + 3.4} textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff">
                  {i + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {ACCESSORY_PINS.map((p, i) => (
          <li key={p.label} className="flex gap-2.5 text-[13.5px]" data-reveal="up" data-reveal-delay={i * 70}>
            <span
              className="grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
              style={{ background: ACCENT }}
            >
              {i + 1}
            </span>
            <span>
              <strong className="font-semibold">{p.label}</strong>
              <span style={{ color: "var(--fg-faint)" }}> — {p.note}</span>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/* ------------------------------------------------------------------ */

export function SectionVisual({ kind }: { kind: string }) {
  switch (kind) {
    case "ratio":
      return <RatioVisual />;
    case "zones":
      return <ZonesVisual />;
    case "cluster":
      return <ClusterVisual />;
    case "congruence":
      return <CongruenceVisual />;
    case "mirror":
      return <MirrorVisual />;
    case "walk":
      return <WalkVisual />;
    case "accessories":
      return <AccessoriesVisual />;
    default:
      return null;
  }
}
