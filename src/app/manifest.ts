import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#4a5497",
    lang: "ka",
    categories: ["education", "books"],
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
