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
  SETTINGS,
  SKINS,
  isSeated,
  signalsOf,
  type AvatarConfig,
} from "@/components/three/rig";
import type { CameraView } from "@/components/three/StudioScene";
import { readSignals } from "@/lib/reading";
import { useProgress } from "@/lib/progress";
import {
  Armchair,
  Bookmark,
  Briefcase,
  Crown,
  Eye,
  Footprints,
  Hand,
  HandHeart,
  Handshake,
  Mic,
  Moon,
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
  loading: () => <div className="h-full w-full" style={{ background: "var(--stage)" }} />,
});

/* ------------------------------------------------------------------ */

const SCENARIOS: { id: string; label: string; desc: string; icon: LucideIcon; config: Partial<AvatarConfig> }[] = [
  {
    id: "interview",
    label: "გასაუბრება",
    icon: Briefcase,
    desc: "დაძაბული კანდიდატი სკამზე: ჩაკეტილი ტერფები, ხელები ბარიერად, არიდებული მზერა",
    config: { setting: "chair", arms: "self-hug", legs: "shift", head: "down", gaze: "down", posture: "slouched", outfit: "suit" },
  },
  {
    id: "boss",
    label: "უფროსი მაგიდასთან",
    icon: Crown,
    desc: "„ყოვლისმცოდნე“: თავზე ხელები, ფეხი ფეხზე, უკან გადახრილი",
    config: { setting: "desk", arms: "behind-head", legs: "crossed", head: "up", gaze: "lowered", posture: "lean-back", outfit: "suit" },
  },
  {
    id: "liar",
    label: "სიცრუის კლასტერი",
    icon: VenetianMask,
    desc: "ხელი სახესთან + მზერის არიდება + ტანი გვერდზე",
    config: { setting: "none", arms: "face", legs: "shift", head: "away", gaze: "down", posture: "turn-away", outfit: "casual" },
  },
  {
    id: "rapport",
    label: "სრული კონტაქტი",
    icon: HandHeart,
    desc: "სკამზე წინ გადახრილი, ღია ხელის გულები, თავი გვერდზე",
    config: { setting: "chair", arms: "open", legs: "forward", head: "tilt", gaze: "social", posture: "lean-in", outfit: "casual" },
  },
  {
    id: "power",
    label: "ძალაუფლება",
    icon: Zap,
    desc: "დოინჯი, ღია სტოიკა, საქმიანი მზერა",
    config: { setting: "none", arms: "hips", legs: "open", head: "up", gaze: "business", posture: "confident", outfit: "casual" },
  },
  {
    id: "speech",
    label: "ტრიბუნასთან",
    icon: Mic,
    desc: "გამომსვლელი ბარიერის უკან — კოშკი და საქმიანი მზერა",
    config: { setting: "podium", arms: "steeple", legs: "neutral", head: "neutral", gaze: "business", posture: "confident", outfit: "suit" },
  },
  {
    id: "handshake",
    label: "ხელის ჩამორთმევა",
    icon: Handshake,
    desc: "თანასწორი მისალმება: ერთი ფეხი წინ, პირდაპირი მზერა",
    config: { setting: "none", arms: "handshake", legs: "forward", head: "neutral", gaze: "direct", posture: "confident", outfit: "suit" },
  },
];

type TabId = "arms" | "legs" | "head" | "gaze" | "posture" | "setting" | "style";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "arms", label: "ხელები", icon: Hand },
  { id: "legs", label: "ფეხები", icon: Footprints },
  { id: "head", label: "თავი", icon: UserRound },
  { id: "gaze", label: "მზერა", icon: Eye },
  { id: "posture", label: "პოზა", icon: PersonStanding },
  { id: "setting", label: "გარემო", icon: Armchair },
  { id: "style", label: "სტილი", icon: Shirt },
];

