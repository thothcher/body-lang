import type { Metadata } from "next";
import TestHub from "@/components/quiz/TestHub";
import { SectionHeading } from "@/components/ui/Primitives";
import { ALL_QUESTIONS, TEST_TOPICS } from "@/lib/content/quiz";
import { CHAPTERS } from "@/lib/content/chapters";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "ტესტები",
  description: `${ALL_QUESTIONS.length} კითხვა სხეულის ენაზე — ზოგადი ტესტი და ${TEST_TOPICS.length - 1} თემატური ბლოკი: ხელები, სახე, თვალები, მკლავები, ფეხები, თავი.`,
  alternates: { canonical: "/test" },
};

export default function TestIndexPage() {
  return (
    <div className="shell py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "ტესტები", href: "/test" },
        ])}
      />
      <SectionHeading
        kicker={`${ALL_QUESTIONS.length} კითხვა · ${TEST_TOPICS.length} ბლოკი · ${CHAPTERS.length} თავი`}
        title="შეამოწმე თავი"
        lead="ყველა ტესტი ერთნაირად მუშაობს: პასუხის შემდეგ მაშინვე ხედავ ახსნას, ბოლოს კი — რა გასამეორებელი დაგრჩა. შედეგები შენს ბრაუზერში ინახება."
      />
      <TestHub />
    </div>
  );
}
