export const SITE = {
  name: "სხეულის ენა",
  tagline: "არავერბალური კომუნიკაციის სახელმძღვანელო",
  description:
    "ინტერაქტიული ქართული სახელმძღვანელო სხეულის ენაზე ალან პიზის წიგნის მიხედვით: 14 თავი ილუსტრაციებით, ტესტები, თამაშები და 3D სტუდია ჟესტების საწვრთნელად.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sxeulis-ena.example.com",
  locale: "ka_GE",
} as const;

/** სასწავლო კურსის სტრუქტურირებული მონაცემები */
export function courseJsonLd(chapters: { title: string; subtitle: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    inLanguage: "ka",
    url: `${SITE.url}/chapters`,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT2H",
    },
    syllabusSections: chapters.map((c, i) => ({
      "@type": "Syllabus",
      position: i + 1,
      name: c.title,
      description: c.subtitle,
      url: `${SITE.url}/chapters/${c.slug}`,
    })),
  };
}

export function articleJsonLd(ch: {
  title: string;
  subtitle: string;
  slug: string;
  intro: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ch.title,
    description: ch.subtitle,
    articleBody: ch.intro,
    inLanguage: "ka",
    url: `${SITE.url}/chapters/${ch.slug}`,
    isPartOf: { "@type": "Course", name: SITE.name, url: `${SITE.url}/chapters` },
    publisher: { "@type": "Organization", name: SITE.name },
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.href}`,
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
