import * as React from "react";

const LINE = "var(--fig-line)";
const BODY = "var(--fig-body)";
const ACCENT = "var(--fig-accent)";

const S = {
  stroke: LINE,
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** თითი — კაფსულა მოცემულ კუთხეზე */
function Finger({
  x,
  y,
  len,
  w = 13,
  rot = 0,
  folded = false,
}: {
  x: number;
  y: number;
  len: number;
  w?: number;
  rot?: number;
  folded?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect
        x={-w / 2}
        y={-len}
        width={w}
        height={len + w / 2}
        rx={w / 2}
        fill={folded ? "var(--fig-body-2)" : BODY}
        {...S}
      />
    </g>
  );
}

export type HandSignKind =
  | "ok"
  | "thumb-up"
  | "v-sign"
  | "money"
  | "palm-open"
  | "point";

export interface HandSignProps {
  sign: HandSignKind;
  className?: string;
  title?: string;
}

/** კულტურულად დატვირთული ხელის ნიშნები. */
export default function HandSign({ sign, className, title }: HandSignProps) {
  const palm = (
    <rect x={38} y={74} width={62} height={60} rx={22} fill={BODY} {...S} />
  );
  const wrist = (
    <path d="M52 132 L52 154 Q69 162 86 154 L86 132" fill={BODY} {...S} />
  );

  const content = () => {
    switch (sign) {
      case "ok":
        return (
          <>
            {wrist}
            <Finger x={62} y={80} len={44} rot={-4} />
            <Finger x={78} y={80} len={40} rot={4} />
            <Finger x={93} y={84} len={32} rot={12} />
            {palm}
            {/* წრე — ცერი + საჩვენებელი */}
            <circle cx={40} cy={66} r={20} fill="none" stroke={ACCENT} strokeWidth={7} />
            <circle cx={40} cy={66} r={20} fill="none" stroke={LINE} strokeWidth={2.4} />
            <circle cx={40} cy={66} r={13} fill="none" stroke={LINE} strokeWidth={2} opacity={0.5} />
            <path d="M44 84 Q34 96 40 110" fill="none" {...S} strokeWidth={12} />
            <path d="M44 84 Q34 96 40 110" fill="none" stroke={BODY} strokeWidth={7} strokeLinecap="round" />
          </>
        );

      case "thumb-up":
        return (
          <>
            {wrist}
            {/* ცერი ზემოთ — მუშტიდან ამოსული */}
            <path d="M46 96 Q40 62 46 40" fill="none" {...S} strokeWidth={25} />
            <path d="M46 96 Q40 62 46 40" fill="none" stroke={BODY} strokeWidth={19} strokeLinecap="round" />
            {/* მუშტი */}
            <rect x={42} y={78} width={56} height={56} rx={22} fill={BODY} {...S} />
            {/* მოკეცილი თითები */}
            <path
              d="M58 90 Q76 85 92 92 M58 104 Q76 99 94 106 M58 118 Q76 113 92 120"
              fill="none"
              stroke={LINE}
              strokeWidth={2.4}
              opacity={0.6}
            />
            <path d="M34 34 L34 20 M58 34 L58 20" stroke={ACCENT} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
          </>
        );

      case "v-sign":
        return (
          <>
            {wrist}
            <Finger x={52} y={82} len={58} rot={-15} />
            <Finger x={78} y={82} len={58} rot={15} />
            <rect x={40} y={78} width={58} height={56} rx={20} fill={BODY} {...S} />
            <path
              d="M54 104 Q74 99 88 106 M54 116 Q74 111 88 118"
              fill="none"
              stroke={LINE}
              strokeWidth={2.4}
              opacity={0.65}
            />
            <path
              d="M46 34 L62 76 M92 34 L76 76"
              stroke={ACCENT}
              strokeWidth={2.4}
              strokeDasharray="4 6"
              fill="none"
              opacity={0.7}
            />
          </>
        );

      case "money":
        return (
          <>
            {wrist}
            <rect x={42} y={80} width={56} height={54} rx={21} fill={BODY} {...S} />
            {/* საჩვენებელი თითი ზემოთ */}
            <path d="M62 84 Q60 60 66 44" fill="none" {...S} strokeWidth={19} />
            <path d="M62 84 Q60 60 66 44" fill="none" stroke={BODY} strokeWidth={13} strokeLinecap="round" />
            {/* ცერი — წვერები ეხება */}
            <path d="M44 92 Q36 66 58 46" fill="none" {...S} strokeWidth={19} />
            <path d="M44 92 Q36 66 58 46" fill="none" stroke={BODY} strokeWidth={13} strokeLinecap="round" />
            {/* შეხების წერტილი + მოსრესვის რკალები */}
            <circle cx={62} cy={44} r={11} fill="none" stroke={ACCENT} strokeWidth={2.6} strokeDasharray="3 4" />
            <path d="M78 34 Q88 40 86 52" fill="none" stroke={ACCENT} strokeWidth={2.8} strokeLinecap="round" />
            <path d="M46 26 Q34 32 36 44" fill="none" stroke={ACCENT} strokeWidth={2.8} strokeLinecap="round" />
            {/* მოკეცილი თითები */}
            <path
              d="M62 106 Q78 101 94 108 M62 118 Q78 113 92 120"
              fill="none"
              stroke={LINE}
              strokeWidth={2.4}
              opacity={0.6}
            />
          </>
        );

      case "point":
        return (
          <>
            {wrist}
            <Finger x={62} y={82} len={62} w={21} rot={0} />
            <rect x={40} y={78} width={58} height={56} rx={21} fill={BODY} {...S} />
            <path
              d="M58 96 Q78 90 94 98 M58 108 Q78 102 94 110 M58 120 Q76 115 92 122"
              fill="none"
              stroke={LINE}
              strokeWidth={2.4}
              opacity={0.6}
            />
            <path d="M62 16 L62 4" stroke={ACCENT} strokeWidth={3.4} strokeLinecap="round" />
          </>
        );

      default: // palm-open
        return (
          <>
            {wrist}
            <Finger x={44} y={82} len={48} rot={-18} />
            <Finger x={60} y={76} len={58} rot={-6} />
            <Finger x={77} y={76} len={56} rot={6} />
            <Finger x={93} y={82} len={44} rot={18} />
            <rect x={38} y={74} width={62} height={60} rx={22} fill={BODY} {...S} />
            {/* ცერი */}
            <path d="M40 96 Q18 96 14 78" fill="none" {...S} strokeWidth={17} />
            <path d="M40 96 Q18 96 14 78" fill="none" stroke={BODY} strokeWidth={12} strokeLinecap="round" />
            <path
              d="M52 100 Q70 96 86 100"
              fill="none"
              stroke={LINE}
              strokeWidth={2.2}
              opacity={0.5}
            />
          </>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 140 170"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <ellipse cx={70} cy={160} rx={34} ry={6} fill="var(--fig-ghost)" />
      {content()}
    </svg>
  );
}
