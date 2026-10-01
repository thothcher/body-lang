import * as React from "react";
import { SEATED_POSES, type Pt } from "./poses";

const LINE = "var(--fig-line)";
const BODY = "var(--fig-body)";

function Limb({ points, w = 14 }: { points: Pt[]; w?: number }) {
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
  return (
    <>
      <path d={d} fill="none" stroke={LINE} strokeWidth={w + 5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={BODY} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

export interface SeatedFigureProps {
  pose: string;
  className?: string;
  showFocus?: boolean;
  title?: string;
}

/** გვერდხედი, მჯდომარე ფიგურა — ფეხების ჟესტებისთვის. */
export default function SeatedFigure({
  pose: poseKey,
  className,
  showFocus = true,
  title,
}: SeatedFigureProps) {
  const pose = SEATED_POSES[poseKey] ?? SEATED_POSES["sit-open"];
  const lean = pose.lean ?? 0;
  const head: Pt = [99, 98];
  const shoulder: Pt = [94, 138];
  const hip: Pt = [86, 228];

  return (
    <svg
      viewBox="0 0 220 340"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}

      <ellipse cx={110} cy={326} rx={70} ry={7} fill="var(--fig-ghost)" />

      {/* --- სკამი --- */}
      <g stroke={LINE} strokeWidth={3.2} strokeLinecap="round" fill="none" opacity={0.85}>
        <path d="M54 234 L54 318" />
        <path d="M126 236 L128 318" />
        <rect x={50} y={224} width={82} height={12} rx={5} fill="var(--bg-sunken)" />
        <path d="M54 224 L48 132" />
        <rect x={40} y={122} width={16} height={46} rx={6} fill="var(--bg-sunken)" />
      </g>

      {/* --- უკანა ფეხი --- */}
      <Limb points={[pose.legB[0], pose.legB[1], pose.legB[2]]} w={14} />
      <Limb points={[pose.legB[2], pose.legB[3]]} w={9} />

      {/* --- ტანი --- */}
      <g transform={`rotate(${lean} ${hip[0]} ${hip[1]})`}>
        <path
          d={`M${shoulder[0] - 14} ${shoulder[1] - 4}
              Q${shoulder[0] - 22} ${shoulder[1] + 46} ${hip[0] - 6} ${hip[1]}
              L${hip[0] + 20} ${hip[1] + 4}
              Q${shoulder[0] + 22} ${shoulder[1] + 44} ${shoulder[0] + 15} ${shoulder[1] - 4}
              Q${shoulder[0]} ${shoulder[1] - 14} ${shoulder[0] - 14} ${shoulder[1] - 4} Z`}
          fill={BODY}
          stroke={LINE}
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* კისერი */}
        <Limb points={[[head[0] - 1, head[1] + 20], [shoulder[0], shoulder[1] - 4]]} w={12} />

        {/* თავი — პროფილთან ახლოს, მარჯვნივ მიმართული */}
        <g transform={`rotate(${pose.headTilt ?? 0} ${head[0]} ${head[1]})`}>
          <path
            d={`M${head[0]} ${head[1] - 24}
                Q${head[0] + 24} ${head[1] - 22} ${head[0] + 24} ${head[1] - 2}
                Q${head[0] + 25} ${head[1] + 4} ${head[0] + 20} ${head[1] + 6}
                Q${head[0] + 21} ${head[1] + 18} ${head[0] + 8} ${head[1] + 22}
                Q${head[0] - 22} ${head[1] + 24} ${head[0] - 24} ${head[1] - 2}
                Q${head[0] - 24} ${head[1] - 24} ${head[0]} ${head[1] - 24} Z`}
            fill={BODY}
            stroke={LINE}
            strokeWidth={3}
          />
          <circle cx={head[0] + 10} cy={head[1] - 4} r={3} fill={LINE} />
          <path
            d={`M${head[0] + 3} ${head[1] - 15} L${head[0] + 16} ${head[1] - 13}`}
            stroke={LINE}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
            opacity={pose.brow === "down" ? 1 : 0.7}
            transform={
              pose.brow === "down"
                ? `rotate(9 ${head[0] + 10} ${head[1] - 14})`
                : pose.brow === "worried"
                  ? `rotate(-10 ${head[0] + 10} ${head[1] - 14})`
                  : undefined
            }
          />
          {pose.mouth === "smile" ? (
            <path
              d={`M${head[0] + 8} ${head[1] + 10} Q${head[0] + 14} ${head[1] + 14} ${head[0] + 18} ${head[1] + 8}`}
              stroke={LINE}
              strokeWidth={2.4}
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <path
              d={`M${head[0] + 8} ${head[1] + 11} L${head[0] + 18} ${head[1] + 10}`}
              stroke={LINE}
              strokeWidth={2.4}
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>

        {/* ხელი */}
        {pose.armA && <Limb points={pose.armA} w={11} />}
        {pose.armA && (
          <circle
            cx={pose.armA[2][0]}
            cy={pose.armA[2][1]}
            r={7}
            fill={BODY}
            stroke={LINE}
            strokeWidth={2.6}
          />
        )}
      </g>

      {/* --- წინა ფეხი --- */}
      <Limb points={[pose.legA[0], pose.legA[1], pose.legA[2]]} w={14} />
      <Limb points={[pose.legA[2], pose.legA[3]]} w={9} />

      {/* ჩაკეტვა — ხელი მუხლზე */}
      {pose.clamp?.map((c, i) => (
        <g key={i}>
          <path
            d={`M${c[0] - 9} ${c[1] - 7} Q${c[0] + 6} ${c[1] - 8} ${c[0] + 7} ${c[1] + 1} Q${c[0] + 7} ${c[1] + 9} ${c[0] - 8} ${c[1] + 8}`}
            fill="none"
            stroke={LINE}
            strokeWidth={8}
            strokeLinecap="round"
          />
          <path
            d={`M${c[0] - 9} ${c[1] - 7} Q${c[0] + 6} ${c[1] - 8} ${c[0] + 7} ${c[1] + 1} Q${c[0] + 7} ${c[1] + 9} ${c[0] - 8} ${c[1] + 8}`}
            fill="none"
            stroke={BODY}
            strokeWidth={4.2}
            strokeLinecap="round"
          />
        </g>
      ))}

      {showFocus &&
        pose.focus?.map((f, i) => (
          <circle
            key={i}
            cx={f.at[0]}
            cy={f.at[1]}
            r={f.r}
            fill="none"
            stroke="var(--fig-accent)"
            strokeWidth={2}
            strokeDasharray="4 7"
            opacity={0.78}
          />
        ))}
    </svg>
  );
}
