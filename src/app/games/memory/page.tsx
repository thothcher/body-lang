import type { Metadata } from "next";
import Link from "next/link";
import MemoryGame from "@/components/games/MemoryGame";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "მეხსიერების ბანქო",
  description:
    "შეაწყვილე ჟესტის ილუსტრაცია და მისი მნიშვნელობა. სამი დონე, ტაიმერი და საუკეთესო დროის რეკორდი.",
  alternates: { canonical: "/games/memory" },
};

export default function MemoryPage() {
  return (
    <div className="shell py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "თამაშები", href: "/games" },
          { name: "მეხსიერების ბანქო", href: "/games/memory" },
        ])}
      />
      <nav aria-label="გზა" className="text-[12.5px]" style={{ color: "var(--fg-faint)" }}>
        <Link href="/games" className="focus-ring hover:text-[var(--brand)]">თამაშები</Link>
        <span className="mx-1.5">/</span>
        <span style={{ color: "var(--fg-muted)" }}>მეხსიერების ბანქო</span>
      </nav>
      <h1 className="sr-only">მეხსიერების ბანქო — ჟესტი და მნიშვნელობა</h1>
      <div className="mt-6">
        <MemoryGame />
      </div>
    </div>
  );
}
