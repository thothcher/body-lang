"use client";

import * as React from "react";

export interface ParallaxProps {
  children: React.ReactNode;
  /** დადებითი = ნელა მოძრაობს (უკანა პლანი), უარყოფითი = სწრაფად */
  speed?: number;
  /** ჰორიზონტალური გადაადგილება */
  speedX?: number;
  /** მასშტაბი სქროლთან ერთად */
  zoom?: number;
  /** მაუსზე რეაქცია (0–1) */
  tilt?: number;
  className?: string;
  as?: "div" | "section" | "span";
}

/** სქროლზე და მაუსზე დამოკიდებული პარალაქსი — rAF-ზე, ერთ transform-ში. */
export default function Parallax({
  children,
  speed = 0.14,
  speedX = 0,
  zoom = 0,
  tilt = 0,
  className,
  as: Tag = "div",
}: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const mouse = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };

    const onMouse = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const tick = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // -1 (ქვემოთ ეკრანს) → 1 (ზემოთ ეკრანს)
      const progress = (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2 + rect.height / 2);

      cur.x += (mouse.x - cur.x) * 0.07;
      cur.y += (mouse.y - cur.y) * 0.07;

      const ty = progress * speed * 100;
      const tx = progress * speedX * 100 + cur.x * tilt * 18;
      const extraY = cur.y * tilt * 14;
      const sc = 1 + Math.abs(progress) * zoom;

      el.style.transform = `translate3d(${tx.toFixed(2)}px, ${(ty + extraY).toFixed(2)}px, 0) scale(${sc.toFixed(4)})`;
      raf = requestAnimationFrame(tick);
    };

    if (tilt) window.addEventListener("pointermove", onMouse, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMouse);
    };
  }, [speed, speedX, zoom, tilt]);

  return (
    <Tag ref={ref as never} className={className} style={{ willChange: "transform" }}>
      {children}
    </Tag>
  );
}
