import type { Metadata } from "next";
import Link from "next/link";
import BodyFigure from "@/components/figures/BodyFigure";
import { SectionHeading } from "@/components/ui/Primitives";
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

      <SectionHeading
        kicker="ოთხი თამაში"
        title="ივარჯიშე თამაშით"
        lead="ცოდნა მეხსიერებაში მაშინ ჯდება, როცა გამოიყენება. თითოეული თამაში სხვა უნარს ავარჯიშებს: სისწრაფეს, მეხსიერებას, ლოგიკასა და კონტექსტის წაკითხვას."
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {GAMES.map((g, i) => (
          <Link
            key={g.href}
            href={g.href}
            className="card focus-ring group relative flex flex-col overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]"
            data-reveal="up"
            data-reveal-delay={(i % 2) * 100}
            data-cursor="თამაში"
          >
            <div className="relative grid h-40 place-items-center overflow-hidden" style={{ background: g.wash }}>
              <BodyFigure
                pose={g.pose}
                className="h-36 transition-transform duration-600 group-hover:scale-110 group-hover:-rotate-3"
                showFocus={false}
              />
              <span
                className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: g.color, color: "#fff" }}
              >
                <g.icon className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
                {g.tag}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-[20px] transition-colors group-hover:text-[var(--brand)]">{g.title}</h2>
              <p className="mt-1.5 flex-1 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {g.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: g.color }}>
                თამაში
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <GameScores />

      <section className="mt-14" data-reveal="up">
        <div className="card p-6 sm:p-8">
          <h2 className="text-[20px]">როგორ გამოვიყენოთ თამაშები</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { t: "დაიწყე გამოცნობით", d: "ის ყველაზე სწრაფად გიჩვენებს, რომელი ჟესტები არ იცი." },
              { t: "გაამყარე ბანქოთი", d: "შეწყვილება ილუსტრაციასა და მნიშვნელობას შორის კავშირს ამაგრებს." },
              { t: "გაიაზრე კავშირებით", d: "ჯგუფების პოვნა გასწავლის ჟესტების სისტემურად დანახვას." },
              { t: "გადაიტანე ცხოვრებაში", d: "სცენები ასწავლის იმას, რაც მთავარია — კონტექსტში წაკითხვას." },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-3" data-reveal="left" data-reveal-delay={i * 80}>
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold"
                  style={{ background: "var(--brand-wash)", color: "var(--brand)" }}
                >
                  {i + 1}
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
