import * as React from "react";
import { getPose, type Arm, type HandStyle, type Pose, type Pt } from "./poses";

/* ------------------------------------------------------------------
   სხეულის ანატომია (viewBox 0 0 200 340)
------------------------------------------------------------------- */

const HEAD: Pt = [100, 51];
const HEAD_R = 27;
const NECK_TOP: Pt = [100, 74];
const NECK_BOT: Pt = [100, 98];
const SH_L: Pt = [67, 104];
const SH_R: Pt = [133, 104];
const WAIST_L: Pt = [82, 176];
const WAIST_R: Pt = [118, 176];
const HIP_L: Pt = [81, 200];
const HIP_R: Pt = [119, 200];

const LEG_SETS: Record<string, { knee: [Pt, Pt]; ankle: [Pt, Pt]; toe: [Pt, Pt] }> = {
  stand: {
    knee: [
      [88, 254],
      [112, 254],
    ],
    ankle: [
      [86, 312],
      [114, 312],
    ],
    toe: [
      [72, 316],
      [128, 316],
    ],
  },
  "stand-wide": {
    knee: [
      [79, 254],
      [121, 254],
    ],
    ankle: [
      [72, 312],
      [128, 312],
    ],
    toe: [
      [56, 316],
      [144, 316],
    ],
  },
  "stand-narrow": {
    knee: [
      [93, 254],
      [107, 254],
    ],
    ankle: [
      [92, 312],
      [108, 312],
    ],
    toe: [
      [78, 316],
      [122, 316],
    ],
  },
  "cross-stand": {
    knee: [
      [93, 250],
      [107, 250],
    ],
    ankle: [
      [113, 308],
      [97, 314],
    ],
    toe: [
      [128, 312],
      [82, 318],
    ],
  },
  "toe-point": {
    knee: [
      [89, 254],
      [113, 254],
    ],
    ankle: [
      [86, 312],
      [117, 310],
    ],
    toe: [
      [72, 316],
      [150, 322],
    ],
  },
  "weight-shift": {
    knee: [
      [90, 256],
      [114, 250],
    ],
    ankle: [
      [88, 312],
      [120, 310],
    ],
    toe: [
      [74, 316],
      [136, 316],
    ],
  },
};

