"use client";

import * as React from "react";

const R = 16;
const CIRC = 2 * Math.PI * R;

/**
 * კურსორი, რომელიც ამავე დროს სქროლის ინდიკატორია:
 * რგოლი ივსება გვერდის წაკითხულ ნაწილთან ერთად.
 */
export default function CustomCursor() {
  const dotRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<SVGSVGElement>(null);
  const arcRef = React.useRef<SVGCircleElement>(null);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const layerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    document.documentElement.classList.add("has-custom-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let scale = 1;
    let scaleTarget = 1;
    let raf = 0;
    let visible = false;

    const setVisible = (v: boolean) => {
      visible = v;
      if (layerRef.current) layerRef.current.style.opacity = v ? "1" : "0";
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onOver = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "a, button, [role='button'], input, select, textarea, [data-cursor]",
      ) as HTMLElement | null;
      const label = labelRef.current;
      if (el) {
        const custom = el.getAttribute("data-cursor");
        scaleTarget = custom ? 1.9 : 1.55;
        if (label) {
          label.textContent = custom ?? "";
          label.style.opacity = custom ? "1" : "0";
        }
        arcRef.current?.setAttribute("stroke", "var(--color-clay)");
      } else {
        scaleTarget = 1;
        if (label) label.style.opacity = "0";
        arcRef.current?.setAttribute("stroke", "var(--brand)");
      }
    };

    const onDown = () => (scaleTarget *= 0.72);
    const onUp = () => (scaleTarget = Math.max(1, scaleTarget / 0.72));
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const tick = () => {
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;
      scale += (scaleTarget - scale) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) scale(${scale.toFixed(3)})`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${ring.x + 18}px, ${ring.y + 16}px, 0)`;
      }

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (arcRef.current) {
        arcRef.current.style.strokeDashoffset = String(CIRC * (1 - p));
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div className="cursor-layer" ref={layerRef} style={{ opacity: 0 }} aria-hidden="true">
      <div className="cursor-dot" ref={dotRef} />
      <svg className="cursor-ring" ref={ringRef} viewBox="0 0 38 38">
        <circle cx="19" cy="19" r={R} fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
        <circle
          ref={arcRef}
          cx="19"
          cy="19"
          r={R}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
          transform="rotate(-90 19 19)"
        />
      </svg>
      <div className="cursor-label" ref={labelRef} />
    </div>
  );
}
