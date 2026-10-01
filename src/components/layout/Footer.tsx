import Link from "next/link";
import { CHAPTERS } from "@/lib/content/chapters";
import { PersonStanding } from "lucide-react";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "სწავლა",
    links: [
      { href: "/chapters", label: "ყველა თავი" },
      { href: "/chapters/safuzvlebi", label: "საიდან დავიწყო" },
      { href: "/chapters/sami-tsesi", label: "სამი წესი" },
      { href: "/chapters/praqtika", label: "პრაქტიკა" },
    ],
  },
  {
    title: "ვარჯიში",
    links: [
      { href: "/test", label: "ტესტები" },
      { href: "/games/guess", label: "გამოიცანი ჟესტი" },
      { href: "/games/memory", label: "მეხსიერების ბანქო" },
      { href: "/games/connections", label: "კავშირები" },
    ],
  },
  {
    title: "ინსტრუმენტები",
    links: [
      { href: "/studio", label: "3D სტუდია" },
      { href: "/reader", label: "ადამიანის წაკითხვა" },
      { href: "/progress", label: "ჩემი პროგრესი" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t" style={{ background: "var(--bg-sunken)" }}>
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl" style={{ background: "var(--brand)" }}>
                <PersonStanding className="size-5" color="#fff" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="font-serif text-lg font-semibold">სხეულის ენა</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              ინტერაქტიული სახელმძღვანელო ალან პიზის წიგნის მიხედვით. {CHAPTERS.length} თავი,
              ილუსტრაციები, ტესტები და თამაშები — ქართულად.
            </p>
            <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--fg-faint)" }}>
              მასალა ეყრდნობა ალან პიზის წიგნს „სხეულის ენა“. საგანმანათლებლო დანიშნულებისაა.
            </p>
          </div>

          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="eyebrow mb-3">{col.title}</h2>
              <ul className="grid gap-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="focus-ring text-sm transition-colors hover:text-[var(--brand)]"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div
          className="mt-12 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ color: "var(--fg-faint)" }}
        >
          <p>© {new Date().getFullYear()} სხეულის ენა — სასწავლო პროექტი</p>
          <p>შენი პროგრესი ინახება მხოლოდ შენს ბრაუზერში.</p>
        </div>
      </div>
    </footer>
  );
}
