"use client";

import * as React from "react";

/**
 * საკუთარი „AOS“ — ერთი გლობალური დამკვირვებელი, რომელიც ყველა
 * `[data-reveal]` ელემენტს აკვირდება. სერვერულ კომპონენტებს მხოლოდ
 * ატრიბუტის დამატება სჭირდებათ — client boundary არ არის საჭირო.
 *
 * `data-reveal="up|down|left|right|scale|blur|rise"`
 * `data-reveal-delay="120"`  — მილიწამებში
 * `data-reveal-once="false"` — გამეორებადი
 */
export default function RevealObserver() {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        el.classList.add("is-revealed");
      });
      return;
    }

    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            const delay = Number(el.dataset.revealDelay ?? 0);
            if (delay) el.style.transitionDelay = `${delay}ms`;
            el.classList.add("is-revealed");
            if (el.dataset.revealOnce !== "false") io.unobserve(el);
          } else if (el.dataset.revealOnce === "false") {
            el.classList.remove("is-revealed");
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        // უკვე ხილული ელემენტები მაშინვე ჩნდება
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          const delay = Number(el.dataset.revealDelay ?? 0);
          if (delay) el.style.transitionDelay = `${delay}ms`;
          requestAnimationFrame(() => el.classList.add("is-revealed"));
          return;
        }
        io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
