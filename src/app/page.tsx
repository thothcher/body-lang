import type { Metadata } from "next";
import Link from "next/link";
import BodyFigure from "@/components/figures/BodyFigure";
import FaceSignal from "@/components/figures/FaceSignal";
import HandSign from "@/components/figures/HandSign";
import { RatioVisual } from "@/components/figures/Diagrams";
import Parallax from "@/components/motion/Parallax";
import ChapterCard from "@/components/ui/ChapterCard";
import GestureCard from "@/components/ui/GestureCard";
import { CTA, SectionHeading, Stat } from "@/components/ui/Primitives";
import { CHAPTERS, TOTAL_MINUTES } from "@/lib/content/chapters";
import { GESTURES, GESTURE_MAP } from "@/lib/content/gestures";
import { ALL_QUESTIONS } from "@/lib/content/quiz";
import { courseJsonLd, faqJsonLd, JsonLd, SITE } from "@/lib/seo";
import {
  ArrowRight,
  BookOpen,
  Box,
  ClipboardCheck,
  Gamepad2,
  Hand,
  Plus,
  Scale,
  ScanEye,
  Trophy,
  type LucideIcon,
} from "lucide-react";

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

const SPOTLIGHT = ["arms-crossed", "nose-touch", "steeple-up", "dilated-pupils", "figure-four", "palm-up"];

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

const PATH: { n: string; t: string; d: string; href: string; icon: LucideIcon }[] = [
  { n: "01", icon: Scale, t: "ისწავლე წესები", d: "მტევანი, კონგრუენტულობა, კონტექსტი — სამი ფილტრი ყველა დაკვირვებისთვის.", href: "/chapters/sami-tsesi" },
  { n: "02", icon: Hand, t: "დაიმახსოვრე ჟესტები", d: `${GESTURES.length} ჟესტი ილუსტრაციებით, დაყოფილი სხეულის ნაწილების მიხედვით.`, href: "/chapters" },
  { n: "03", icon: Gamepad2, t: "ივარჯიშე თამაშებში", d: "გამოცნობა, ბანქო და კავშირები — ცოდნა მეხსიერებაში მაშინ ჯდება, როცა გამოიყენება.", href: "/games" },
  { n: "04", icon: Trophy, t: "შეამოწმე და შეინახე", d: "ტესტები თავების მიხედვით; პროგრესი ავტომატურად ინახება შენს ბრაუზერში.", href: "/progress" },
];

