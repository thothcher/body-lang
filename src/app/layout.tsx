import type { Metadata, Viewport } from "next";
import { Noto_Sans_Georgian, Noto_Serif_Georgian } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import RevealObserver from "@/components/motion/RevealObserver";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { ProgressProvider } from "@/lib/progress";
import { themeScript } from "@/components/layout/ThemeToggle";
import { SITE } from "@/lib/seo";

const sans = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-georgian",
});

const serif = Noto_Serif_Georgian({
  subsets: ["georgian", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-noto-serif-georgian",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "სხეულის ენა",
    "ალან პიზი",
    "არავერბალური კომუნიკაცია",
    "ჟესტები",
    "ფსიქოლოგია",
    "სიცრუის ამოცნობა",
    "body language",
    "ქართულად",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  applicationName: SITE.name,
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ka_GE",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#12141a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" dir="ltr" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: SITE.name,
              url: SITE.url,
              description: SITE.description,
              inLanguage: "ka",
              sameAs: [],
            }),
          }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:px-4 focus:py-2"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          მთავარ შიგთავსზე გადასვლა
        </a>

        <ProgressProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </ProgressProvider>

        <SmoothScroll />
        <CustomCursor />
        <RevealObserver />
      </body>
    </html>
  );
}
