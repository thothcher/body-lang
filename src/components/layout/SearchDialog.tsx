"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Box,
  ChartLine,
  ClipboardCheck,
  CornerDownLeft,
  Gamepad2,
  Hand,
  Layers,
  ScanEye,
  Search,
  type LucideIcon,
} from "lucide-react";
import { lockScroll } from "@/lib/smoothScroll";
import { CHAPTERS } from "@/lib/content/chapters";
import { GESTURES, PART_LABEL, TONE_LABEL } from "@/lib/content/gestures";

interface Hit {
  href: string;
  title: string;
  sub: string;
  kind: "თავი" | "ჟესტი" | "გვერდი";
  score: number;
}

const PAGES: { href: string; title: string; sub: string; icon: LucideIcon }[] = [
  { href: "/chapters", title: "თავები", sub: "14 თავი, თითოეული შეჯამებით", icon: BookOpen },
  { href: "/test", title: "ტესტები", sub: "ზოგადი და სხეულის ნაწილების მიხედვით", icon: ClipboardCheck },
  { href: "/games", title: "თამაშები", sub: "გამოიცანი, მეხსიერება, კავშირები", icon: Gamepad2 },
  { href: "/studio", title: "3D სტუდია", sub: "ააწყვე პოზა და ნახე რას ნიშნავს", icon: Box },
  { href: "/reader", title: "ადამიანის წაკითხვა", sub: "ინტერაქტიული ფიგურა და აქსესუარები", icon: ScanEye },
  { href: "/progress", title: "ჩემი პროგრესი", sub: "შენახული შედეგები და ჟესტები", icon: ChartLine },
];

const KIND_ICON: Record<Hit["kind"], LucideIcon> = { თავი: BookOpen, ჟესტი: Hand, გვერდი: Layers };

