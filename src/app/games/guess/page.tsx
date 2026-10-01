import type { Metadata } from "next";
import Link from "next/link";
import GuessGame from "@/components/games/GuessGame";
import { GESTURES } from "@/lib/content/gestures";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "გამოიცანი ჟესტი",
  description: `თამაში ${GESTURES.length} ჟესტზე: ნახე პოზა და ამოიცანი მნიშვნელობა 15 წამში. ქულები, სერიები და რეკორდი.`,
  alternates: { canonical: "/games/guess" },
};

export default function GuessPage() {
  return (
    <div className="shell py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "თამაშები", href: "/games" },
          { name: "გამოიცანი ჟესტი", href: "/games/guess" },
        ])}
      />
      <nav aria-label="გზა" className="text-[12.5px]" style={{ color: "var(--fg-faint)" }}>
        <Link href="/games" className="focus-ring hover:text-[var(--brand)]">თამაშები</Link>
        <span className="mx-1.5">/</span>
        <span style={{ color: "var(--fg-muted)" }}>გამოიცანი ჟესტი</span>
      </nav>
      <h1 className="sr-only">გამოიცანი ჟესტი — სხეულის ენის თამაში</h1>
      <div className="mt-6">
        <GuessGame />
      </div>
    </div>
  );
}
