"use client";

import * as React from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { setLenis } from "@/lib/smoothScroll";

/**
 * ინერციული, გლუვი სქროლი (Lenis). მაუსის ბორბალზე მუშაობს; შეხებაზე
 * ბრაუზერის მშობლიური სქროლი რჩება. `prefers-reduced-motion`-ზე გამორთულია.
 * `data-lenis-prevent` ატრიბუტის მქონე ელემენტები (3D სცენა, სიები
 * დიალოგებში) საკუთარ სქროლს ინარჩუნებენ.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const ref = React.useRef<Lenis | null>(null);

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
      // შიდა ბმულები (#…) — გლუვად, სათაურის სიმაღლის გათვალისწინებით
      anchors: { offset: -88 },
      allowNestedScroll: true,
    });
    ref.current = lenis;
    setLenis(lenis);

    const onChange = () => {
      if (reduce.matches) lenis.destroy();
    };
    reduce.addEventListener("change", onChange);

    return () => {
      reduce.removeEventListener("change", onChange);
      lenis.destroy();
      ref.current = null;
      setLenis(null);
    };
  }, []);

  // გვერდის შეცვლისას ძველი ინერცია წყდება და ზომები ახლდება
  React.useEffect(() => {
    const lenis = ref.current;
    if (!lenis) return;
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    const id = requestAnimationFrame(() => lenis.resize());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
