import type { Metadata } from "next";
import Link from "next/link";
import DecodeGame from "@/components/games/DecodeGame";
import { SCENES } from "@/lib/content/games";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "სცენის გაშიფვრა",
  description: `${SCENES.length} რეალური სიტუაცია: წაიკითხე ჟესტების მტევანი კონტექსტში და აირჩიე სწორი დასკვნა.`,
  alternates: { canonical: "/games/decode" },
};

export default function DecodePage() {
  return (
    <div className="shell py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "თამაშები", href: "/games" },
          { name: "სცენის გაშიფვრა", href: "/games/decode" },
        ])}
      />
      <nav aria-label="გზა" className="text-[12.5px]" style={{ color: "var(--fg-faint)" }}>
        <Link href="/games" className="focus-ring hover:text-[var(--brand)]">თამაშები</Link>
        <span className="mx-1.5">/</span>
        <span style={{ color: "var(--fg-muted)" }}>სცენის გაშიფვრა</span>
      </nav>
      <header className="mx-auto mt-5 max-w-xl text-center" data-reveal="up">
        <h1 className="font-serif text-[clamp(1.8rem,4.6vw,2.6rem)] font-bold">სცენის გაშიფვრა</h1>
        <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          აქ ერთი ჟესტი არ კმარა. წაიკითხე სიტუაცია, ნათქვამი და ჟესტების მტევანი ერთად — ზუსტად ისე,
          როგორც რეალურ ცხოვრებაში.
        </p>
      </header>
      <div className="mt-8">
        <DecodeGame />
      </div>
    </div>
  );
}
