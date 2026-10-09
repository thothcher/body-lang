import type { Metadata } from "next";
import StudioClient from "@/components/studio/StudioClient";
import { PageHeading } from "@/components/ui/Primitives";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "3D სტუდია",
  description:
    "ააწყვე პოზა ცოცხალ 3D მოდელზე: ხელები, ფეხები, თავი, მზერა, პოზა და ტანსაცმელი — და ნახე, რას კითხულობს სხეულის ენა რეალურ დროში.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return (
    <div className="shell py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "მთავარი", href: "/" },
          { name: "3D სტუდია", href: "/studio" },
        ])}
      />
      <PageHeading
        kicker="ინტერაქტიული ლაბორატორია"
        title="3D სტუდია"
        tagline="ააწყვე პოზა, ნახე აზრი"
        lead="შეცვალე ხელები, ფეხები, თავი, მზერა და პოზა — და ნახე, როგორ იცვლება წაკითხვა რეალურ დროში. ზოგი კომბინაცია განსაკუთრებულ მნიშვნელობას იძენს."
      />
      <div className="mt-8">
        <StudioClient />
      </div>
    </div>
  );
}
