import * as React from "react";

const LINE = "var(--fig-line)";
const BODY = "var(--fig-body)";
const ACCENT = "var(--fig-accent)";

const EYE_L = { x: 87, y: 96 };
const EYE_R = { x: 133, y: 96 };

export type FaceSignalKind =
  | "gaze-business"
  | "gaze-social"
  | "gaze-intimate"
  | "gaze-side"
  | "gaze-avoid"
  | "pupils-wide"
  | "pupils-narrow"
  | "lids-lowered";

interface Cfg {
  pupil: number;
  px: number;
  py: number;
  lid: number;
  brow: "neutral" | "up" | "down";
  mouth: "neutral" | "smile" | "flat";
  tiltBack?: boolean;
  triangle?: [number, number][];
  note?: string;
}

const CFG: Record<FaceSignalKind, Cfg> = {
  "gaze-business": {
    pupil: 5,
    px: 0,
    py: 0,
    lid: 0,
    brow: "neutral",
    mouth: "flat",
    triangle: [
      [EYE_L.x - 4, EYE_L.y + 2],
      [EYE_R.x + 4, EYE_R.y + 2],
      [110, 46],
    ],
  },
  "gaze-social": {
    pupil: 5,
    px: 0,
    py: 0.6,
    lid: 0,
    brow: "neutral",
    mouth: "smile",
    triangle: [
      [EYE_L.x - 4, EYE_L.y - 2],
      [EYE_R.x + 4, EYE_R.y - 2],
      [110, 150],
    ],
  },
  "gaze-intimate": {
    pupil: 6.4,
    px: 0,
    py: 0.8,
    lid: 0,
    brow: "up",
    mouth: "smile",
    triangle: [
      [EYE_L.x - 6, EYE_L.y - 2],
      [EYE_R.x + 6, EYE_R.y - 2],
      [110, 232],
    ],
  },
  "gaze-side": {
    pupil: 5,
    px: -3.4,
    py: -0.4,
    lid: 0,
    brow: "up",
    mouth: "neutral",
  },
  "gaze-avoid": {
    pupil: 4.6,
    px: -2.6,
    py: 2.6,
    lid: 0.35,
    brow: "neutral",
    mouth: "flat",
  },
  "pupils-wide": {
    pupil: 8.2,
    px: 0,
    py: 0,
    lid: 0,
    brow: "up",
    mouth: "smile",
  },
  "pupils-narrow": {
    pupil: 2.6,
    px: 0,
    py: 0,
    lid: 0.15,
    brow: "down",
    mouth: "flat",
  },
  "lids-lowered": {
    pupil: 4.6,
    px: 0,
    py: -0.8,
    lid: 0.62,
    brow: "neutral",
    mouth: "flat",
    tiltBack: true,
  },
};

function Eye({ cx, cy, cfg }: { cx: number; cy: number; cfg: Cfg }) {
  const rx = 15;
  const ry = 11.5;
  const lidY = cy - ry + ry * 2 * cfg.lid;
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="var(--bg-raised)"
        stroke={LINE}
        strokeWidth={2.6}
      />
      <circle
        cx={cx + cfg.px * 2.4}
        cy={cy + cfg.py * 2.4}
        r={cfg.pupil}
        fill={LINE}
        style={{ transition: "r .4s var(--ease-out-soft)" }}
      />
      <circle cx={cx + cfg.px * 2.4 - cfg.pupil * 0.3} cy={cy - cfg.pupil * 0.35} r={1.6} fill="var(--bg-raised)" opacity={0.85} />
      {cfg.lid > 0.02 && (
        <path
          d={`M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy} L${cx + rx} ${lidY} L${cx - rx} ${lidY} Z`}
          fill={BODY}
          stroke="none"
        />
      )}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={LINE} strokeWidth={2.6} />
      {/* წამწამები */}
      <path
        d={`M${cx - rx} ${cy - 2} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy - 2}`}
        fill="none"
        stroke={LINE}
        strokeWidth={3.4}
        strokeLinecap="round"
        opacity={0.95}
      />
    </g>
  );
}

export interface FaceSignalProps {
  pose: FaceSignalKind | string;
  className?: string;
  title?: string;
  showOverlay?: boolean;
}

