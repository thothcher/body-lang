import type { Metadata } from "next";
import ProgressClient from "@/components/progress/ProgressClient";
import { PageHeading } from "@/components/ui/Primitives";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "ჩემი პროგრესი",
  description:
    "წაკითხული თავები, ტესტების შედეგები, თამაშების რეკორდები და შენახული ჟესტები — ყველაფერი ინახება შენს ბრაუზერში.",
  alternates: { canonical: "/progress" },
  robots: { index: false, follow: true },
};

export default function ProgressPage() {
  return (
    <div className="shell py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "ჩემი პროგრესი", href: "/progress" },
        ])}
      />
      <PageHeading
        kicker="შენახული ბრაუზერში"
        title="პროგრესი"
        tagline="ყველაფერი, რაც გააკეთე"
        lead="აქ ყველაფერი ჩანს, რაც აქამდე გააკეთე. არაფერი იგზავნება სერვერზე — მონაცემები მხოლოდ ამ მოწყობილობაზე რჩება."
      />
      <ProgressClient />
    </div>
  );
}
