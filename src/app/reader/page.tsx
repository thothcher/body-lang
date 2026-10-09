import type { Metadata } from "next";
import ReaderClient from "@/components/reader/ReaderClient";
import { PageHeading } from "@/components/ui/Primitives";
import { breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/lib/seo";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "ადამიანის წაკითხვა",
  description:
    "ინტერაქტიული ფიგურა: დისტანცია, პოზა, ფეხები, ხელები, თავი და მზერა — ექვსი ნაბიჯი სწორი თანმიმდევრობით. პლუს აქსესუარები: სათვალე, საათი, ბეჭედი, საყურე, ჩანთა.",
  alternates: { canonical: "/reader" },
};

const FAQ = [
  {
    q: "რას ნიშნავს საყურე მარჯვენა ან მარცხენა ყურში?",
    a: "მარჯვენა/მარცხენა ყურის „კოდი“ სხვადასხვა კულტურასა და ეპოქაში სხვადასხვას ნიშნავდა და დღეს პრაქტიკულად აღარ მოქმედებს — ეს სოციალური მოდაა, არა არავერბალური სიგნალი. ინფორმაციულია მხოლოდ ის, რამდენად ხშირად ეხება ადამიანი მას საუბრისას: სამკაულთან თამაში თვითდამამშვიდებელი ჟესტია.",
  },
  {
    q: "რას ამბობს ბეჭედი?",
    a: "თავად ბეჭედი არაფერს. მნიშვნელობა აქვს იმას, რას აკეთებს მასთან ხელი. ფროიდმა შენიშნა, რომ პაციენტი ქალი ბედნიერ ქორწინებაზე ლაპარაკობდა და ამავე დროს ქვეცნობიერად იხსნიდა და იკეთებდა საქორწინო ბეჭედს — ჟესტი სიტყვებს ეწინააღმდეგებოდა.",
  },
  {
    q: "რატომ არის სათვალის ცხვირწვერზე დაწევა კრიტიკული ჟესტი?",
    a: "სათვალის ცხვირწვერზე დაწევა და მის ზემოდან ყურება მსმენელს განსჯილად აგრძნობინებს თავს. ეს ერთ-ერთი ყველაზე უარყოფითად აღქმადი ჟესტია საუბარში.",
  },
  {
    q: "რა თანმიმდევრობით უნდა წავიკითხოთ ადამიანი?",
    a: "დისტანცია → პოზა → ფეხები → ხელები → თავი და სახე → მზერა, და მხოლოდ ბოლოს აქსესუარები. ეს რიგი ყველაზე გულწრფელი სიგნალიდან ყველაზე შეგნებულისკენ მიდის.",
  },
];

export default function ReaderPage() {
  return (
    <div className="shell py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "ადამიანის წაკითხვა", href: "/reader" },
        ])}
      />
      <JsonLd data={faqJsonLd(FAQ)} />

      <PageHeading
        kicker="ექვსი ნაბიჯი"
        title="წაკითხვა"
        tagline="ადამიანი ექვს ნაბიჯში"
        lead="დააწკაპუნე ფიგურის ნებისმიერ ზონაზე ან ჩართე აქსესუარი. ყველაზე მნიშვნელოვანი აქ თანმიმდევრობაა — აქსესუარები კითხვებს სვამენ, პასუხებს არა."
      />

      <div className="mt-8">
        <ReaderClient />
      </div>

      <section className="mt-16" aria-labelledby="reader-faq">
        <h2 id="reader-faq" className="text-[22px]">ხშირი კითხვები</h2>
        <div className="mt-5 grid max-w-3xl gap-3">
          {FAQ.map((f, i) => (
            <details key={f.q} className="card group px-5 py-4" data-reveal="up" data-reveal-delay={i * 70}>
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-[16px] font-semibold">
                {f.q}
                <Plus className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-45" strokeWidth={2.2} style={{ color: "var(--brand)" }} aria-hidden="true" />
              </summary>
              <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