function pathOf(...pts: Pt[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
}

/* ------------------------------------------------------------------
   კიდური — ორმაგი ხაზით (კონტური + სხეულის ფერი)
------------------------------------------------------------------- */

function Limb({
  points,
  w = 13,
  dim = false,
}: {
  points: Pt[];
  w?: number;
  dim?: boolean;
}) {
  const d = pathOf(...points);
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke="var(--fig-line)"
        strokeWidth={w + 5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={dim ? 0.35 : 1}
      />
      <path
        d={d}
        fill="none"
        stroke={dim ? "var(--fig-body-2)" : "var(--fig-body)"}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/* ------------------------------------------------------------------
   ხელის მტევანი
------------------------------------------------------------------- */

function Hand({ style, at, rot = 0 }: { style: HandStyle; at: Pt; rot?: number }) {
  if (style === "hidden") return null;
  const S = {
    stroke: "var(--fig-line)",
    strokeWidth: 2.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const fill = "var(--fig-body)";

  const shape = () => {
    switch (style) {
      case "fist":
        return (
          <>
            <circle cx={0} cy={0} r={9.4} fill={fill} {...S} />
            <path d="M-5.4 -3.4 L5.4 -3.4 M-5.4 0.6 L5.4 0.6 M-4.6 4.4 L4.6 4.4" {...S} strokeWidth={1.7} opacity={0.75} />
          </>
        );
      case "flat":
        return (
          <>
            <rect x={-5.6} y={-10.5} width={11.2} height={21} rx={5.6} fill={fill} {...S} />
            <path d="M-2.2 -8 L-2.2 7 M1.6 -8 L1.6 7" {...S} strokeWidth={1.5} opacity={0.5} />
          </>
        );
      case "palm-up":
        return (
          <>
            {/* თითები */}
            <path
              d="M-6.5 -4 L-8 -13 M-2 -5 L-2.6 -15 M2.6 -5 L3 -15 M7 -4.4 L8.6 -12.6"
              {...S}
              strokeWidth={4.2}
            />
            {/* გული */}
            <path
              d="M-11 1.5 Q-11.5 -5 -4.5 -5.5 L7 -6 Q12.5 -5.5 13 0.5 Q13 6.5 6.5 7 L-4 7.5 Q-10.5 7.5 -11 1.5 Z"
              fill={fill}
              {...S}
            />
            {/* ცერი */}
            <path d="M-10 -1 Q-16 0 -16.5 5.5" {...S} strokeWidth={5} />
          </>
        );
      case "palm-down":
        return (
          <>
            <path
              d="M-6.5 4 L-8 13 M-2 5 L-2.6 15 M2.6 5 L3 15 M7 4.4 L8.6 12.6"
              {...S}
              strokeWidth={4.2}
            />
            <path
              d="M-11 -1.5 Q-11.5 5 -4.5 5.5 L7 6 Q12.5 5.5 13 -0.5 Q13 -6.5 6.5 -7 L-4 -7.5 Q-10.5 -7.5 -11 -1.5 Z"
              fill={fill}
              {...S}
            />
            <path d="M-10 1 Q-16 0 -16.5 -5.5" {...S} strokeWidth={5} />
          </>
        );
      case "palm-front":
        return (
          <>
            <path
              d="M-5.5 -4 L-6.4 -14 M-1.5 -4.6 L-1.8 -16 M2.6 -4.6 L3.2 -15 M6.6 -4 L8 -12"
              {...S}
              strokeWidth={4.2}
            />
            <rect x={-8.5} y={-5} width={17} height={14} rx={6} fill={fill} {...S} />
            <path d="M-8 -1 Q-14.5 0 -15 6" {...S} strokeWidth={5} />
          </>
        );
      case "point":
        return (
          <>
            <path d="M0 -4 L0 -18" {...S} strokeWidth={5.4} />
            <circle cx={0} cy={2.5} r={8.4} fill={fill} {...S} />
            <path d="M-6 -1 Q-11 1 -11 6" {...S} strokeWidth={4.4} />
          </>
        );
      case "grip":
        return (
          <>
            <path
              d="M-7 -10 Q9 -10 9 0 Q9 10 -7 10"
              fill="none"
              stroke="var(--fig-line)"
              strokeWidth={10}
              strokeLinecap="round"
            />
            <path
              d="M-7 -10 Q9 -10 9 0 Q9 10 -7 10"
              fill="none"
              stroke={fill}
              strokeWidth={5.4}
              strokeLinecap="round"
            />
          </>
        );
      case "pinch":
        return (
          <>
            <circle cx={0} cy={2.5} r={8.4} fill={fill} {...S} />
            <path d="M-2.5 -3.5 L-7.5 -13" {...S} strokeWidth={4.6} />
            <path d="M2.5 -3.5 L5.5 -12" {...S} strokeWidth={4.6} />
          </>
        );
      default:
        return (
          <>
            <rect x={-6} y={-8} width={12} height={18} rx={6} fill={fill} {...S} />
            <path d="M-2.4 -5 L-2.4 5 M1.4 -5 L1.4 5" {...S} strokeWidth={1.5} opacity={0.45} />
          </>
        );
    }
  };

  return <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot})`}>{shape()}</g>;
}

/* ------------------------------------------------------------------
   ორივე ხელის ერთობლივი ფორმა
------------------------------------------------------------------- */

function JointHands({ kind, at }: { kind: NonNullable<Pose["joint"]>; at: Pt }) {
  if (kind === "none") return null;
  const S = { stroke: "var(--fig-line)", strokeWidth: 2.6, strokeLinecap: "round" as const };
  const fill = "var(--fig-body)";

  const body = () => {
    switch (kind) {
      case "clasp":
        return (
          <>
            <path
              d="M-13 -5 Q-15 2 -9 8 Q-1 11 3 8 L3 -6 Q-5 -11 -13 -5 Z"
              fill={fill}
              {...S}
            />
            <path
              d="M13 -5 Q15 2 9 8 Q1 11 -3 8 L-3 -6 Q5 -11 13 -5 Z"
              fill="var(--fig-body-2)"
              {...S}
            />
          </>
        );
      case "steeple-up":
        return (
          <>
            <path d="M-11 20 L0 0 L11 20" fill="none" {...S} strokeWidth={4.5} />
            <path d="M-7 20 L0 6 L7 20" fill="none" {...S} strokeWidth={3} opacity={0.6} />
            <path
              d="M-13 20 Q-13 28 -6 29 L6 29 Q13 28 13 20"
              fill={fill}
              {...S}
            />
          </>
        );
      case "steeple-down":
        return (
          <>
            <path d="M-11 -14 L0 4 L11 -14" fill="none" {...S} strokeWidth={4.5} />
            <path d="M-7 -14 L0 -2 L7 -14" fill="none" {...S} strokeWidth={3} opacity={0.6} />
            <path
              d="M-13 -14 Q-13 -22 -6 -23 L6 -23 Q13 -22 13 -14"
              fill={fill}
              {...S}
            />
          </>
        );
      case "rub":
        return (
          <>
            <rect x={-15} y={-9} width={19} height={14} rx={7} fill={fill} {...S} />
            <rect x={-4} y={-5} width={19} height={14} rx={7} fill="var(--fig-body-2)" {...S} />
          </>
        );
      case "hold-bag":
        return (
          <>
            <path d="M-10 -4 L10 -4" {...S} strokeWidth={7} />
            <path d="M-8 -2 Q-8 -14 0 -14 Q8 -14 8 -2" fill="none" {...S} strokeWidth={2.4} />
            <rect x={-14} y={-2} width={28} height={24} rx={4} fill="var(--fig-body-2)" {...S} />
          </>
        );
      default:
        return null;
    }
  };

  return <g transform={`translate(${at[0]} ${at[1]})`}>{body()}</g>;
}

/* ------------------------------------------------------------------
   სახე
------------------------------------------------------------------- */

function Face({ pose }: { pose: Pose }) {
  const [gx, gy] = pose.gaze ?? [0, 0];
  const eyes = pose.eyes ?? "open";
  const brow = pose.brow ?? "neutral";
  const mouth = pose.mouth ?? "neutral";
  const S = { stroke: "var(--fig-line)", strokeLinecap: "round" as const, fill: "none" };

  const ex = 9.5;
  const ey = -2;
  const pupil = (sx: number) => (
    <circle
      cx={sx + gx * 2.6}
      cy={ey + gy * 2.2}
      r={eyes === "wide" ? 3.1 : eyes === "narrow" ? 2.1 : 2.6}
      fill="var(--fig-line)"
    />
  );

  return (
    <g>
      {/* თვალები */}
      {eyes === "closed" ? (
        <>
          <path d={`M${-ex - 4} ${ey} Q${-ex} ${ey + 4} ${-ex + 4} ${ey}`} {...S} strokeWidth={2.2} />
          <path d={`M${ex - 4} ${ey} Q${ex} ${ey + 4} ${ex + 4} ${ey}`} {...S} strokeWidth={2.2} />
        </>
      ) : eyes === "narrow" ? (
        <>
          <path
            d={`M${-ex - 5} ${ey - 1} Q${-ex} ${ey - 4} ${-ex + 5} ${ey - 1}`}
            {...S}
            strokeWidth={2}
          />
          <path
            d={`M${ex - 5} ${ey - 1} Q${ex} ${ey - 4} ${ex + 5} ${ey - 1}`}
            {...S}
            strokeWidth={2}
          />
          {pupil(-ex)}
          {pupil(ex)}
        </>
      ) : (
        <>
          <ellipse
            cx={-ex}
            cy={ey}
            rx={eyes === "wide" ? 5.4 : 4.8}
            ry={eyes === "wide" ? 5 : 4.1}
            fill="var(--bg-raised)"
            stroke="var(--fig-line)"
            strokeWidth={2}
          />
          <ellipse
            cx={ex}
            cy={ey}
            rx={eyes === "wide" ? 5.4 : 4.8}
            ry={eyes === "wide" ? 5 : 4.1}
            fill="var(--bg-raised)"
            stroke="var(--fig-line)"
            strokeWidth={2}
          />
          {pupil(-ex)}
          {pupil(ex)}
        </>
      )}

      {/* წარბები */}
      {brow === "up" && (
        <>
          <path d={`M${-ex - 6} ${ey - 10} Q${-ex} ${ey - 14} ${-ex + 6} ${ey - 11}`} {...S} strokeWidth={2.4} />
          <path d={`M${ex - 6} ${ey - 11} Q${ex} ${ey - 14} ${ex + 6} ${ey - 10}`} {...S} strokeWidth={2.4} />
        </>
      )}
      {brow === "down" && (
        <>
          <path d={`M${-ex - 6} ${ey - 11} L${-ex + 6} ${ey - 7}`} {...S} strokeWidth={2.6} />
          <path d={`M${ex - 6} ${ey - 7} L${ex + 6} ${ey - 11}`} {...S} strokeWidth={2.6} />
        </>
      )}
      {brow === "worried" && (
        <>
          <path d={`M${-ex - 6} ${ey - 8} L${-ex + 6} ${ey - 12}`} {...S} strokeWidth={2.4} />
          <path d={`M${ex - 6} ${ey - 12} L${ex + 6} ${ey - 8}`} {...S} strokeWidth={2.4} />
        </>
      )}
      {brow === "neutral" && (
        <>
          <path d={`M${-ex - 6} ${ey - 10} L${-ex + 6} ${ey - 10.5}`} {...S} strokeWidth={2.2} opacity={0.75} />
          <path d={`M${ex - 6} ${ey - 10.5} L${ex + 6} ${ey - 10}`} {...S} strokeWidth={2.2} opacity={0.75} />
        </>
      )}

      {/* ცხვირი */}
      <path d={`M0 ${ey + 2} L-1.5 ${ey + 8} L1.5 ${ey + 8.5}`} {...S} strokeWidth={1.8} opacity={0.65} />

      {/* პირი */}
      {mouth === "smile" && <path d="M-7 14 Q0 20 7 14" {...S} strokeWidth={2.4} />}
      {mouth === "frown" && <path d="M-7 18 Q0 12 7 18" {...S} strokeWidth={2.4} />}
      {mouth === "flat" && <path d="M-6.5 16 L6.5 16" {...S} strokeWidth={2.4} />}
      {mouth === "tight" && <path d="M-5 16 L5 16" {...S} strokeWidth={3.2} />}
      {mouth === "open" && (
        <ellipse cx={0} cy={16} rx={4.4} ry={5} fill="var(--fig-line)" opacity={0.85} />
      )}
      {mouth === "neutral" && <path d="M-6 15.5 Q0 17.5 6 15.5" {...S} strokeWidth={2.2} />}
    </g>
  );
}

/* ------------------------------------------------------------------
   მთავარი კომპონენტი
------------------------------------------------------------------- */

export interface BodyFigureProps {
  pose: string;
  className?: string;
  /** გამოყოფილი ზონის ჩვენება */
  showFocus?: boolean;
  /** ჩრდილი */
  shadow?: boolean;
  title?: string;
}

export default function BodyFigure({
  pose: poseKey,
  className,
  showFocus = true,
  shadow = true,
  title,
}: BodyFigureProps) {
  const pose = getPose(poseKey);
  const crop = pose.crop ?? "full";
  const viewBox =
    crop === "bust" ? "26 10 148 172" : crop === "wide" ? "40 14 176 148" : "0 0 200 340";
  const lift = pose.shoulderLift ?? 0;
  const shL: Pt = [SH_L[0], SH_L[1] - lift];
  const shR: Pt = [SH_R[0], SH_R[1] - lift];
  const legs = LEG_SETS[pose.legs ?? "stand"] ?? LEG_SETS.stand;
  const [hox, hoy] = pose.headOffset ?? [0, 0];
  const headC: Pt = [HEAD[0] + hox, HEAD[1] + hoy];

  const armPts = (arm: Arm, shoulder: Pt): Pt[] => [shoulder, arm.elbow, arm.wrist];

  const renderArm = (arm: Arm, shoulder: Pt) => (
    <>
      <Limb points={armPts(arm, shoulder)} w={14} />
      <Hand style={arm.hand} at={arm.wrist} rot={arm.rot ?? 0} />
    </>
  );

  const behindArms = [
    pose.armL.behind ? { arm: pose.armL, sh: shL, key: "bl" } : null,
    pose.armR.behind ? { arm: pose.armR, sh: shR, key: "br" } : null,
  ].filter(Boolean) as { arm: Arm; sh: Pt; key: string }[];

  const frontArms = [
    !pose.armL.behind ? { arm: pose.armL, sh: shL, key: "fl" } : null,
    !pose.armR.behind ? { arm: pose.armR, sh: shR, key: "fr" } : null,
  ].filter(Boolean) as { arm: Arm; sh: Pt; key: string }[];

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}

      {shadow && crop === "full" && (
        <ellipse cx={100} cy={326} rx={52} ry={8} fill="var(--fig-ghost)" />
      )}

      {/* --- ფეხები --- */}
      {crop === "full" && (
        <g>
          <Limb points={[HIP_L, legs.knee[0], legs.ankle[0]]} w={18} />
          <Limb points={[HIP_R, legs.knee[1], legs.ankle[1]]} w={18} />
          <Limb points={[legs.ankle[0], legs.toe[0]]} w={11} />
          <Limb points={[legs.ankle[1], legs.toe[1]]} w={11} />
        </g>
      )}

      {/* --- ხელები სხეულის უკან --- */}
      {behindArms.map(({ arm, sh, key }) => (
        <g key={key}>{renderArm(arm, sh)}</g>
      ))}
      {pose.joint && pose.jointAt && pose.armL.behind && (
        <JointHands kind={pose.joint} at={pose.jointAt} />
      )}

      {/* --- კისერი (ტანის უკან) --- */}
      <Limb points={[NECK_TOP, NECK_BOT]} w={17} />

      {/* --- ტანი --- */}
      <path
        d={`M${shL[0] + 2} ${shL[1] - 3}
            Q${shL[0] - 5} ${shL[1] + 4} ${shL[0] - 1} ${shL[1] + 22}
            Q${shL[0] + 6} ${shL[1] + 52} ${WAIST_L[0]} ${WAIST_L[1]}
            L${HIP_L[0]} ${HIP_L[1]}
            Q100 ${HIP_L[1] + 11} ${HIP_R[0]} ${HIP_R[1]}
            L${WAIST_R[0]} ${WAIST_R[1]}
            Q${shR[0] - 6} ${shR[1] + 52} ${shR[0] + 1} ${shR[1] + 22}
            Q${shR[0] + 5} ${shR[1] + 4} ${shR[0] - 2} ${shR[1] - 3}
            Q100 ${shL[1] - 13} ${shL[0] + 2} ${shL[1] - 3} Z`}
        fill="var(--fig-body)"
        stroke="var(--fig-line)"
        strokeWidth={3.2}
        strokeLinejoin="round"
      />

      {/* საყელო */}
      {pose.props?.includes("collar") ? (
        <path
          d={`M87 ${shL[1] - 6} L100 ${shL[1] + 16} L113 ${shR[1] - 6}`}
          fill="none"
          stroke="var(--fig-accent)"
          strokeWidth={3.6}
          strokeLinecap="round"
        />
      ) : (
        <path
          d={`M88 ${shL[1] - 6} L100 ${shL[1] + 12} L112 ${shR[1] - 6}`}
          fill="none"
          stroke="var(--fig-line)"
          strokeWidth={2.4}
          strokeLinecap="round"
          opacity={0.5}
        />
      )}
      {pose.props?.includes("pocket-line") && (
        <>
          <path d="M84 198 L93 210" stroke="var(--fig-line)" strokeWidth={2.2} opacity={0.55} fill="none" />
          <path d="M116 198 L107 210" stroke="var(--fig-line)" strokeWidth={2.2} opacity={0.55} fill="none" />
        </>
      )}

      {/* --- თავი --- */}
      <g transform={`rotate(${pose.headTilt ?? 0} ${headC[0]} ${headC[1]})`}>
        <circle
          cx={headC[0]}
          cy={headC[1]}
          r={HEAD_R}
          fill="var(--fig-body)"
          stroke="var(--fig-line)"
          strokeWidth={3}
        />
        <g transform={`translate(${headC[0]} ${headC[1]})`}>
          <Face pose={pose} />
        </g>
        {pose.props?.includes("watch") && (
          <circle cx={headC[0]} cy={headC[1]} r={0} fill="none" />
        )}
      </g>

      {/* --- ხელები წინ --- */}
      {frontArms.map(({ arm, sh, key }) => (
        <g key={key}>{renderArm(arm, sh)}</g>
      ))}
      {pose.joint && pose.jointAt && !pose.armL.behind && (
        <JointHands kind={pose.joint} at={pose.jointAt} />
      )}

      {/* პარტნიორის ხელი — ჩამორთმევისთვის */}
      {pose.props?.includes("partner-shake") && (
        <g>
          <Limb points={[[214, 158], [195, 140], [184, 130]]} w={14} dim />
          <g transform="translate(179 128) rotate(-96)">
            <rect
              x={-5.6}
              y={-10.5}
              width={11.2}
              height={21}
              rx={5.6}
              fill="var(--fig-body-2)"
              stroke="var(--fig-line)"
              strokeWidth={2.8}
            />
          </g>
        </g>
      )}

      {/* საათი მაჯაზე */}
      {pose.props?.includes("watch") && (
        <circle
          cx={pose.armR.wrist[0]}
          cy={pose.armR.wrist[1] - 12}
          r={5}
          fill="var(--fig-accent)"
          stroke="var(--fig-line)"
          strokeWidth={2}
        />
      )}

      {/* --- მოძრაობის ისრები --- */}
      {pose.motion?.map((m, i) => {
        const mx = (m.from[0] + m.to[0]) / 2 + (m.curve ?? 0);
        const my = (m.from[1] + m.to[1]) / 2 - Math.abs(m.curve ?? 0) * 0.6;
        return (
          <g key={i}>
            <path
              d={`M${m.from[0]} ${m.from[1]} Q${mx} ${my} ${m.to[0]} ${m.to[1]}`}
              fill="none"
              stroke="var(--fig-accent)"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeDasharray="5 5"
              opacity={0.9}
            />
            <circle cx={m.to[0]} cy={m.to[1]} r={3.4} fill="var(--fig-accent)" />
          </g>
        );
      })}

      {/* --- ფოკუსი --- */}
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
