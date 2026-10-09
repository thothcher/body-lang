import type { Metadata } from "next";
import Link from "next/link";
import BodyFigure from "@/components/figures/BodyFigure";
import { PageHeading } from "@/components/ui/Primitives";
import GameScores from "@/components/games/GameScores";
import { GESTURES } from "@/lib/content/gestures";
import { SCENES, CONNECTION_PUZZLES } from "@/lib/content/games";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { ArrowRight, Brain, Layers, Puzzle, Timer, type LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "თამაშები",
  description:
    "ოთხი თამაში სხეულის ენის სავარჯიშოდ: გამოიცანი ჟესტი, მეხსიერების ბანქო, კავშირები და სცენის გაშიფვრა.",
  alternates: { canonical: "/games" },
};

const GAMES: {
  href: string;
  title: string;
  tag: string;
  desc: string;
  pose: string;
  color: string;
  wash: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/games/guess",
    title: "გამოიცანი ჟესტი",
    tag: "სისწრაფე",
    desc: `ნახე პოზა და ამოიცანი მნიშვნელობა 15 წამში. ${GESTURES.length} ჟესტი, სამი სიცოცხლე, ქულების სერია.`,
    pose: "shrug",
    icon: Timer,
    color: "var(--color-indigo)",
    wash: "var(--color-indigo-wash)",
  },
  {
    href: "/games/memory",
    title: "მეხსიერების ბანქო",
    tag: "მეხსიერება",
    desc: "შეაწყვილე ილუსტრაცია და მნიშვნელობა. სამი დონე — 6-დან 10 წყვილამდე, ტაიმერით.",
    pose: "clench-mid",
    icon: Layers,
    color: "var(--color-sage)",
    wash: "var(--color-sage-wash)",
  },
  {
    href: "/games/connections",
    title: "კავშირები",
    tag: "ლოგიკა",
    desc: `16 ჟესტი, 4 ფარული ჯგუფი, 4 შეცდომის უფლება. ${CONNECTION_PUZZLES.length} თავსატეხი.`,
    pose: "steeple-up",
    icon: Puzzle,
    color: "var(--color-amber)",
    wash: "var(--color-amber-wash)",
  },
  {
    href: "/games/decode",
    title: "სცენის გაშიფვრა",
    tag: "პრაქტიკა",
    desc: `${SCENES.length} რეალური სიტუაცია: ჟესტების მტევანი + ნათქვამი + კონტექსტი. ყველაზე ახლოს ცხოვრებასთან.`,
    pose: "evaluation",
    icon: Brain,
    color: "var(--color-clay)",
    wash: "var(--color-clay-wash)",
  },
];

export default function GamesPage() {
  return (
    <div className="shell py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "თამაშები", href: "/games" },
        ])}
      />

      <PageHeading
        kicker="ოთხი თამაში"
        title="თამაშები"
        tagline="ივარჯიშე თამაშით"
        lead="ცოდნა მეხსიერებაში მაშინ ჯდება, როცა გამოიყენება. თითოეული თამაში სხვა უნარს ავარჯიშებს: სისწრაფეს, მეხსიერებას, ლოგიკასა და კონტექსტის წაკითხვას."
      />

      <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2">
        {GAMES.map((g, i) => (
          <Link
            key={g.href}
            href={g.href}
            className="focus-ring group relative flex flex-col"
            data-reveal="up"
            data-reveal-delay={(i % 2) * 100}
            data-cursor="თამაში"
          >
            <div
              className="relative aspect-[16/11] overflow-hidden rounded-[var(--radius-card)] border transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)]"
              style={{
                background: `radial-gradient(120% 100% at 85% 100%, ${g.wash}, transparent 70%), var(--stage)`,
                borderColor: "var(--line)",
              }}
            >
              <span className="num absolute left-5 top-4 text-[13px]" style={{ color: "var(--fg-faint)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{ background: g.color, color: "#fff" }}
              >
                <g.icon className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
                {g.tag}
              </span>
              <div className="absolute inset-x-0 bottom-0 top-14 grid place-items-center">
                <BodyFigure
                  pose={g.pose}
                  className="h-full w-auto transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:-translate-y-2 group-hover:scale-105"
                  showFocus={false}
                />
              </div>
            </div>
            <div className="flex items-start justify-between gap-6 px-1 pt-5">
              <div>
                <h2 className="text-[clamp(1.5rem,2.4vw,2rem)] tracking-[-0.04em]">
                  {g.title}
                  <span className="dot">.</span>
                </h2>
                <p className="mt-2 max-w-[48ch] text-[14.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  {g.desc}
                </p>
              </div>
              <span
                className="mt-1 grid size-11 shrink-0 place-items-center rounded-full border transition-colors duration-300 group-hover:border-transparent group-hover:bg-[var(--fg)] group-hover:text-[var(--bg)]"
                style={{ borderColor: "var(--line-strong)" }}
                aria-hidden="true"
              >
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:-rotate-45" strokeWidth={2} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <GameScores />

      <section className="mt-14" data-reveal="up">
        <div className="grid gap-8 border-t pt-8 lg:grid-cols-12" style={{ borderColor: "var(--line-strong)" }}>
          <h2 className="text-[clamp(1.5rem,2.6vw,2.2rem)] tracking-[-0.04em] lg:col-span-4">
            როგორ გამოვიყენოთ თამაშები<span className="dot">.</span>
          </h2>
          <ol className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:col-span-8">
            {[
              { t: "დაიწყე გამოცნობით", d: "ის ყველაზე სწრაფად გიჩვენებს, რომელი ჟესტები არ იცი." },
              { t: "გაამყარე ბანქოთი", d: "შეწყვილება ილუსტრაციასა და მნიშვნელობას შორის კავშირს ამაგრებს." },
              { t: "გაიაზრე კავშირებით", d: "ჯგუფების პოვნა გასწავლის ჟესტების სისტემურად დანახვას." },
              { t: "გადაიტანე ცხოვრებაში", d: "სცენები ასწავლის იმას, რაც მთავარია — კონტექსტში წაკითხვას." },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-3" data-reveal="left" data-reveal-delay={i * 80}>
                <span className="num w-7 shrink-0 pt-0.5 text-[13px]" style={{ color: "var(--hot)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[14px] leading-relaxed">
                  <strong className="font-semibold">{s.t}</strong>
                  <span style={{ color: "var(--fg-muted)" }}> — {s.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
