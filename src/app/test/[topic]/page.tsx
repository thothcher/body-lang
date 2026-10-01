import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QuizRunner from "@/components/quiz/QuizRunner";
import { CTA } from "@/components/ui/Primitives";
import { CHAPTERS, chapterBySlug } from "@/lib/content/chapters";
import {
  ALL_QUESTIONS,
  TEST_TOPICS,
  buildTest,
  questionsForChapter,
  questionsForPart,
  type Question,
} from "@/lib/content/quiz";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

interface Resolved {
  id: string;
  title: string;
  lead: string;
  questions: Question[];
  backHref: string;
  backLabel: string;
  testId: string;
}

function resolve(topic: string): Resolved | null {
  const meta = TEST_TOPICS.find((t) => t.id === topic);
  if (meta) {
    const pool = meta.part ? questionsForPart(meta.part) : ALL_QUESTIONS;
    const count = meta.part ? Math.min(pool.length, 12) : 16;
    return {
      id: topic,
      title: meta.title,
      lead: meta.description,
      questions: buildTest(count, topic.length * 977 + 13, pool),
      backHref: "/test",
      backLabel: "ყველა ტესტი",
      testId: `topic:${topic}`,
    };
  }

  const ch = chapterBySlug(topic);
  if (ch) {
    return {
      id: topic,
      title: ch.title,
      lead: `ტესტი მე-${ch.order} თავზე — ${ch.subtitle.toLowerCase()}`,
      questions: questionsForChapter(topic),
      backHref: `/chapters/${topic}`,
      backLabel: "თავზე დაბრუნება",
      testId: `chapter:${topic}`,
    };
  }
  return null;
}

export function generateStaticParams() {
  return [
    ...TEST_TOPICS.map((t) => ({ topic: t.id })),
    ...CHAPTERS.map((c) => ({ topic: c.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const r = resolve(topic);
  if (!r) return { title: "ტესტი ვერ მოიძებნა" };
  return {
    title: `ტესტი — ${r.title}`,
    description: `${r.lead}. ${r.questions.length} კითხვა ახსნებით.`,
    alternates: { canonical: `/test/${topic}` },
  };
}

export default async function TestPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const r = resolve(topic);
  if (!r) notFound();

  const others = TEST_TOPICS.filter((t) => t.id !== topic).slice(0, 4);

  return (
    <div className="shell py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "ტესტები", href: "/test" },
          { name: r.title, href: `/test/${topic}` },
        ])}
      />

      <nav aria-label="გზა" className="text-[12.5px]" style={{ color: "var(--fg-faint)" }}>
        <Link href="/test" className="focus-ring hover:text-[var(--brand)]">
          ტესტები
        </Link>
        <span className="mx-1.5">/</span>
        <span style={{ color: "var(--fg-muted)" }}>{r.title}</span>
      </nav>

      <header className="mx-auto mt-5 max-w-2xl text-center" data-reveal="up">
        <p className="eyebrow">{r.questions.length} კითხვა</p>
        <h1 className="mt-2 text-balance font-serif text-[clamp(1.9rem,5vw,2.9rem)] font-bold">
          {r.title}
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {r.lead}
        </p>
      </header>

      <div className="mx-auto mt-8 max-w-2xl" data-reveal="up" data-reveal-delay="80">
        <QuizRunner
          questions={r.questions}
          testId={r.testId}
          nextHref={r.backHref}
          nextLabel={r.backLabel}
        />
      </div>

      <section className="mx-auto mt-14 max-w-2xl" aria-labelledby="more-tests">
        <h2 id="more-tests" className="text-[18px]">
          სხვა ტესტები
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {others.map((t) => (
            <Link
              key={t.id}
              href={`/test/${t.id}`}
              className="focus-ring rounded-full border px-4 py-2 text-[13.5px] transition-colors hover:bg-[var(--brand-wash)]"
              style={{ borderColor: "var(--line-strong)" }}
            >
              {t.title}
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <CTA href="/games" variant="outline">
            ივარჯიშე თამაშებში
          </CTA>
          <CTA href="/progress" variant="ghost">
            ჩემი პროგრესი →
          </CTA>
        </div>
      </section>
    </div>
  );
}
