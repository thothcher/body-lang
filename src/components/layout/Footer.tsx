import Link from "next/link";
import { CHAPTERS } from "@/lib/content/chapters";
import { GESTURES } from "@/lib/content/gestures";

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
    <footer className="mt-28 overflow-hidden border-t" style={{ borderColor: "var(--line)" }}>
      <div className="shell pt-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="max-w-sm text-[clamp(1.25rem,2vw,1.6rem)] font-semibold leading-snug tracking-[-0.02em]">
              ინტერაქტიული სახელმძღვანელო ალან პიზის წიგნის მიხედვით<span className="dot">.</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: "var(--fg-faint)" }}>
              <span className="num">{CHAPTERS.length}</span> თავი, <span className="num">{GESTURES.length}</span> ჟესტი,
              ტესტები და თამაშები — ქართულად. საგანმანათლებლო დანიშნულებისაა.
            </p>
          </div>

          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="md:col-span-2">
              <h2 className="eyebrow mb-4">{col.title}</h2>
              <ul className="grid gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="focus-ring ink-link pb-0.5 text-[14px]" style={{ color: "var(--fg-muted)" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div
          className="mt-14 flex flex-col gap-2 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ color: "var(--fg-faint)", borderColor: "var(--line)" }}
        >
          <p>
            © <span className="num">{new Date().getFullYear()}</span> სხეულის ენა — სასწავლო პროექტი
          </p>
          <p>შენი პროგრესი ინახება მხოლოდ შენს ბრაუზერში.</p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="display pointer-events-none mt-8 select-none whitespace-nowrap px-2 pb-[1.2vw] text-center text-[clamp(3rem,12.4vw,13.5rem)] leading-[1.02]"
        style={{ color: "var(--fg)" }}
      >
        სხეულის ენა<span className="dot">.</span>
      </p>
    </footer>
  );
}
