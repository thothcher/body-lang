"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import SearchDialog from "./SearchDialog";
import { useProgress } from "@/lib/progress";

const NAV: { href: string; label: string }[] = [
  { href: "/chapters", label: "თავები" },
  { href: "/test", label: "ტესტი" },
  { href: "/games", label: "თამაშები" },
  { href: "/studio", label: "3D სტუდია" },
  { href: "/reader", label: "წაკითხვა" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-serif font-extrabold tracking-[-0.04em] ${className}`}>
      სხეულის ენა<span className="dot">.</span>
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { state, ready } = useProgress();
  const readCount = ready ? state.read.length : 0;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    // მარშრუტის შეცვლისას მობილური მენიუ იხურება
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className="sticky top-0 z-[100] transition-[background,border-color,backdrop-filter] duration-300"
      style={{
        background: scrolled || open ? "var(--glass)" : "transparent",
        backdropFilter: scrolled || open ? "blur(18px) saturate(1.6)" : "none",
        WebkitBackdropFilter: scrolled || open ? "blur(18px) saturate(1.6)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
      }}
    >
      <nav className="shell flex h-[68px] items-center justify-between gap-4" aria-label="მთავარი ნავიგაცია">
        <Link href="/" className="focus-ring flex items-baseline gap-3" data-cursor="მთავარი">
          <Wordmark className="text-[21px] leading-none" />
          <span className="hidden text-[11.5px] 2xl:inline" style={{ color: "var(--fg-faint)" }}>
            ალან პიზის მიხედვით
          </span>
        </Link>

        <div
          className="glass absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full p-1 lg:flex"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring whitespace-nowrap rounded-full px-4 py-[7px] text-[13.5px] font-medium transition-colors duration-200"
                style={{
                  color: active ? "var(--bg)" : "var(--fg-muted)",
                  background: active ? "var(--fg)" : "transparent",
                }}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <SearchDialog />
          <ThemeToggle />
          <Link
            href="/progress"
            className="focus-ring hidden items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-3.5 pr-1.5 text-[13px] font-medium transition-opacity hover:opacity-85 sm:flex"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
            data-cursor="პროგრესი"
            aria-label={`ჩემი პროგრესი — წაკითხულია ${readCount} თავი`}
          >
            პროგრესი
            <span
              className="num grid h-6 min-w-8 place-items-center rounded-full px-1.5 text-[11.5px] font-semibold"
              style={{ background: "var(--hot)", color: "#fff" }}
            >
              {String(readCount).padStart(2, "0")}
            </span>
          </Link>
          <button
            type="button"
            className="focus-ring grid size-9 place-items-center rounded-full border lg:hidden"
            style={{ borderColor: "var(--line-strong)" }}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "მენიუს დახურვა" : "მენიუს გახსნა"}
          >
            {open ? <X className="size-[18px]" aria-hidden="true" /> : <Menu className="size-[18px]" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[68px] overflow-y-auto lg:hidden"
          style={{ background: "var(--bg)" }}
        >
          <ol className="shell grid pb-10 pt-4">
            {[...NAV, { href: "/progress", label: "ჩემი პროგრესი" }].map((item, i) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="border-b" style={{ borderColor: "var(--line)" }}>
                  <Link
                    href={item.href}
                    className="focus-ring group flex items-baseline gap-4 py-4"
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="num w-7 text-[12px]" style={{ color: "var(--fg-faint)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="display flex-1 text-[clamp(2rem,9vw,3rem)]"
                      style={{ color: active ? "var(--hot)" : "var(--fg)" }}
                    >
                      {item.label}
                    </span>
                    <ArrowUpRight className="size-5 self-center" strokeWidth={1.6} style={{ color: "var(--fg-faint)" }} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </header>
  );
}