export default function HomePage() {
  const featured = CHAPTERS.slice(0, 6);
  const spotlight = SPOTLIGHT.map((id) => GESTURE_MAP[id]).filter(Boolean);

  return (
    <>
      <JsonLd data={courseJsonLd(CHAPTERS)} />
      <JsonLd data={faqJsonLd(FAQ)} />

      {/* ============================ HERO ============================ */}
      <section className="grain relative overflow-hidden pb-20 pt-10 sm:pt-16">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(90% 60% at 50% -10%, var(--brand-wash), transparent 70%), radial-gradient(60% 40% at 100% 20%, var(--color-clay-wash), transparent 60%)",
          }}
        />

        {/* პარალაქსული ფიგურები */}
        <Parallax speed={0.24} tilt={0.5} className="pointer-events-none absolute -left-6 top-24 hidden opacity-[0.5] lg:block">
          <BodyFigure pose="arms-crossed" className="h-72" showFocus={false} />
        </Parallax>
        <Parallax speed={-0.18} tilt={0.8} className="pointer-events-none absolute -right-4 top-40 hidden opacity-[0.5] lg:block">
          <BodyFigure pose="steeple-up" className="h-64" showFocus={false} />
        </Parallax>
        <Parallax speed={0.34} tilt={1.4} className="pointer-events-none absolute right-[16%] top-16 hidden xl:block">
          <HandSign sign="ok" className="h-24 opacity-70" />
        </Parallax>

        <div className="shell relative">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="mx-auto inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px]"
              style={{ borderColor: "var(--line-strong)", color: "var(--fg-muted)" }}
              data-reveal="down"
            >
              <span className="size-1.5 rounded-full" style={{ background: "var(--color-clay)" }} />
              ალან პიზის წიგნის მიხედვით · ქართულად
            </p>

            <h1
              className="mt-6 text-balance font-serif text-[clamp(2.4rem,7vw,4.6rem)] font-bold leading-[1.06]"
              data-reveal="up"
              data-reveal-delay="80"
            >
              ადამიანები{" "}
              <span className="relative inline-block">
                <span style={{ color: "var(--brand)" }}>სიტყვებამდე</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  style={{ height: "0.36em" }}
                >
                  <path
                    d="M2 8C40 3 80 3 118 6c28 2 54 3 80 1"
                    fill="none"
                    stroke="var(--color-clay)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                </svg>
              </span>{" "}
              ლაპარაკობენ
            </h1>

            <p
              className="mx-auto mt-6 max-w-xl text-pretty text-[16.5px] leading-relaxed"
              style={{ color: "var(--fg-muted)" }}
              data-reveal="up"
              data-reveal-delay="160"
            >
              {CHAPTERS.length} თავი, {GESTURES.length} ჟესტი ილუსტრაციით, ტესტები, თამაშები და
              ცოცხალი 3D მოდელი — რომ ისწავლო ის, რასაც სხეული ამბობს მაშინ, როცა ენა დუმს.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3" data-reveal="up" data-reveal-delay="240">
              <CTA href="/chapters/safuzvlebi" cursor="დაწყება">
                დაიწყე სწავლა
                <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden="true" />
              </CTA>
              <CTA href="/studio" variant="outline" cursor="3D">
                <Box className="size-4" strokeWidth={2} aria-hidden="true" />
                სცადე 3D სტუდია
              </CTA>
            </div>
          </div>

          {/* ჰერო ილუსტრაციები */}
          <div className="mt-14 grid grid-cols-3 gap-3 sm:gap-6 lg:mx-auto lg:max-w-3xl">
            {[
              { pose: "palm-up", label: "ღიაობა", tone: "var(--color-sage)" },
              { pose: "nose-touch", label: "სიცრუე", tone: "var(--color-amber)" },
              { pose: "hips", label: "მზადყოფნა", tone: "var(--color-indigo)" },
            ].map((item, i) => (
              <figure
                key={item.pose}
                className="card grid place-items-center overflow-hidden pb-3 pt-4 transition-transform duration-500 hover:-translate-y-2"
                data-reveal="rise"
                data-reveal-delay={300 + i * 110}
              >
                <BodyFigure pose={item.pose} className="h-36 sm:h-48" />
                <figcaption className="mt-2 text-[12.5px] font-semibold" style={{ color: item.tone }}>
                  {item.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ RATIO =========================== */}
      <section className="shell py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              kicker="რატომ ღირს სწავლა"
              title="სიტყვები შეტყობინების მხოლოდ მცირე ნაწილია"
              lead="ალბერტ მეიერაბიანის კვლევამ აჩვენა, რომ ინფორმაციის უდიდესი ნაწილი სიტყვების გვერდით მიდის. თუ მხოლოდ სიტყვებს უსმენ — უმეტესობას კარგავ."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <CTA href="/chapters/safuzvlebi" variant="outline">
                <BookOpen className="size-4" strokeWidth={2} aria-hidden="true" />
                წაიკითხე საფუძვლები
              </CTA>
            </div>
          </div>
          <RatioVisual />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={`${CHAPTERS.length}`} label="თავი" sub="საფუძვლებიდან პრაქტიკამდე" />
          <Stat value={`${GESTURES.length}`} label="ჟესტი" sub="თითოეული ილუსტრაციით" accent="var(--color-clay)" />
          <Stat value={`${ALL_QUESTIONS.length}`} label="ტესტის კითხვა" sub="შვიდი თემატური ბლოკი" accent="var(--color-sage)" />
          <Stat value={`${TOTAL_MINUTES} წთ`} label="კითხვის დრო" sub="მთლიანი მასალა" accent="var(--color-amber)" />
        </div>
      </section>

      {/* =========================== CHAPTERS ========================= */}
      <section className="shell py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            kicker="სასწავლო გზა"
            title="თავები"
            lead="თითოეული თავი მთავრდება შეჯამებით და დასამახსოვრებელი ბირთვით — რომ ერთხელ წაკითხულმა იმუშაოს."
          />
          <CTA href="/chapters" variant="ghost" cursor="ყველა">
            ყველა {CHAPTERS.length} თავი
            <ArrowRight className="size-4" strokeWidth={2.2} aria-hidden="true" />
          </CTA>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c, i) => (
            <ChapterCard key={c.slug} chapter={c} index={i} />
          ))}
        </div>
      </section>

      {/* =========================== SPOTLIGHT ======================== */}
      <section className="py-16" style={{ background: "var(--bg-sunken)" }}>
        <div className="shell">
          <SectionHeading
            kicker="ჟესტების ბიბლიოთეკა"
            title="ყველა ჟესტი ერთ ენაზე — ილუსტრაციით"
            lead="ყოველი ჟესტი დაყოფილია ტონის მიხედვით: ღია, დახურული, უპირატესობა, სიცრუე ან შეფასება. შენახვა ერთი დაწკაპუნებით."
            align="center"
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {spotlight.map((g) => (
              <GestureCard key={g.id} gesture={g} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <CTA href="/chapters" variant="outline">
              <BookOpen className="size-4" strokeWidth={2} aria-hidden="true" />
              ნახე სრული ბიბლიოთეკა
            </CTA>
          </div>
        </div>
      </section>

      {/* ============================ TOOLS =========================== */}
      <section className="shell py-16">
        <SectionHeading
          kicker="ინსტრუმენტები"
          title="ისწავლე კეთებით, არა კითხვით"
          lead="ოთხი ინტერაქტიული ინსტრუმენტი, რომლებიც თეორიას უნარად აქცევს."
          align="center"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {TOOLS.map((t, i) => (
            <Link
              key={t.href}
              href={t.href}
              className="card focus-ring group flex items-center gap-5 overflow-hidden p-5 transition-all duration-400 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              data-reveal="up"
              data-reveal-delay={(i % 2) * 90}
              data-cursor="გახსნა"
            >
              <div
                className="grid size-28 shrink-0 place-items-center rounded-2xl"
                style={{ background: "var(--bg-sunken)" }}
              >
                <BodyFigure
                  pose={t.pose}
                  className="h-24 transition-transform duration-500 group-hover:scale-110"
                  showFocus={false}
                />
              </div>
              <div className="min-w-0">
                <p className="eyebrow inline-flex items-center gap-1.5">
                  <t.icon className="size-3.5" strokeWidth={2} style={{ color: "var(--brand)" }} aria-hidden="true" />
                  {t.kicker}
                </p>
                <h3 className="mt-1 text-[19px] transition-colors group-hover:text-[var(--brand)]">{t.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  {t.text}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================== EYE TEASER ======================== */}
      <section className="shell py-16">
        <div className="card grid items-center gap-8 overflow-hidden p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHeading
              kicker="ერთი მაგალითი"
              title="მზერის სამი ზონა"
              lead="სად უყურებ — განსაზღვრავს ურთიერთობის ტიპს. შუბლის სამკუთხედი ქმნის საქმიან ატმოსფეროს, პირამდე დაწევა — მეგობრულს, სხეულზე დაწევა — ინტიმურს."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <CTA href="/chapters/tvalebi">თავი თვალებზე</CTA>
              <CTA href="/test/eyes" variant="outline">
                ტესტი თვალებზე
              </CTA>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { p: "gaze-business", l: "საქმიანი" },
              { p: "gaze-social", l: "სოციალური" },
              { p: "gaze-intimate", l: "ინტიმური" },
            ].map((g, i) => (
              <figure
                key={g.p}
                className="rounded-2xl pb-3 pt-2 text-center"
                style={{ background: "var(--bg-sunken)" }}
                data-reveal="scale"
                data-reveal-delay={i * 110}
              >
                <FaceSignal pose={g.p} className="h-36 w-full" />
                <figcaption className="mt-1 text-[12px] font-semibold" style={{ color: "var(--fg-muted)" }}>
                  {g.l}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PATH ============================ */}
      <section className="py-16" style={{ background: "var(--bg-sunken)" }}>
        <div className="shell">
          <SectionHeading kicker="როგორ მუშაობს" title="ოთხი ნაბიჯი" align="center" />
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PATH.map((s, i) => (
              <li key={s.n} data-reveal="up" data-reveal-delay={i * 90}>
                <Link href={s.href} className="card focus-ring group block h-full p-5 transition-all duration-400 hover:-translate-y-1">
                  <span className="flex items-center justify-between">
                    <span
                      className="font-serif text-[34px] font-bold leading-none"
                      style={{ color: "var(--brand)", opacity: 0.32 }}
                    >
                      {s.n}
                    </span>
                    <span
                      className="grid size-10 place-items-center rounded-xl transition-transform duration-400 group-hover:-rotate-6 group-hover:scale-110"
                      style={{ background: "var(--brand-wash)", color: "var(--brand)" }}
                    >
                      <s.icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                  </span>
                  <h3 className="mt-2 text-[17px] transition-colors group-hover:text-[var(--brand)]">{s.t}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                    {s.d}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================= FAQ ============================ */}
      <section className="shell py-16">
        <SectionHeading kicker="კითხვები" title="ხშირად დასმული კითხვები" align="center" />
        <div className="mx-auto mt-8 grid max-w-3xl gap-3">
          {FAQ.map((item, i) => (
            <details
              key={item.q}
              className="card group overflow-hidden px-5 py-4 transition-colors"
              data-reveal="up"
              data-reveal-delay={i * 70}
            >
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-[16.5px] font-semibold">
                {item.q}
                <Plus
                  className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-45"
                  strokeWidth={2.2}
                  style={{ color: "var(--brand)" }}
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ============================= CTA ============================ */}
      <section className="shell pb-8">
        <div
          className="grain relative overflow-hidden rounded-[28px] px-6 py-14 text-center sm:px-12"
          style={{ background: "var(--brand)" }}
          data-reveal="scale"
        >
          <Parallax speed={0.14} className="pointer-events-none absolute -left-8 -top-6 opacity-20">
            <BodyFigure pose="open-stance" className="h-56" showFocus={false} />
          </Parallax>
          <Parallax speed={-0.12} className="pointer-events-none absolute -bottom-10 -right-6 opacity-20">
            <BodyFigure pose="behind-back" className="h-56" showFocus={false} />
          </Parallax>

          <h2 className="relative text-balance text-[clamp(1.7rem,4vw,2.6rem)]" style={{ color: "#fff" }}>
            15 წუთი დღეში. ერთი თვე.
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-[15.5px] leading-relaxed" style={{ color: "rgba(255,255,255,.85)" }}>
            იმდენი სჭირდება, რომ ადამიანებს სხვანაირად დაინახო. დაწყება ახლავე შეგიძლია — პროგრესი
            ავტომატურად შეინახება.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/chapters/safuzvlebi"
              className="focus-ring inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-transform hover:-translate-y-0.5"
              style={{ background: "#fff", color: "var(--color-indigo-deep)" }}
              data-cursor="დაწყება"
            >
              პირველი თავი
              <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden="true" />
            </Link>
            <Link
              href="/games/guess"
              className="focus-ring inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[15px] font-medium"
              style={{ borderColor: "rgba(255,255,255,.4)", color: "#fff" }}
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
