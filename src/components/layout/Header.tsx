"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Box,
  ChartLine,
  ClipboardCheck,
  Gamepad2,
  Menu,
  PersonStanding,
  ScanEye,
  X,
  type LucideIcon,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import SearchDialog from "./SearchDialog";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/chapters", label: "თავები", icon: BookOpen },
  { href: "/test", label: "ტესტი", icon: ClipboardCheck },
  { href: "/games", label: "თამაშები", icon: Gamepad2 },
  { href: "/studio", label: "3D სტუდია", icon: Box },
  { href: "/reader", label: "წაკითხვა", icon: ScanEye },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    // სქროლის საწყისი მდგომარეობა კლიენტზე
     
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

  return (
    <header
      className="sticky top-0 z-[100] transition-all duration-300"
      style={{
        background: scrolled ? "color-mix(in srgb, var(--bg) 82%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(1.4)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
      }}
    >
      <nav className="shell flex h-16 items-center justify-between gap-4" aria-label="მთავარი ნავიგაცია">
        <Link href="/" className="focus-ring group flex items-center gap-2.5" data-cursor="მთავარი">
          <span
            className="grid size-9 place-items-center rounded-xl transition-transform duration-300 group-hover:rotate-6"
            style={{ background: "var(--brand)" }}
          >
            <PersonStanding className="size-5" color="#fff" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap leading-tight">
            <span className="block font-serif text-[15px] font-semibold">სხეულის ენა</span>
            <span className="block text-[10px] tracking-wide lg:hidden xl:block" style={{ color: "var(--fg-faint)" }}>
              ალან პიზის მიხედვით
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring group relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors hover:text-[var(--brand)] xl:px-3.5"
                style={{
                  color: active ? "var(--brand)" : "var(--fg-muted)",
                  background: active ? "var(--brand-wash)" : "transparent",
                }}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className="hidden size-4 transition-transform duration-300 group-hover:-translate-y-px xl:block"
                  strokeWidth={active ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <SearchDialog />
          <ThemeToggle />
          <Link
            href="/progress"
            className="focus-ring hidden items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-opacity hover:opacity-85 sm:flex xl:px-3.5"
            style={{ background: "var(--brand)", color: "#fff" }}
            data-cursor="პროგრესი"
            aria-label="ჩემი პროგრესი"
          >
            <ChartLine className="size-4" strokeWidth={2} aria-hidden="true" />
            <span className="lg:hidden xl:inline">პროგრესი</span>
          </Link>
          <button
            type="button"
            className="focus-ring grid size-9 place-items-center rounded-full border lg:hidden"
            style={{ borderColor: "var(--line)" }}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "მენიუს დახურვა" : "მენიუს გახსნა"}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t lg:hidden" style={{ background: "var(--bg-raised)" }}>
          <div className="shell grid gap-1 py-3">
            {[...NAV, { href: "/progress", label: "ჩემი პროგრესი", icon: ChartLine }].map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors hover:bg-[var(--bg-sunken)]"
                  style={{ color: active ? "var(--brand)" : undefined }}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-[18px]" strokeWidth={1.8} style={{ color: "var(--brand)" }} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