/** დიდი ღილაკი: სახელი + მინიშნება. აქტიური — მელნისფერი. */
function Option({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="focus-ring group flex min-h-[58px] flex-col justify-center rounded-[14px_14px_14px_4px] border px-3.5 py-2.5 text-left transition-colors duration-200"
      style={{
        background: active ? "var(--fg)" : "var(--bg-raised)",
        color: active ? "var(--bg)" : "var(--fg)",
        borderColor: active ? "var(--fg)" : "var(--line)",
      }}
    >
      <span className="flex items-center gap-1.5 text-[13.5px] font-semibold leading-tight">
        {active && <span className="size-1.5 shrink-0 rounded-full" style={{ background: "var(--hot)" }} />}
        {label}
      </span>
      {hint && (
        <span className="mt-0.5 text-[11.5px] leading-snug" style={{ opacity: active ? 0.7 : 1, color: active ? undefined : "var(--fg-faint)" }}>
          {hint}
        </span>
      )}
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
      <div className="relative mt-1.5 h-1.5 rounded-full" style={{ background: "var(--bg-sunken)" }}>
        <div className="absolute left-1/2 top-[-3px] h-[calc(100%+6px)] w-px" style={{ background: "var(--line-strong)" }} />
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-500"
          style={{
            left: positive ? "50%" : `${pct}%`,
            width: `${Math.abs(value) * 50}%`,
            background: positive ? "var(--brand)" : "var(--hot)",
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
  const [spin, setSpin] = React.useState(false);
  const [tab, setTab] = React.useState<TabId>("arms");
  const [modelReady, setModelReady] = React.useState(false);
  const onReady = React.useCallback(() => setModelReady(true), []);

  // სცენის განათება საიტის თემას მიჰყვება
  React.useEffect(() => {
    const root = document.documentElement;
    const theme = root.getAttribute("data-theme");
    const isDark = theme ? theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark);
  }, []);

  // მოდელის გეომეტრიის აგება (Worker-ებში) იწყება მაშინვე — 3D ძრავის ჩატვირთვის პარალელურად
  React.useEffect(() => {
    import("@/components/three/avatar/loadAvatar").then((m) => m.loadAvatar());
  }, []);
  const [saveName, setSaveName] = React.useState("");
  const [showSave, setShowSave] = React.useState(false);
  const { state, ready, saveStudio, removeStudio } = useProgress();

  const set = <K extends keyof AvatarConfig>(k: K, v: AvatarConfig[K]) => setConfig((c) => ({ ...c, [k]: v }));

  const seated = isSeated(config);
  const signals = React.useMemo(() => signalsOf(config), [config]);
  const reading = React.useMemo(() => readSignals(signals), [signals]);

  const applyScenario = (partial: Partial<AvatarConfig>) => setConfig((c) => ({ ...c, ...partial }));

  const doSave = () => {
    saveStudio(saveName.trim() || "ჩემი პოზა", config as unknown as Record<string, unknown>);
    setSaveName("");
    setShowSave(false);
  };

  const options = (() => {
    switch (tab) {
      case "arms":
        return ARM_PRESETS.map((p) => (
          <Option key={p.id} active={config.arms === p.id} onClick={() => set("arms", p.id)} label={p.label} hint={p.hint} />
        ));
      case "legs":
        return LEG_PRESETS.map((p) => {
          const v = seated ? p.seated : p;
          return <Option key={p.id} active={config.legs === p.id} onClick={() => set("legs", p.id)} label={v.label} hint={v.hint} />;
        });
      case "head":
        return HEAD_PRESETS.map((p) => (
          <Option key={p.id} active={config.head === p.id} onClick={() => set("head", p.id)} label={p.label} hint={p.hint} />
        ));
      case "gaze":
        return GAZE_PRESETS.map((p) => (
          <Option key={p.id} active={config.gaze === p.id} onClick={() => set("gaze", p.id)} label={p.label} hint={p.hint} />
        ));
      case "posture":
        return POSTURE_PRESETS.map((p) => (
          <Option key={p.id} active={config.posture === p.id} onClick={() => set("posture", p.id)} label={p.label} hint={p.hint} />
        ));
      case "setting":
        return SETTINGS.map((p) => (
          <Option key={p.id} active={config.setting === p.id} onClick={() => set("setting", p.id)} label={p.label} hint={p.hint} />
        ));
      case "style":
        return null;
    }
  })();

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:h-[calc(100svh-68px-40px)] lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_420px]">
      {/* ------------------------- სცენა ------------------------- */}
      <div className="sticky top-[68px] z-30 -mx-4 h-[46svh] min-h-[300px] sm:mx-0 lg:static lg:h-full">
        <div className="stage relative h-full overflow-hidden max-sm:rounded-none max-sm:border-x-0" data-lenis-prevent>
          <StudioScene config={config} view={view} dark={dark} autoRotate={spin} onReady={onReady} />

          {!modelReady && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-live="polite">
              <div className="text-center">
                <PersonStanding className="mx-auto size-9 animate-pulse" strokeWidth={1.6} style={{ color: "var(--hot)" }} aria-hidden="true" />
                <p className="mt-2 text-[13px]" style={{ color: "var(--fg-muted)" }}>
                  ადამიანის მოდელი მზადდება…
                </p>
              </div>
            </div>
          )}

          {/* ხედის მართვა */}
          <div className="glass absolute left-3 top-3 flex gap-0.5 rounded-full p-1">
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
                className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors"
                style={{
                  background: view === v.id ? "var(--fg)" : "transparent",
                  color: view === v.id ? "var(--bg)" : "var(--fg-muted)",
                }}
              >
                <v.icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
                <span className="max-sm:hidden">{v.label}</span>
              </button>
            ))}
          </div>

          <div className="absolute right-3 top-3 flex gap-1.5">
            <button
              type="button"
              onClick={() => setSpin((v) => !v)}
              className="glass focus-ring grid size-9 place-items-center rounded-full transition-colors"
              style={spin ? { background: "var(--fg)", color: "var(--bg)" } : { color: "var(--fg-muted)" }}
              aria-pressed={spin}
              aria-label="ავტომატური ბრუნვა"
              title="ავტომატური ბრუნვა"
            >
              <Rotate3d className="size-4" strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="glass focus-ring grid size-9 place-items-center rounded-full"
              style={{ color: "var(--fg-muted)" }}
              aria-label={dark ? "ნათელი სცენა" : "ბნელი სცენა"}
              aria-pressed={dark}
              title="სცენის განათება"
            >
              {dark ? <Sun className="size-4" strokeWidth={1.8} aria-hidden="true" /> : <Moon className="size-4" strokeWidth={1.8} aria-hidden="true" />}
            </button>
          </div>

          {/* მიმდინარე წაკითხვა — ყოველთვის ჩანს */}
          <div
            className="glass absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-[16px_16px_16px_4px] px-4 py-2.5 sm:right-auto sm:max-w-[360px]"
            aria-live="polite"
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: reading.verdict.tone }} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold tracking-[-0.02em]" style={{ color: "var(--fg)" }}>
                {reading.verdict.title}
              </p>
              <p className="truncate text-[11.5px]" style={{ color: "var(--fg-faint)" }}>
                {reading.signals.length} სიგნალი · გადაათრიე შესატრიალებლად
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------ პანელი ------------------------ */}
      <div className="flex min-h-0 flex-col lg:overflow-hidden">
        {/* ჩანართები */}
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="რის შეცვლა გინდა">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className="focus-ring chip shrink-0"
              data-active={tab === t.id}
            >
              <t.icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-3 min-h-0 flex-1 overscroll-contain lg:overflow-y-auto lg:pr-1.5" data-lenis-prevent style={{ scrollbarWidth: "thin" }}>
          {/* არჩევანი */}
          <div role="tabpanel" className="grid grid-cols-2 gap-2">
            {options}
            {tab === "legs" && (
              <p className="col-span-2 mt-1 text-[12px]" style={{ color: "var(--fg-faint)" }}>
                {seated ? "ადამიანი ზის — ჯდომის ვარიანტები ჩანს." : "სკამზე დასასმელად აირჩიე „გარემო“ → სკამი."}
              </p>
            )}
            {tab === "style" && (
              <>
                <p className="eyebrow col-span-2">ტანსაცმელი</p>
                {OUTFITS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => set("outfit", o.id)}
                    aria-pressed={config.outfit === o.id}
                    className="focus-ring flex items-center gap-2.5 rounded-[14px_14px_14px_4px] border px-3.5 py-3 text-left text-[13.5px] font-semibold transition-colors"
                    style={{
                      background: config.outfit === o.id ? "var(--fg)" : "var(--bg-raised)",
                      color: config.outfit === o.id ? "var(--bg)" : "var(--fg)",
                      borderColor: config.outfit === o.id ? "var(--fg)" : "var(--line)",
                    }}
                  >
                    <span className="size-4 shrink-0 rounded-full border" style={{ background: o.top, borderColor: "rgba(0,0,0,.2)" }} />
                    {o.label}
                  </button>
                ))}
                <p className="eyebrow col-span-2 mt-3">კანის ტონი</p>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {SKINS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("skin", s)}
                      aria-pressed={config.skin === s}
                      aria-label={`კანის ტონი ${s}`}
                      className="focus-ring size-10 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ background: s, borderColor: config.skin === s ? "var(--hot)" : "var(--line)" }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* კითხვა */}
          <section className="mt-6 border-t pt-5" style={{ borderColor: "var(--line-strong)" }}>
            <p className="eyebrow">რას კითხულობს სხეული</p>
            <h2 className="mt-2 text-[22px] tracking-[-0.03em]" style={{ color: reading.verdict.tone }}>
              {reading.verdict.title}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {reading.verdict.text}
            </p>
            <div className="mt-5 grid gap-3.5">
              {reading.axes.map((a) => (
                <AxisBar key={a.id} {...a} />
              ))}
            </div>
          </section>

          {reading.combos.length > 0 && (
            <div className="mt-5 grid gap-2.5">
              {reading.combos.map((c) => (
                <div key={c.title} className="rounded-[16px_16px_16px_4px] p-4" style={{ background: "var(--color-amber-wash)" }}>
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

          <section className="mt-6 border-t pt-5" style={{ borderColor: "var(--line)" }}>
            <p className="eyebrow">აქტიური სიგნალები</p>
            <ul className="mt-3 grid gap-2.5">
              {reading.signals.map((s) => (
                <li key={s.label} className="text-[13.5px] leading-relaxed">
                  <Link href={`/chapters/${s.chapter}`} className="focus-ring ink-link font-semibold">
                    {s.label}
                  </Link>
                  <span style={{ color: "var(--fg-muted)" }}> — {s.reading}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* სცენარები */}
          <section className="mt-6 border-t pt-5" style={{ borderColor: "var(--line)" }}>
            <p className="eyebrow">მზა სცენარები</p>
            <div className="mt-3 grid gap-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => applyScenario(s.config)}
                  className="focus-ring group flex items-start gap-3 rounded-[14px_14px_14px_4px] border px-3.5 py-3 text-left transition-colors hover:border-[var(--fg)]"
                  style={{ borderColor: "var(--line)", background: "var(--bg-raised)" }}
                  data-cursor="სცენარი"
                >
                  <s.icon className="mt-0.5 size-4 shrink-0 transition-colors group-hover:text-[var(--hot)]" strokeWidth={2} aria-hidden="true" />
                  <span>
                    <span className="block text-[13.5px] font-semibold">{s.label}</span>
                    <span className="block text-[12px] leading-snug" style={{ color: "var(--fg-faint)" }}>
                      {s.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* მოქმედებები */}
          <div className="mt-6 flex flex-wrap gap-2 border-t pt-5" style={{ borderColor: "var(--line)" }}>
            <button
              type="button"
              onClick={() => setConfig(DEFAULT_CONFIG)}
              className="focus-ring flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium"
              style={{ borderColor: "var(--line-strong)" }}
            >
              <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden="true" />
              გასუფთავება
            </button>
            <button
              type="button"
              onClick={() => setShowSave((v) => !v)}
              className="focus-ring flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-[var(--hot)] hover:text-white"
              style={{ background: "var(--fg)", color: "var(--bg)" }}
              data-cursor="შენახვა"
              aria-expanded={showSave}
            >
              <Bookmark className="size-3.5" strokeWidth={2} aria-hidden="true" />
              პოზის შენახვა
            </button>
          </div>

          {showSave && (
            <div className="mt-3 flex gap-2">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSave()}
                placeholder="დაარქვი სახელი"
                className="min-w-0 flex-1 rounded-full border bg-transparent px-4 py-2 text-[13.5px] outline-none focus:border-[var(--fg)]"
                style={{ borderColor: "var(--line-strong)" }}
                autoFocus
              />
              <button
                type="button"
                onClick={doSave}
                className="focus-ring flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold"
                style={{ background: "var(--hot)", color: "#fff" }}
              >
                <Save className="size-3.5" strokeWidth={2} aria-hidden="true" />
                შენახვა
              </button>
            </div>
          )}

          {ready && state.studio.length > 0 && (
            <section className="mt-6 border-t pt-5 pb-4" style={{ borderColor: "var(--line)" }}>
              <p className="eyebrow">შენახული პოზები</p>
              <ul className="mt-3 grid gap-1">
                {state.studio.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig({ ...DEFAULT_CONFIG, ...(s.config as unknown as AvatarConfig) })}
                      className="focus-ring min-w-0 flex-1 truncate rounded-lg px-2.5 py-2 text-left text-[13.5px] transition-colors hover:bg-[var(--bg-raised)]"
                    >
                      {s.name}
                      <span className="num ml-2 text-[11px]" style={{ color: "var(--fg-faint)" }}>
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
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
