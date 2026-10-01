import type { NextConfig } from "next";

/**
 * GitHub Pages: სტატიკური ექსპორტი ქვე-მისამართზე (მაგ. /body-lang).
 * ლოკალურად (`npm run dev` / `npm start`) ჩვეულებრივი რეჟიმია; Pages-ის
 * ბილდს GitHub Actions რთავს `GITHUB_PAGES=true` და `PAGES_BASE_PATH`-ით.
 */
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "") : "";

const nextConfig: NextConfig = {
  ...(isPages && {
    output: "export",
    // /chapters → /chapters/index.html — სტატიკურ ჰოსტინგზე საიმედოა
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  ...(basePath && { basePath }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
