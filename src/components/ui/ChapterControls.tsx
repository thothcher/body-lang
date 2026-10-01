"use client";

import * as React from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { Check } from "lucide-react";

/** კითხვის პროგრესის ზოლი გვერდის თავზე. */
export function ReadingBar() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let raf = 0;
    const tick = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[120] h-[3px]"
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      <div
        ref={ref}
        className="h-full origin-left"
        style={{
          background: "linear-gradient(90deg, var(--brand), var(--color-clay))",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}

/** „წაკითხულად მონიშვნა“ + შემდეგი თავი. */
export function ChapterFinish({
  slug,
  next,
  prev,
}: {
  slug: string;
  next?: { slug: string; title: string };
  prev?: { slug: string; title: string };
}) {
  const { state, ready, markRead, unmarkRead } = useProgress();
  const done = ready && state.read.includes(slug);
  const [justDone, setJustDone] = React.useState(false);

  const toggle = () => {
    if (done) unmarkRead(slug);
    else {
      markRead(slug);
      setJustDone(true);
      setTimeout(() => setJustDone(false), 2600);
    }
  };

  return (
    <div className="mt-12" data-reveal="up">
      <div
        className="card relative overflow-hidden p-6 text-center"
        style={{ background: done ? "var(--color-sage-wash)" : "var(--bg-raised)" }}
      >
        {justDone && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className="absolute size-2 rounded-full"
                style={{
                  background: ["var(--color-sage)", "var(--brand)", "var(--color-clay)", "var(--color-amber)"][i % 4],
                  left: `${8 + i * 9}%`,
                  animation: `pulse-ring 1.4s ${i * 0.08}s var(--ease-out-soft)`,
                }}
              />
            ))}
          </div>
        )}

        <p className="font-serif text-[19px] font-semibold">
          {done ? "ეს თავი წაკითხულია" : "დაასრულე თავი"}
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {done
            ? "შენი პროგრესი ბრაუზერში შეინახა. გააგრძელე შემდეგი თავით ან შეამოწმე თავი ტესტით."
            : "მონიშნე წაკითხულად — პროგრესი შეინახება და პროგრესის გვერდზე დაინახავ."}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14.5px] font-medium transition-transform hover:-translate-y-0.5"
            style={{
              background: done ? "transparent" : "var(--color-sage)",
              color: done ? "var(--color-sage)" : "#fff",
              border: done ? "1px solid var(--color-sage)" : "none",
            }}
            data-cursor={done ? "გაუქმება" : "დასრულება"}
          >
            <Check className="size-4" strokeWidth={2.6} aria-hidden="true" />
            {done ? "მონიშვნის მოხსნა" : "წაკითხულად მონიშვნა"}
          </button>
          <Link
            href={`/test/${slug}`}
            className="focus-ring rounded-full border px-5 py-2.5 text-[14.5px]"
            style={{ borderColor: "var(--line-strong)" }}
          >
            ამ თავის ტესტი
          </Link>
        </div>
      </div>

      <nav className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="თავების ნავიგაცია">
        {prev ? (
          <Link
            href={`/chapters/${prev.slug}`}
            className="card focus-ring group p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <span className="eyebrow">წინა თავი</span>
            <span className="mt-1 block font-serif text-[16px] font-semibold transition-colors group-hover:text-[var(--brand)]">
              ← {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/chapters/${next.slug}`}
            className="card focus-ring group p-4 text-right transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <span className="eyebrow">შემდეგი თავი</span>
            <span className="mt-1 block font-serif text-[16px] font-semibold transition-colors group-hover:text-[var(--brand)]">
              {next.title} →
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}

/** გვერდითი შიგთავსის ნავიგაცია — აქტიური სექციის თვალყურის დევნებით. */
export function ChapterToc({ items }: { items: { id: string; heading: string }[] }) {
  const [active, setActive] = React.useState(items[0]?.id);

  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -62% 0px", threshold: 0 },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="თავის შიგთავსი" className="sticky top-24">
      <p className="eyebrow mb-3">ამ თავში</p>
      <ul className="grid gap-0.5 border-l" style={{ borderColor: "var(--line)" }}>
        {items.map((it) => {
          const on = active === it.id;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className="focus-ring -ml-px block border-l-2 py-1.5 pl-3 text-[13.5px] leading-snug transition-colors"
                style={{
                  borderColor: on ? "var(--brand)" : "transparent",
                  color: on ? "var(--brand)" : "var(--fg-faint)",
                  fontWeight: on ? 600 : 400,
                }}
              >
                {it.heading}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