function norm(s: string) {
  return s.toLowerCase().replace(/[„“"'.,!?—–-]/g, " ");
}

function search(q: string): Hit[] {
  const query = norm(q).trim();
  if (query.length < 2) return [];
  const terms = query.split(/\s+/).filter(Boolean);
  const hits: Hit[] = [];

  const scoreOf = (haystacks: { text: string; weight: number }[]) => {
    let score = 0;
    for (const t of terms) {
      let found = false;
      for (const h of haystacks) {
        const n = norm(h.text);
        if (n.includes(t)) {
          score += h.weight * (n.startsWith(t) ? 1.6 : 1);
          found = true;
        }
      }
      if (!found) return 0;
    }
    return score;
  };

  for (const c of CHAPTERS) {
    const score = scoreOf([
      { text: c.title, weight: 10 },
      { text: c.subtitle, weight: 5 },
      { text: c.kicker, weight: 3 },
      { text: c.intro, weight: 2 },
      { text: c.keyPoints.join(" "), weight: 2 },
      { text: c.sections.map((s) => s.heading + " " + s.body.join(" ")).join(" "), weight: 1 },
    ]);
    if (score)
      hits.push({
        href: `/chapters/${c.slug}`,
        title: `${c.order}. ${c.title}`,
        sub: c.subtitle,
        kind: "თავი",
        score,
      });
  }

  for (const g of GESTURES) {
    const score = scoreOf([
      { text: g.title, weight: 10 },
      { text: g.meaning, weight: 5 },
      { text: g.tags.join(" "), weight: 4 },
      { text: PART_LABEL[g.part], weight: 3 },
      { text: TONE_LABEL[g.tone], weight: 2 },
      { text: g.detail, weight: 1 },
    ]);
    if (score)
      hits.push({
        href: `/chapters/${g.chapter}#g-${g.id}`,
        title: g.title,
        sub: g.meaning,
        kind: "ჟესტი",
        score: score * 1.05,
      });
  }

  for (const p of PAGES) {
    const score = scoreOf([
      { text: p.title, weight: 8 },
      { text: p.sub, weight: 3 },
    ]);
    if (score) hits.push({ href: p.href, title: p.title, sub: p.sub, kind: "გვერდი", score });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, 12);
}

export default function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const hits = React.useMemo(() => search(q), [q]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) {
      // დიალოგის გახსნისას არჩევანის განულება
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      lockScroll(true);
      return () => {
        clearTimeout(t);
        lockScroll(false);
      };
    }
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-[var(--brand-wash)]"
        style={{ borderColor: "var(--line)", color: "var(--fg-muted)" }}
        aria-label="ძიება"
        data-cursor="ძიება"
      >
        <Search className="size-4" strokeWidth={1.9} aria-hidden="true" />
        <span className="hidden sm:inline lg:hidden xl:inline">ძიება</span>
        <kbd
          className="hidden rounded px-1.5 py-0.5 font-sans text-[10px] md:inline lg:hidden xl:inline"
          style={{ background: "var(--bg-sunken)", color: "var(--fg-faint)" }}
        >
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="საიტის ძიება"
        >
          <button
            type="button"
            aria-label="დახურვა"
            className="absolute inset-0 cursor-default"
            style={{ background: "color-mix(in srgb, var(--fg) 40%, transparent)", backdropFilter: "blur(6px)" }}
            onClick={() => setOpen(false)}
          />
          <div
            className="card relative w-full max-w-xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-lift)" }}
          >
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Search className="size-5 shrink-0" strokeWidth={1.9} style={{ color: "var(--fg-faint)" }} aria-hidden="true" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, hits.length - 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  }
                  if (e.key === "Enter" && hits[active]) go(hits[active].href);
                }}
                placeholder="ჟესტი, თავი ან სიტყვა — მაგ. „ცხვირი“, „ბარიერი“"
                className="w-full bg-transparent text-[15px] outline-none"
                style={{ color: "var(--fg)" }}
              />
              <kbd
                className="rounded px-1.5 py-0.5 text-[10px]"
                style={{ background: "var(--bg-sunken)", color: "var(--fg-faint)" }}
              >
                ESC
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto overscroll-contain" data-lenis-prevent>
              {q.length >= 2 && hits.length === 0 && (
                <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--fg-faint)" }}>
                  ვერაფერი მოიძებნა „{q}“-ზე
                </p>
              )}
              {q.length < 2 && (
                <div className="px-4 py-4">
                  <p className="eyebrow mb-2">სწრაფი გადასვლა</p>
                  <div className="grid gap-1">
                    {PAGES.map((p) => {
                      const Icon = p.icon;
                      return (
                        <Link
                          key={p.href}
                          href={p.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-[var(--bg-sunken)]"
                        >
                          <span
                            className="grid size-8 shrink-0 place-items-center rounded-lg"
                            style={{ background: "var(--brand-wash)", color: "var(--brand)" }}
                          >
                            <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block">{p.title}</span>
                            <span className="block truncate text-xs" style={{ color: "var(--fg-faint)" }}>
                              {p.sub}
                            </span>
                          </span>
                          <ArrowRight
                            className="size-4 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                            style={{ color: "var(--brand)" }}
                            aria-hidden="true"
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
              {hits.map((h, i) => {
                const Icon = KIND_ICON[h.kind];
                return (
                  <button
                    key={h.href + h.title}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(h.href)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors"
                    style={{ background: i === active ? "var(--bg-sunken)" : "transparent" }}
                  >
                    <span
                      className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "var(--brand-wash)", color: "var(--brand)" }}
                    >
                      <Icon className="size-3" strokeWidth={2.2} aria-hidden="true" />
                      {h.kind}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{h.title}</span>
                      <span className="block truncate text-xs" style={{ color: "var(--fg-faint)" }}>
                        {h.sub}
                      </span>
                    </span>
                    {i === active && (
                      <CornerDownLeft className="mt-1 size-3.5 shrink-0" style={{ color: "var(--fg-faint)" }} aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
