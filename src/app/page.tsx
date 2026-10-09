import type { Metadata } from "next";
import Link from "next/link";
import BodyFigure from "@/components/figures/BodyFigure";
import FaceSignal from "@/components/figures/FaceSignal";
import GestureFigure from "@/components/figures/GestureFigure";
import { RatioVisual } from "@/components/figures/Diagrams";
import GestureStage from "@/components/home/GestureStage";
import Parallax from "@/components/motion/Parallax";
import { CTA, SectionHeading, Stat } from "@/components/ui/Primitives";
import { CHAPTERS, TOTAL_MINUTES } from "@/lib/content/chapters";
import { GESTURES, GESTURE_MAP } from "@/lib/content/gestures";
import { ALL_QUESTIONS } from "@/lib/content/quiz";
import { courseJsonLd, faqJsonLd, JsonLd, SITE } from "@/lib/seo";
import { ArrowRight, ArrowUpRight, Box, ClipboardCheck, Gamepad2, Plus, ScanEye, type LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

const FAQ = [
  {
    q: "რა არის სხეულის ენა?",
    a: "სხეულის ენა არავერბალური სიგნალების სისტემაა — ჟესტები, პოზა, მიმიკა, მზერა და დისტანცია. კვლევების მიხედვით, ურთიერთობის 55–65% სწორედ ამ არხით გადაიცემა, სიტყვებით კი მხოლოდ 7–35%.",
  },
  {
    q: "საიდან უნდა დავიწყო სწავლა?",
    a: "დაიწყე პირველი ორი თავიდან: „საფუძვლები“ და „სამი წესი“. მათ გარეშე ცალკეული ჟესტების ცოდნა შეცდომებს მოგიტანს, რადგან ჟესტი კონტექსტისა და სხვა ჟესტების გარეშე არ იკითხება.",
  },
  {
    q: "შესაძლებელია თუ არა სხეულის ენის გაყალბება?",
    a: "მოკლე დროით — კი, ხანგრძლივად — არა. ორგანიზმი ქვეცნობიერად გასცემს მიკროსიგნალებს: გუგების ზომის ცვლილებას, სახის ნაკვთების შეტოკებას, ხამხამის გახშირებას. ეს სიგნალები ნათქვამს ეწინააღმდეგება.",
  },
  {
    q: "როგორ გავიგო, რომ ადამიანი ცრუობს?",
    a: "ერთი ჟესტით — ვერასდროს. სიცრუე იკითხება კლასტერით: ხელი სახესთან (პირი, ცხვირი, ყური), შეუსაბამობა სიტყვასა და ჟესტს შორის, და მიკროსიგნალები. მზერის არიდება საიმედო ნიშანი არ არის.",
  },
  {
    q: "რამდენი დრო სჭირდება ამ კურსს?",
    a: `მთლიანი მასალა დაახლოებით ${TOTAL_MINUTES} წუთია. მაგრამ რეალური შედეგისთვის საჭიროა პრაქტიკა — დღეში 15 წუთი დაკვირვება ერთი თვის განმავლობაში.`,
  },
];


const TOOLS: { href: string; kicker: string; title: string; text: string; pose: string; icon: LucideIcon }[] = [
  {
    href: "/studio",
    icon: Box,
    kicker: "3D",
    title: "სტუდია",
    text: "ააწყვე პოზა ცოცხალ 3D მოდელზე: მზერა, ხელები, ფეხები, პოზა — და ნახე, რას კითხულობს ის.",
    pose: "steeple-up",
  },
  {
    href: "/reader",
    icon: ScanEye,
    kicker: "ანალიზი",
    title: "ადამიანის წაკითხვა",
    text: "ინტერაქტიული ფიგურა აქსესუარებით. დააწკაპუნე ნებისმიერ დეტალზე და ნახე, რას ამბობს ის.",
    pose: "thumbs-pockets",
  },
  {
    href: "/games",
    icon: Gamepad2,
    kicker: "თამაში",
    title: "ოთხი თამაში",
    text: "გამოიცანი ჟესტი, მეხსიერების ბანქო, კავშირები და სცენის გაშიფვრა — ყველა ტაიმერით.",
    pose: "shrug",
  },
  {
    href: "/test",
    icon: ClipboardCheck,
    kicker: "ტესტი",
    title: "შეამოწმე თავი",
    text: `${ALL_QUESTIONS.length} კითხვა — ზოგადი ან კონკრეტული სხეულის ნაწილის მიხედვით.`,
    pose: "evaluation",
  },
];

const PATH: { n: string; t: string; d: string; href: string }[] = [
  { n: "01", t: "ისწავლე წესები", d: "მტევანი, კონგრუენტულობა, კონტექსტი — სამი ფილტრი ყველა დაკვირვებისთვის.", href: "/chapters/sami-tsesi" },
  { n: "02", t: "დაიმახსოვრე ჟესტები", d: `${GESTURES.length} ჟესტი ილუსტრაციებით, დაყოფილი სხეულის ნაწილების მიხედვით.`, href: "/chapters" },
  { n: "03", t: "ივარჯიშე თამაშებში", d: "გამოცნობა, ბანქო და კავშირები — ცოდნა მეხსიერებაში მაშინ ჯდება, როცა გამოიყენება.", href: "/games" },
  { n: "04", t: "შეამოწმე და შეინახე", d: "ტესტები თავების მიხედვით; პროგრესი ავტომატურად ინახება შენს ბრაუზერში.", href: "/progress" },
];

const TICKER = [
  "ხელის გულები",
  "მზერის სამი ზონა",
  "ცხვირთან შეხება",
  "გადაჯვარედინებული მკლავები",
  "პირამიდა",
  "გუგები",
  "ტერიტორია",
  "ფეხის მიმართულება",
  "ღიმილი",
  "სარკისებური პოზა",
];

export default function HomePage() {
  const index = CHAPTERS.slice(0, 8);
  const [studio, ...tools] = TOOLS;

  return (
    <>
      <JsonLd data={courseJsonLd(CHAPTERS)} />
      <JsonLd data={faqJsonLd(FAQ)} />

      {/* ============================ HERO ============================ */}
      <section className="shell pb-6 pt-2 lg:pt-3">
        <GestureStage first="palm-up" />
      </section>

      {/* =========================== TICKER =========================== */}
      <div className="mt-10 overflow-hidden border-y py-4" style={{ borderColor: "var(--line)" }} aria-hidden="true">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {TICKER.map((t) => (
                <span key={t} className="flex items-center whitespace-nowrap text-[clamp(1.25rem,2.4vw,2rem)] font-bold tracking-[-0.035em]">
                  <span className="px-6">{t}</span>
                  <span className="size-2 rounded-full" style={{ background: "var(--hot)" }} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============================ RATIO =========================== */}
      <section className="shell py-24 lg:py-32">
        <SectionHeading
          index="01"
          kicker="რატომ ღირს სწავლა"
          title="სიტყვები შეტყობინების მხოლოდ მცირე ნაწილია"
          lead="ალბერტ მეიერაბიანის კვლევამ აჩვენა, რომ ინფორმაციის უდიდესი ნაწილი სიტყვების გვერდით მიდის. თუ მხოლოდ სიტყვებს უსმენ — უმეტესობას კარგავ."
        />
        <div className="mt-6 grid lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-5">
            <RatioVisual />
          </div>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={`${CHAPTERS.length}`} label="თავი" sub="საფუძვლებიდან პრაქტიკამდე" />
          <Stat value={`${GESTURES.length}`} label="ჟესტი" sub="თითოეული ილუსტრაციით" accent="var(--hot)" />
          <Stat value={`${ALL_QUESTIONS.length}`} label="ტესტის კითხვა" sub="შვიდი თემატური ბლოკი" />
          <Stat value={`${TOTAL_MINUTES}`} label="წუთი კითხვა" sub="მთლიანი მასალა" />
        </div>
      </section>

      {/* =========================== CHAPTERS ========================= */}
      <section className="shell py-16">
        <SectionHeading
          index="02"
          kicker="სასწავლო გზა"
          title="თავები, თანმიმდევრობით"
          lead="თითოეული თავი მთავრდება შეჯამებით და დასამახსოვრებელი ბირთვით — რომ ერთხელ წაკითხულმა იმუშაოს."
        />

        <ol className="mt-12 border-t" style={{ borderColor: "var(--line-strong)" }}>
          {index.map((c, i) => {
            const g = GESTURE_MAP[c.cover];
            return (
              <li key={c.slug} className="border-b" style={{ borderColor: "var(--line)" }} data-reveal="up" data-reveal-delay={(i % 4) * 60}>
                <Link
                  href={`/chapters/${c.slug}`}
                  className="focus-ring group relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-5 sm:grid-cols-[4rem_minmax(0,1.2fr)_minmax(0,1fr)_5rem_auto] sm:gap-x-6 sm:py-6"
                  data-cursor="წაკითხვა"
                >
                  <span className="num text-[13px]" style={{ color: "var(--fg-faint)" }}>
                    {String(c.order).padStart(2, "0")}
                  </span>
                  <span className="text-[clamp(1.35rem,2.6vw,2.2rem)] font-bold leading-tight tracking-[-0.04em] transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-[var(--hot)]">
                    {c.title}
                  </span>
                  <span className="hidden text-[14px] leading-snug sm:block" style={{ color: "var(--fg-muted)" }}>
                    {c.subtitle}
                  </span>
                  <span className="num hidden text-right text-[12px] sm:block" style={{ color: "var(--fg-faint)" }}>
                    {c.minutes} წთ
                  </span>
                  <span
                    className="grid size-10 place-items-center rounded-full border transition-colors duration-300 group-hover:border-transparent group-hover:bg-[var(--fg)] group-hover:text-[var(--bg)]"
                    style={{ borderColor: "var(--line-strong)" }}
                    aria-hidden="true"
                  >
                    <ArrowUpRight className="size-4" strokeWidth={2} />
                  </span>
                  {g && (
                    <span
                      className="stage pointer-events-none absolute right-28 top-1/2 z-10 hidden h-36 w-28 -translate-y-1/2 scale-90 place-items-center opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 xl:grid"
                      style={{ boxShadow: "var(--shadow-lift)" }}
                      aria-hidden="true"
                    >
                      <GestureFigure gesture={g} labelled={false} showFocus={false} className="h-28 w-auto" />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex justify-end">
          <CTA href="/chapters" variant="outline" cursor="ყველა">
            ყველა {CHAPTERS.length} თავი
            <ArrowRight className="size-4" strokeWidth={2.2} aria-hidden="true" />
          </CTA>
        </div>
      </section>

      {/* ============================ TOOLS =========================== */}
      <section className="shell py-24">
        <SectionHeading
          index="03"
          kicker="ინსტრუმენტები"
          title="ისწავლე კეთებით, არა კითხვით"
          lead="ოთხი ინტერაქტიული ინსტრუმენტი, რომლებიც თეორიას უნარად აქცევს."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <Link
            href={studio.href}
            className="ink focus-ring group relative flex min-h-[440px] flex-col justify-between overflow-hidden rounded-[var(--radius-card)] p-7 sm:p-9 lg:col-span-7 lg:row-span-3"
            data-reveal="up"
            data-cursor="გახსნა"
          >
            <div className="relative z-10 flex items-center justify-between">
              <span className="num text-[13px] opacity-60">{studio.kicker}</span>
              <span className="grid size-11 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-45" style={{ background: "var(--hot)", color: "#fff" }}>
                <ArrowUpRight className="size-5" strokeWidth={2} aria-hidden="true" />
              </span>
            </div>
            <BodyFigure
              pose={studio.pose}
              className="pointer-events-none absolute -bottom-6 right-[-4%] h-[92%] transition-transform duration-700 group-hover:-translate-y-3"
              showFocus={false}
            />
            <div className="relative z-10 max-w-sm">
              <h3 className="display text-[clamp(2.6rem,5vw,4.4rem)]">
                3D სტუდია<span className="dot">.</span>
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed opacity-70">{studio.text}</p>
            </div>
          </Link>

          {tools.map((t, i) => (
            <Link
              key={t.href}
              href={t.href}
              className="card focus-ring group flex items-center gap-5 p-5 transition-[border-color,box-shadow] duration-300 hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-lift)] lg:col-span-5"
              data-reveal="left"
              data-reveal-delay={i * 90}
              data-cursor="გახსნა"
            >
              <div className="stage grid size-24 shrink-0 place-items-center rounded-[18px_18px_18px_4px]">
                <BodyFigure pose={t.pose} className="h-20 transition-transform duration-500 group-hover:scale-110" showFocus={false} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">{t.kicker}</p>
                <h3 className="mt-1 text-[20px] tracking-[-0.03em]">{t.title}</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  {t.text}
                </p>
              </div>
              <ArrowUpRight
                className="size-5 shrink-0 transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--hot)]"
                strokeWidth={1.8}
                style={{ color: "var(--fg-faint)" }}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ========================== EYE TEASER ======================== */}
      <section className="shell py-16">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              stacked
              index="04"
              kicker="ერთი მაგალითი"
              title="მზერის სამი ზონა"
              lead="სად უყურებ — განსაზღვრავს ურთიერთობის ტიპს. შუბლის სამკუთხედი ქმნის საქმიან ატმოსფეროს, პირამდე დაწევა — მეგობრულს, სხეულზე დაწევა — ინტიმურს."
            />
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <CTA href="/chapters/tvalebi">თავი თვალებზე</CTA>
              <CTA href="/test/eyes" variant="ghost">
                ტესტი თვალებზე →
              </CTA>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:col-span-7">
            {[
              { p: "gaze-business", l: "საქმიანი", n: "a" },
              { p: "gaze-social", l: "სოციალური", n: "b" },
              { p: "gaze-intimate", l: "ინტიმური", n: "c" },
            ].map((g, i) => (
              <figure key={g.p} data-reveal="up" data-reveal-delay={i * 110} className={i === 1 ? "lg:-translate-y-10" : ""}>
                <div className="stage grid aspect-[3/4] place-items-center overflow-hidden px-2">
                  <FaceSignal pose={g.p} className="w-full" />
                </div>
                <figcaption className="mt-3 flex items-baseline justify-between px-1 text-[13px] font-semibold">
                  {g.l}
                  <span className="num text-[11px] font-normal" style={{ color: "var(--fg-faint)" }}>
                    ({g.n})
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PATH ============================ */}
      <section className="shell py-24">
        <SectionHeading index="05" kicker="როგორ მუშაობს" title="ოთხი ნაბიჯი" />
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4">
          {PATH.map((s, i) => (
            <li
              key={s.n}
              className="border-t py-6 sm:pr-6 lg:border-l lg:border-t-0 lg:px-6 lg:py-2 lg:first:border-l-0 lg:first:pl-0"
              style={{ borderColor: "var(--line-strong)" }}
              data-reveal="up"
              data-reveal-delay={i * 90}
            >
              <Link href={s.href} className="focus-ring group block">
                <span
                  className="display block text-[clamp(3.5rem,6vw,5.5rem)] transition-colors duration-300 group-hover:!text-[var(--hot)]"
                  style={{ color: "var(--line-strong)" }}
                >
                  {s.n}
                </span>
                <h3 className="mt-6 text-[19px] tracking-[-0.03em]">{s.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  {s.d}
                </p>
                <span className="ink-link mt-4 inline-block text-[13px] font-semibold">გახსნა →</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ============================= FAQ ============================ */}
      <section className="shell py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHeading stacked index="06" kicker="კითხვები" title="ხშირად დასმული კითხვები" />
            </div>
          </div>
          <div className="border-t lg:col-span-8" style={{ borderColor: "var(--line-strong)" }}>
            {FAQ.map((item, i) => (
              <details
                key={item.q}
                className="group border-b py-6"
                style={{ borderColor: "var(--line)" }}
                data-reveal="up"
                data-reveal-delay={i * 60}
              >
                <summary className="focus-ring flex cursor-pointer list-none items-start gap-5 text-[clamp(1.1rem,1.8vw,1.4rem)] font-bold tracking-[-0.03em] [&::-webkit-details-marker]:hidden">
                  <span className="num w-8 shrink-0 pt-1 text-[12px] font-normal tracking-normal" style={{ color: "var(--fg-faint)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">{item.q}</span>
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300 group-open:border-transparent group-open:bg-[var(--hot)] group-open:text-white"
                    style={{ borderColor: "var(--line-strong)" }}
                  >
                    <Plus className="size-4 transition-transform duration-300 group-open:rotate-45" strokeWidth={2} aria-hidden="true" />
                  </span>
                </summary>
                <p className="mt-3 max-w-[62ch] pl-[3.25rem] pr-4 text-[15px] leading-relaxed sm:pr-14" style={{ color: "var(--fg-muted)" }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= CTA ============================ */}
      <section className="shell pt-16">
        <div className="ink relative overflow-hidden rounded-[var(--radius-3xl)] px-6 py-16 sm:px-12 sm:py-20" data-reveal="scale">
          <Parallax speed={-0.1} className="pointer-events-none absolute -bottom-16 right-[2%] hidden md:block">
            <BodyFigure pose="open-stance" className="h-[380px]" showFocus={false} />
          </Parallax>

          <p className="eyebrow relative" style={{ color: "inherit", opacity: 0.6 }}>
            დაწყება ახლავე
          </p>
          <h2 className="display relative mt-5 max-w-[14ch] text-[clamp(2.6rem,7vw,6.2rem)]">
            15 წუთი დღეში<span className="dot">.</span> ერთი თვე<span className="dot">.</span>
          </h2>
          <p className="relative mt-8 max-w-md text-[16px] leading-relaxed opacity-70">
            იმდენი სჭირდება, რომ ადამიანებს სხვანაირად დაინახო. დაწყება ახლავე შეგიძლია — პროგრესი ავტომატურად შეინახება.
          </p>
          <div className="relative mt-9 flex flex-wrap gap-3">
            <Link
              href="/chapters/safuzvlebi"
              className="focus-ring inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-transform duration-300 hover:-translate-y-0.5"
              style={{ background: "var(--hot)", color: "#fff" }}
              data-cursor="დაწყება"
            >
              პირველი თავი
              <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden="true" />
            </Link>
            <Link
              href="/games/guess"
              className="focus-ring inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[15px] font-semibold transition-colors"
              style={{ borderColor: "color-mix(in srgb, var(--bg) 30%, transparent)" }}
              data-cursor="თამაში"
            >
              <Gamepad2 className="size-4" strokeWidth={2} aria-hidden="true" />
              ან პირდაპირ თამაში
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
