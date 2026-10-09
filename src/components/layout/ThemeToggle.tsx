"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Mode = "light" | "dark" | "system";

const KEY = "sxeulis-ena:theme";

export function applyTheme(mode: Mode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
}

/** ინლაინ სკრიპტი — თემის აღდგენა პირველივე დახატვამდე. */
export const themeScript = `(function(){try{var m=localStorage.getItem("${KEY}");if(m&&m!=="system"){document.documentElement.setAttribute("data-theme",m);}}catch(e){}})();`;

export default function ThemeToggle() {
  const [mode, setMode] = React.useState<Mode>("system");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // ჰიდრატაციის შემდეგ შენახული თემის აღდგენა
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(KEY) as Mode | null;
      if (saved) setMode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const cycle = () => {
    const next: Mode = mode === "system" ? "dark" : mode === "dark" ? "light" : "system";
    setMode(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  };

  const label = mode === "dark" ? "ბნელი" : mode === "light" ? "ნათელი" : "სისტემური";

  return (
    <button
      type="button"
      onClick={cycle}
      className="focus-ring grid size-9 place-items-center rounded-full border transition-colors hover:bg-[var(--bg-raised)]"
      style={{ borderColor: "var(--line-strong)" }}
      aria-label={`თემა: ${label}. შესაცვლელად დააჭირე`}
      title={`თემა — ${label}`}
      data-cursor="თემა"
      suppressHydrationWarning
    >
      {!mounted ? (
        <span className="block size-4 rounded-full" style={{ background: "var(--line-strong)" }} />
      ) : mode === "dark" ? (
        <Moon className="size-4" strokeWidth={1.8} aria-hidden="true" />
      ) : mode === "light" ? (
        <Sun className="size-4" strokeWidth={1.8} aria-hidden="true" />
      ) : (
        <Monitor className="size-4" strokeWidth={1.8} aria-hidden="true" />
      )}
    </button>
  );
}
