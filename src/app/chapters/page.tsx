import type { Metadata } from "next";
import ChapterBrowser from "@/components/ui/ChapterBrowser";
import { SectionHeading } from "@/components/ui/Primitives";
import { CHAPTERS, TOTAL_MINUTES } from "@/lib/content/chapters";
import { GESTURES } from "@/lib/content/gestures";
import { breadcrumbJsonLd, courseJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "თავები",
  description: `სხეულის ენის ${CHAPTERS.length} თავი ქართულად — ხელები, სახე, თვალები, ფეხები, სივრცე. ${GESTURES.length} ჟესტი ილუსტრაციით და ძიებით.`,
  alternates: { canonical: "/chapters" },
  openGraph: {
    title: "თავები · სხეულის ენა",
    description: `${CHAPTERS.length} თავი და ${GESTURES.length} ჟესტი — ილუსტრაციებით, შეჯამებებით და ტესტებით.`,
  },
};

export default function ChaptersPage() {
  return (
    <div className="shell py-12">
      <JsonLd data={courseJsonLd(CHAPTERS)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "თავები", href: "/chapters" },
        ])}
      />

      <SectionHeading
        kicker={`${CHAPTERS.length} თავი · ${TOTAL_MINUTES} წუთი · ${GESTURES.length} ჟესტი`}
        title="სრული სასწავლო მასალა"
        lead="თავები თანმიმდევრობითაა დალაგებული — საფუძვლებიდან პრაქტიკამდე. ქვემოთ კი ჟესტების ბიბლიოთეკაა, სადაც სხეულის ნაწილისა და ტონის მიხედვით ფილტრავ."
      />

      <ChapterBrowser />
    </div>
  );
}
