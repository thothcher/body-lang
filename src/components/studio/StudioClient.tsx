"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ARM_PRESETS,
  DEFAULT_CONFIG,
  GAZE_PRESETS,
  HEAD_PRESETS,
  LEG_PRESETS,
  OUTFITS,
  POSTURE_PRESETS,
  SKINS,
  signalsOf,
  type AvatarConfig,
} from "@/components/three/rig";
import type { CameraView } from "@/components/three/StudioScene";
import { readSignals } from "@/lib/reading";
import { useProgress } from "@/lib/progress";
import {
  Bookmark,
  Briefcase,
  Clapperboard,
  Crown,
  Eye,
  Footprints,
  Hand,
  HandHeart,
  Handshake,
  Moon,
  Palette,
  PersonStanding,
  Rotate3d,
  RotateCcw,
  Save,
  ScanFace,
  Shirt,
  Sun,
  UserRound,
  VenetianMask,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

const StudioScene = dynamic(() => import("@/components/three/StudioScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center" style={{ background: "var(--bg-sunken)" }}>
      <div className="text-center">
        <div
          className="mx-auto size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }}
        />
        <p className="mt-3 text-[13px]" style={{ color: "var(--fg-faint)" }}>
          3D მოდელი იტვირთება…
        </p>
      </div>
    </div>
  ),
});

/* ------------------------------------------------------------------ */

const SCENARIOS: { id: string; label: string; desc: string; icon: LucideIcon; config: Partial<AvatarConfig> }[] = [
  {
    id: "interview",
    label: "გასაუბრება",
    icon: Briefcase,
    desc: "დაძაბული კანდიდატი: ბარიერი, ჩაღუნული თავი, არიდებული მზერა",
    config: { arms: "self-hug", legs: "closed", head: "down", gaze: "down", posture: "slouched", outfit: "suit" },
  },
  {
    id: "boss",
    label: "უფროსი კაბინეტში",
    icon: Crown,
    desc: "„ყოვლისმცოდნე“: თავზე ხელები, ნიკაპი წინ, უკან გადახრილი",
    config: { arms: "behind-head", legs: "open", head: "up", gaze: "lowered", posture: "lean-back", outfit: "suit" },
  },
  {
    id: "liar",
    label: "სიცრუის კლასტერი",
    icon: VenetianMask,
    desc: "ხელი სახესთან + მზერის არიდება + ტანი გვერდზე",
    config: { arms: "face", legs: "shift", head: "away", gaze: "down", posture: "turn-away", outfit: "casual" },
  },
  {
    id: "rapport",
    label: "სრული კონტაქტი",
    icon: HandHeart,
    desc: "ღია ხელის გულები, წინ გადახრა, თავი გვერდზე",
    config: { arms: "open", legs: "forward", head: "tilt", gaze: "social", posture: "lean-in", outfit: "casual" },
  },
  {
    id: "power",
    label: "ძალაუფლების ჩვენება",
    icon: Zap,
    desc: "დოინჯი, ღია სტოიკა, საქმიანი მზერა",
    config: { arms: "hips", legs: "open", head: "up", gaze: "business", posture: "confident", outfit: "casual" },
  },
  {
    id: "handshake",
    label: "ხელის ჩამორთმევა",
    icon: Handshake,
    desc: "თანასწორი მისალმება: ერთი ფეხი წინ, პირდაპირი მზერა",
    config: { arms: "handshake", legs: "forward", head: "neutral", gaze: "direct", posture: "confident", outfit: "suit" },
  },
];

function Group({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="eyebrow mb-2 flex items-center gap-1.5">
        <Icon className="size-3.5" strokeWidth={2} style={{ color: "var(--brand)" }} aria-hidden="true" />
        {title}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function Chip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className="focus-ring rounded-full border px-3 py-1.5 text-[12.5px] transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: active ? "var(--brand)" : "var(--bg-raised)",
        color: active ? "#fff" : "var(--fg-muted)",
        borderColor: active ? "var(--brand)" : "var(--line)",
      }}
    >
      {children}
    </button>
  );
}

