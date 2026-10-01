import type { Metadata } from "next";
import Link from "next/link";
import ConnectionsGame from "@/components/games/ConnectionsGame";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "კავშირები",
  description:
    "16 ჟესტი, 4 ფარული ჯგუფი. იპოვე, რა აერთიანებს მათ — ტონი, სხეულის ნაწილი თუ ფუნქცია. სამი თავსატეხი.",
  alternates: { canonical: "/games/connections" },
};

export default function ConnectionsPage() {
  return (
    <div className="shell py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "თამაშები", href: "/games" },
          { name: "კავშირები", href: "/games/connections" },
        ])}
      />
      <nav aria-label="გზა" className="text-[12.5px]" style={{ color: "var(--fg-faint)" }}>
        <Link href="/games" className="focus-ring hover:text-[var(--brand)]">თამაშები</Link>
        <span className="mx-1.5">/</span>
        <span style={{ color: "var(--fg-muted)" }}>კავშირები</span>
      </nav>
      <header className="mx-auto mt-5 max-w-xl text-center" data-reveal="up">
        <h1 className="font-serif text-[clamp(1.8rem,4.6vw,2.6rem)] font-bold">კავშირები</h1>
        <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          იპოვე ოთხი ჯგუფი ოთხ-ოთხი ჟესტით. ზოგი ჟესტი ერთზე მეტ ჯგუფს მოერგება — სწორი მხოლოდ ერთია.
        </p>
      </header>
      <div className="mt-8">
        <ConnectionsGame />
      </div>
    </div>
  );
}