/** თვალების სიგნალები — მზერის ზონები და გუგები. */
export default function FaceSignal({
  pose,
  className,
  title,
  showOverlay = true,
}: FaceSignalProps) {
  const cfg = CFG[pose as FaceSignalKind] ?? CFG["gaze-social"];

  return (
    <svg
      viewBox="0 0 220 250"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}

      {/* მხრები */}
      <path
        d="M34 250 Q40 196 78 184 L142 184 Q180 196 186 250 Z"
        fill={BODY}
        stroke={LINE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M96 184 L110 206 L124 184" fill="none" stroke={LINE} strokeWidth={2.4} opacity={0.55} />
      {/* კისერი */}
      <path d="M96 150 L96 190 L124 190 L124 150 Z" fill={BODY} stroke={LINE} strokeWidth={3} />

      <g transform={cfg.tiltBack ? "rotate(-7 110 110)" : undefined}>
        {/* თავი */}
        <ellipse cx={110} cy={104} rx={57} ry={66} fill={BODY} stroke={LINE} strokeWidth={3} />

        {/* წარბები */}
        {cfg.brow === "up" && (
          <>
            <path d="M70 72 Q87 62 104 70" fill="none" stroke={LINE} strokeWidth={3.4} strokeLinecap="round" />
            <path d="M116 70 Q133 62 150 72" fill="none" stroke={LINE} strokeWidth={3.4} strokeLinecap="round" />
          </>
        )}
        {cfg.brow === "down" && (
          <>
            <path d="M70 70 L104 80" fill="none" stroke={LINE} strokeWidth={3.6} strokeLinecap="round" />
            <path d="M116 80 L150 70" fill="none" stroke={LINE} strokeWidth={3.6} strokeLinecap="round" />
          </>
        )}
        {cfg.brow === "neutral" && (
          <>
            <path d="M70 74 L103 73" fill="none" stroke={LINE} strokeWidth={3.2} strokeLinecap="round" opacity={0.85} />
            <path d="M117 73 L150 74" fill="none" stroke={LINE} strokeWidth={3.2} strokeLinecap="round" opacity={0.85} />
          </>
        )}

        <Eye cx={EYE_L.x} cy={EYE_L.y} cfg={cfg} />
        <Eye cx={EYE_R.x} cy={EYE_R.y} cfg={cfg} />

        {/* ცხვირი */}
        <path
          d="M110 104 L104 124 Q110 128 117 124"
          fill="none"
          stroke={LINE}
          strokeWidth={2.6}
          strokeLinecap="round"
          opacity={0.7}
        />

        {/* პირი */}
        {cfg.mouth === "smile" && (
          <path d="M94 144 Q110 156 126 144" fill="none" stroke={LINE} strokeWidth={3.2} strokeLinecap="round" />
        )}
        {cfg.mouth === "flat" && (
          <path d="M95 147 L125 147" fill="none" stroke={LINE} strokeWidth={3.2} strokeLinecap="round" />
        )}
        {cfg.mouth === "neutral" && (
          <path d="M95 145 Q110 150 125 145" fill="none" stroke={LINE} strokeWidth={3} strokeLinecap="round" />
        )}
      </g>

      {/* მზერის ზონა */}
      {showOverlay && cfg.triangle && (
        <g>
          <polygon
            points={cfg.triangle.map((p) => p.join(",")).join(" ")}
            fill={ACCENT}
            opacity={0.14}
          />
          <polygon
            points={cfg.triangle.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke={ACCENT}
            strokeWidth={2.4}
            strokeDasharray="5 6"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* გვერდითი / არიდებული მზერის ისარი */}
      {showOverlay && (pose === "gaze-side" || pose === "gaze-avoid") && (
        <path
          d={pose === "gaze-side" ? "M60 96 L26 88" : "M62 118 L30 146"}
          stroke={ACCENT}
          strokeWidth={2.8}
          strokeDasharray="5 5"
          strokeLinecap="round"
          fill="none"
          markerEnd="url(#fs-arrow)"
        />
      )}

      {showOverlay && (pose === "pupils-wide" || pose === "pupils-narrow") && (
        <>
          <circle cx={EYE_L.x} cy={EYE_L.y} r={26} fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="4 7" opacity={0.8} />
          <circle cx={EYE_R.x} cy={EYE_R.y} r={26} fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="4 7" opacity={0.8} />
        </>
      )}

      <defs>
        <marker id="fs-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill={ACCENT} />
        </marker>
      </defs>
    </svg>
  );
}
