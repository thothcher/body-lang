import type { MetadataRoute } from "next";
import { CHAPTERS } from "@/lib/content/chapters";
import { TEST_TOPICS } from "@/lib/content/quiz";
import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const statics: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/chapters`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/test`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/games`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/studio`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/reader`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/progress`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const chapters: MetadataRoute.Sitemap = CHAPTERS.map((c) => ({
    url: `${SITE.url}/chapters/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const tests: MetadataRoute.Sitemap = TEST_TOPICS.map((t) => ({
    url: `${SITE.url}/test/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const games: MetadataRoute.Sitemap = ["guess", "memory", "connections", "decode"].map((g) => ({
    url: `${SITE.url}/games/${g}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...statics, ...chapters, ...tests, ...games];
}
