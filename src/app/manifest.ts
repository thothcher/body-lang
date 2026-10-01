import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/** GitHub Pages-ზე საიტი ქვე-მისამართზეა (მაგ. /body-lang) */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: `${BASE}/`,
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#4a5497",
    lang: "ka",
    categories: ["education", "books"],
    icons: [{ src: `${BASE}/icon.svg`, sizes: "any", type: "image/svg+xml" }],
  };
}