function AxisBar({ value, leftLabel, rightLabel, label }: { value: number; leftLabel: string; rightLabel: string; label: string }) {
  const pct = ((value + 1) / 2) * 100;
  const positive = value >= 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[11.5px]" style={{ color: "var(--fg-faint)" }}>
        <span>{leftLabel}</span>
        <span className="font-semibold" style={{ color: "var(--fg-muted)" }}>
          {label}
        </span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative mt-1.5 h-2 rounded-full" style={{ background: "var(--bg-sunken)" }}>
        <div className="absolute left-1/2 top-0 h-full w-px" style={{ background: "var(--line-strong)" }} />
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-500"
          style={{
            left: positive ? "50%" : `${pct}%`,
            width: `${Math.abs(value) * 50}%`,
            background: positive ? "var(--brand)" : "var(--color-clay)",
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function StudioClient() {
  const [config, setConfig] = React.useState<AvatarConfig>(DEFAULT_CONFIG);
  const [view, setView] = React.useState<CameraView>("full");
  const [dark, setDark] = React.useState(false);
  const [modelReady, setModelReady] = React.useState(false);
  const onReady = React.useCallback(() => setModelReady(true), []);

  // მოდელის გეომეტრიის აგება (Worker-ებში) იწყება მაშინვე — 3D ძრავის ჩატვირთვის პარალელურად
  React.useEffect(() => {
    import("@/components/three/avatar/loadAvatar").then((m) => m.loadAvatar());
  }, []);
  const [saveName, setSaveName] = React.useState("");
  const [showSave, setShowSave] = React.useState(false);
  const { state, ready, saveStudio, removeStudio } = useProgress();

  const set = <K extends keyof AvatarConfig>(k: K, v: AvatarConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }));

  const signals = React.useMemo(() => signalsOf(config), [config]);
  const reading = React.useMemo(() => readSignals(signals), [signals]);

  const applyScenario = (partial: Partial<AvatarConfig>) =>
    setConfig((c) => ({ ...c, ...partial }));

  const doSave = () => {
    saveStudio(saveName.trim() || "ჩემი პოზა", config as unknown as Record<string, unknown>);
    setSaveName("");
    setShowSave(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
      {/* ------------------------- სცენა ------------------------- */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div
          className="card relative overflow-hidden"
          style={{ height: "clamp(420px, 62vh, 620px)" }}
          data-lenis-prevent
        >
          <StudioScene config={config} view={view} dark={dark} onReady={onReady} />

          {!modelReady && (
            <div
              className="pointer-events-none absolute inset-0 grid place-items-center"
              style={{ background: "color-mix(in srgb, var(--bg-sunken) 55%, transparent)" }}
              aria-live="polite"
            >
              <div className="text-center">
                <PersonStanding className="mx-auto size-9 animate-pulse" strokeWidth={1.6} style={{ color: "var(--brand)" }} aria-hidden="true" />
                <p className="mt-2 text-[13px]" style={{ color: "var(--fg-muted)" }}>
                  ადამიანის მოდელი მზადდება…
                </p>
              </div>
            </div>
          )}

          {/* ხედის მართვა */}
          <div className="absolute left-3 top-3 flex gap-1.5">
            {(
              [
                { id: "full", label: "სრული", icon: PersonStanding },
                { id: "upper", label: "ზედა", icon: UserRound },
                { id: "face", label: "სახე", icon: ScanFace },
              ] as { id: CameraView; label: string; icon: LucideIcon }[]
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-pressed={view === v.id}
                className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium backdrop-blur transition-colors"
                style={{
                  background: view === v.id ? "var(--brand)" : "color-mix(in srgb, var(--bg-raised) 78%, transparent)",
                  color: view === v.id ? "#fff" : "var(--fg-muted)",
                }}
              >
                <v.icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
                {v.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="focus-ring absolute right-3 top-3 grid size-8 place-items-center rounded-full backdrop-blur"
            style={{ background: "color-mix(in srgb, var(--bg-raised) 78%, transparent)", color: "var(--fg-muted)" }}
            aria-label={dark ? "ნათელი სცენა" : "ბნელი სცენა"}
            aria-pressed={dark}
            title="სცენის განათება"
          >
            {dark ? (
              <Sun className="size-4" strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Moon className="size-4" strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>

          <p
            className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11px] backdrop-blur"
            style={{ background: "color-mix(in srgb, var(--bg-raised) 70%, transparent)", color: "var(--fg-faint)" }}
          >
            <Rotate3d className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            გადაათრიე შესატრიალებლად · ბორბლით მიახლოება
          </p>
        </div>

        {/* სცენარები */}
        <div className="mt-4">
          <p className="eyebrow mb-2 flex items-center gap-1.5">
            <Clapperboard className="size-3.5" strokeWidth={2} style={{ color: "var(--brand)" }} aria-hidden="true" />
            მზა სცენარები
          </p>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => applyScenario(s.config)}
                title={s.desc}
                className="focus-ring rounded-xl border px-3.5 py-2 text-left text-[12.5px] transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]"
                style={{ borderColor: "var(--line)" }}
                data-cursor="სცენარი"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <s.icon className="size-3.5 shrink-0" strokeWidth={2} style={{ color: "var(--brand)" }} aria-hidden="true" />
                  {s.label}
                </span>
                <span className="block text-[11px]" style={{ color: "var(--fg-faint)" }}>
                  {s.desc.slice(0, 34)}…
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------ პანელი ------------------------ */}
      <div className="grid gap-5">
        {/* კითხვა */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">რას კითხულობს სხეული</p>
              <h2 className="mt-1 text-[20px]" style={{ color: reading.verdict.tone }}>
                {reading.verdict.title}
              </h2>
            </div>
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full"
              style={{ background: reading.verdict.tone, opacity: 0.16 }}
            />
          </div>
          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            {reading.verdict.text}
          </p>

          <div className="mt-5 grid gap-3">
            {reading.axes.map((a) => (
              <AxisBar key={a.id} {...a} />
            ))}
          </div>
        </div>

        {/* კომბინაციები */}
        {reading.combos.length > 0 && (
          <div className="grid gap-2.5">
            {reading.combos.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border-l-4 p-4"
                style={{ background: "var(--color-amber-wash)", borderColor: "var(--color-amber)" }}
              >
                <p className="text-[14px] font-bold" style={{ color: "var(--color-amber)" }}>
                  {c.title}
                </p>
                <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--color-ink-2)" }}>
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* სიგნალების სია */}
        <div className="card p-5">
          <p className="eyebrow">აქტიური სიგნალები</p>
          <ul className="mt-3 grid gap-2.5">
            {reading.signals.map((s) => (
              <li key={s.label} className="text-[13.5px] leading-relaxed">
                <Link
                  href={`/chapters/${s.chapter}`}
                  className="focus-ring font-semibold transition-colors hover:text-[var(--brand)]"
                >
                  {s.label}
                </Link>
                <span style={{ color: "var(--fg-muted)" }}> — {s.reading}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* კონტროლები */}
        <div className="card grid gap-5 p-5">
          <Group title="ხელები" icon={Hand}>
            {ARM_PRESETS.map((p) => (
              <Chip key={p.id} active={config.arms === p.id} onClick={() => set("arms", p.id)} title={p.hint}>
                {p.label}
              </Chip>
            ))}
          </Group>

          <Group title="ფეხები" icon={Footprints}>
            {LEG_PRESETS.map((p) => (
              <Chip key={p.id} active={config.legs === p.id} onClick={() => set("legs", p.id)} title={p.hint}>
                {p.label}
              </Chip>
            ))}
          </Group>

          <Group title="თავი" icon={UserRound}>
            {HEAD_PRESETS.map((p) => (
              <Chip key={p.id} active={config.head === p.id} onClick={() => set("head", p.id)} title={p.hint}>
                {p.label}
              </Chip>
            ))}
          </Group>

          <Group title="მზერა" icon={Eye}>
            {GAZE_PRESETS.map((p) => (
              <Chip key={p.id} active={config.gaze === p.id} onClick={() => set("gaze", p.id)} title={p.hint}>
                {p.label}
              </Chip>
            ))}
          </Group>

          <Group title="პოზა" icon={PersonStanding}>
            {POSTURE_PRESETS.map((p) => (
              <Chip key={p.id} active={config.posture === p.id} onClick={() => set("posture", p.id)} title={p.hint}>
                {p.label}
              </Chip>
            ))}
          </Group>

          <Group title="ტანსაცმელი" icon={Shirt}>
            {OUTFITS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => set("outfit", o.id)}
                aria-pressed={config.outfit === o.id}
                className="focus-ring flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition-all hover:-translate-y-0.5"
                style={{
                  background: config.outfit === o.id ? "var(--brand)" : "var(--bg-raised)",
                  color: config.outfit === o.id ? "#fff" : "var(--fg-muted)",
                  borderColor: config.outfit === o.id ? "var(--brand)" : "var(--line)",
                }}
              >
                <span className="size-3 rounded-full border" style={{ background: o.top, borderColor: "rgba(0,0,0,.2)" }} />
                {o.label}
              </button>
            ))}
          </Group>

          <Group title="კანის ტონი" icon={Palette}>
            {SKINS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("skin", s)}
                aria-pressed={config.skin === s}
                aria-label={`კანის ტონი ${s}`}
                className="focus-ring size-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: s,
                  borderColor: config.skin === s ? "var(--brand)" : "var(--line)",
                }}
              />
            ))}
          </Group>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setConfig(DEFAULT_CONFIG)}
              className="focus-ring flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px]"
              style={{ borderColor: "var(--line-strong)" }}
            >
              <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden="true" />
              გასუფთავება
            </button>
            <button
              type="button"
              onClick={() => setShowSave((v) => !v)}
              className="focus-ring flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium"
              style={{ background: "var(--brand)", color: "#fff" }}
              data-cursor="შენახვა"
              aria-expanded={showSave}
            >
              <Bookmark className="size-3.5" strokeWidth={2} aria-hidden="true" />
              პოზის შენახვა
            </button>
          </div>

          {showSave && (
            <div className="flex gap-2" data-reveal="up">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSave()}
                placeholder="დაარქვი სახელი"
                className="flex-1 rounded-full border bg-transparent px-4 py-2 text-[13.5px] outline-none focus:border-[var(--brand)]"
                style={{ borderColor: "var(--line)" }}
                autoFocus
              />
              <button
                type="button"
                onClick={doSave}
                className="focus-ring flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium"
                style={{ background: "var(--color-sage)", color: "#fff" }}
              >
                <Save className="size-3.5" strokeWidth={2} aria-hidden="true" />
                შენახვა
              </button>
            </div>
          )}
        </div>

        {/* შენახული პოზები */}
        {ready && state.studio.length > 0 && (
          <div className="card p-5">
            <p className="eyebrow flex items-center gap-1.5">
            <Bookmark className="size-3.5" strokeWidth={2} style={{ color: "var(--brand)" }} aria-hidden="true" />
            შენახული პოზები
          </p>
            <ul className="mt-3 grid gap-2">
              {state.studio.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...DEFAULT_CONFIG, ...(s.config as unknown as AvatarConfig) })}
                    className="focus-ring min-w-0 flex-1 truncate rounded-lg px-2.5 py-2 text-left text-[13.5px] transition-colors hover:bg-[var(--bg-sunken)]"
                  >
                    {s.name}
                    <span className="ml-2 text-[11px]" style={{ color: "var(--fg-faint)" }}>
                      {new Date(s.at).toLocaleDateString("ka-GE")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStudio(s.id)}
                    aria-label={`წაშალე ${s.name}`}
                    className="focus-ring shrink-0 rounded-full p-1.5"
                    style={{ color: "var(--fg-faint)" }}
                  >
                    <X className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
