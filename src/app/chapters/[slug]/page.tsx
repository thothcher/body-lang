import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GestureFigure from "@/components/figures/GestureFigure";
import { SectionVisual } from "@/components/figures/Diagrams";
import GestureCard from "@/components/ui/GestureCard";
import { Callout, CTA } from "@/components/ui/Primitives";
import { Prose } from "@/components/ui/RichText";
import { ChapterFinish, ChapterToc, ReadingBar } from "@/components/ui/ChapterControls";
import QuizRunner from "@/components/quiz/QuizRunner";
import { CHAPTERS, chapterBySlug } from "@/lib/content/chapters";
import { GESTURE_MAP } from "@/lib/content/gestures";
import { questionsForChapter } from "@/lib/content/quiz";
import { articleJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ch = chapterBySlug(slug);
  if (!ch) return { title: "თავი ვერ მოიძებნა" };
  return {
    title: ch.title,
    description: `${ch.subtitle}. ${ch.intro.slice(0, 120)}…`,
    alternates: { canonical: `/chapters/${ch.slug}` },
    openGraph: {
      type: "article",
      title: `${ch.title} · სხეულის ენა`,
      description: ch.subtitle,
    },
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ch = chapterBySlug(slug);
  if (!ch) notFound();

  const idx = CHAPTERS.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? CHAPTERS[idx - 1] : undefined;
  const next = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : undefined;
  const cover = GESTURE_MAP[ch.cover];
  const questions = questionsForChapter(slug).slice(0, 5);

  const toc = [
    ...ch.sections.map((s) => ({ id: s.id, heading: s.heading })),
    { id: "core", heading: "დასამახსოვრებელი ბირთვი" },
    { id: "summary", heading: "შეჯამება" },
    ...(questions.length ? [{ id: "quiz", heading: "სწრაფი შემოწმება" }] : []),
  ];

  return (
    <>
      <ReadingBar />
      <JsonLd data={articleJsonLd(ch)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "თავები", href: "/chapters" },
          { name: ch.title, href: `/chapters/${ch.slug}` },
        ])}
      />

      {/* ============================ HERO ============================ */}
      <header className="relative pb-14 pt-6">
        <div className="shell">
          <nav aria-label="გზა" className="text-[12.5px]" style={{ color: "var(--fg-faint)" }}>
            <Link href="/" className="focus-ring hover:text-[var(--brand)]">
              მთავარი
            </Link>
            <span className="mx-1.5">/</span>
            <Link href="/chapters" className="focus-ring hover:text-[var(--brand)]">
              თავები
            </Link>
            <span className="mx-1.5">/</span>
            <span style={{ color: "var(--fg-muted)" }}>{ch.title}</span>
          </nav>

          <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12">
            <div className="flex flex-col justify-end">
              <div className="flex flex-wrap items-center gap-2.5 text-[12px]" data-reveal="down">
                <span
                  className="num rounded-full px-2.5 py-1 font-semibold"
                  style={{ background: "var(--fg)", color: "var(--bg)" }}
                >
                  {String(ch.order).padStart(2, "0")}
                </span>
                <span className="eyebrow">{ch.kicker}</span>
                <span className="num" style={{ color: "var(--fg-faint)" }}>· {ch.minutes} წთ</span>
              </div>

              <h1
                className="display mt-6 text-balance text-[clamp(2.6rem,6vw,5.4rem)]"
                data-reveal="up"
                data-reveal-delay="60"
              >
                {ch.title}
                <span className="dot">.</span>
              </h1>
              <p
                className="mt-3 text-[clamp(1.15rem,2.2vw,1.6rem)] font-semibold leading-snug tracking-[-0.025em]"
                style={{ color: "var(--fg-faint)" }}
                data-reveal="up"
                data-reveal-delay="110"
              >
                {ch.subtitle}
              </p>
              <p
                className="mt-5 max-w-xl text-pretty text-[16px] leading-[1.78]"
                style={{ color: "var(--fg-muted)" }}
                data-reveal="up"
                data-reveal-delay="170"
              >
                {ch.intro}
              </p>
            </div>

            {cover && (
              <figure
                className="stage relative grid min-h-[340px] place-items-center overflow-hidden py-8"
                data-reveal="scale"
                data-reveal-delay="180"
              >
                <GestureFigure gesture={cover} className="h-72" />
                <figcaption className="glass absolute bottom-4 left-4 rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ color: "var(--fg-muted)" }}>
                  {cover.title}
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      </header>

      {/* =========================== CONTENT ========================== */}
      <div className="shell grid gap-10 pb-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <ChapterToc items={toc} />
        </aside>

        <article className="min-w-0 max-w-[720px]">
          {ch.sections.map((section, si) => {
            const gestures = (section.gestures ?? [])
              .map((id) => GESTURE_MAP[id])
              .filter(Boolean);
            return (
              <section key={section.id} id={section.id} className="scroll-mt-24 pt-10 first:pt-2">
                <h2
                  className="text-[clamp(1.5rem,3vw,2.1rem)] leading-tight tracking-[-0.035em]"
                  data-reveal="up"
                >
                  <span
                    className="num mr-3 align-middle text-[13px] font-normal tracking-normal"
                    style={{ color: "var(--hot)" }}
                  >
                    {String(si + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>

                <div className="mt-4">
                  <Prose paragraphs={section.body} />
                </div>

                {section.visual && <SectionVisual kind={section.visual} />}

                {gestures.length > 0 && (
                  <div
                    className={`mt-6 grid gap-4 ${gestures.length === 1 ? "" : "sm:grid-cols-2"}`}
                  >
                    {gestures.map((g) => (
                      <GestureCard key={g.id} gesture={g} compact={gestures.length > 2} />
                    ))}
                  </div>
                )}

                {section.callout && <Callout data={section.callout} />}
              </section>
            );
          })}

          {/* ---------------------- ბირთვი ---------------------- */}
          <section id="core" className="scroll-mt-24 pt-14">
            <div
              className="rounded-[var(--radius-card)] p-6 sm:p-7"
              style={{ background: "var(--brand)", color: "#fff" }}
              data-reveal="up"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,.7)" }}>
                დასამახსოვრებელი ბირთვი
              </p>
              <h2 className="mt-1.5 font-serif text-[22px] font-bold" style={{ color: "#fff" }}>
                {ch.keyPoints.length} რამ, რაც უნდა დარჩეს
              </h2>
              <ul className="mt-5 grid gap-3">
                {ch.keyPoints.map((p, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed" data-reveal="left" data-reveal-delay={i * 70}>
                    <span
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold"
                      style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: "rgba(255,255,255,.94)" }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ---------------------- შეჯამება ---------------------- */}
          <section id="summary" className="scroll-mt-24 pt-12">
            <h2 className="text-[clamp(1.35rem,3vw,1.75rem)]" data-reveal="up">
              შეჯამება
            </h2>
            <blockquote
              className="mt-4 border-l-4 py-1 pl-5 font-serif text-[18px] leading-relaxed"
              style={{ borderColor: "var(--color-clay)", color: "var(--fg)" }}
              data-reveal="up"
              data-reveal-delay="80"
            >
              {ch.summary}
            </blockquote>

            {ch.related.length > 0 && (
              <div className="mt-6">
                <p className="eyebrow">დაკავშირებული თავები</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {ch.related.map((r) => {
                    const rc = CHAPTERS.find((c) => c.slug === r);
                    if (!rc) return null;
                    return (
                      <Link
                        key={r}
                        href={`/chapters/${r}`}
                        className="focus-ring rounded-full border px-3.5 py-1.5 text-[13px] transition-colors hover:bg-[var(--brand-wash)]"
                        style={{ borderColor: "var(--line-strong)" }}
                      >
                        {rc.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* ---------------------- ქვიზი ---------------------- */}
          {questions.length > 0 && (
            <section id="quiz" className="scroll-mt-24 pt-14">
              <h2 className="text-[clamp(1.35rem,3vw,1.75rem)]" data-reveal="up">
                სწრაფი შემოწმება
              </h2>
              <p className="mt-2 text-[15px]" style={{ color: "var(--fg-muted)" }} data-reveal="up">
                {questions.length} კითხვა ამ თავიდან. შედეგი ავტომატურად შეინახება.
              </p>
              <div className="mt-5" data-reveal="up" data-reveal-delay="80">
                <QuizRunner
                  questions={questions}
                  testId={`chapter:${ch.slug}`}
                  title={ch.title}
                  nextHref={next ? `/chapters/${next.slug}` : "/test"}
                  nextLabel={next ? "შემდეგი თავი" : "ყველა ტესტი"}
                  compact
                />
              </div>
            </section>
          )}

          <ChapterFinish
            slug={ch.slug}
            prev={prev && { slug: prev.slug, title: prev.title }}
            next={next && { slug: next.slug, title: next.title }}
          />

          {!next && (
            <div className="mt-8 text-center" data-reveal="up">
              <p className="font-serif text-[18px] font-semibold">ეს იყო ბოლო თავი 🎉</p>
              <p className="mx-auto mt-2 max-w-md text-[14.5px]" style={{ color: "var(--fg-muted)" }}>
                ახლა ყველაზე მნიშვნელოვანი ნაწილი იწყება — პრაქტიკა. შეამოწმე თავი სრული ტესტით ან
                ივარჯიშე თამაშებში.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <CTA href="/test/general">სრული ტესტი</CTA>
                <CTA href="/games" variant="outline">
                  თამაშები
                </CTA>
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
