import type { MetadataRoute } from "next";
import { LOCALES, landingPath } from "@/lib/i18n/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  // One entry per landing locale, each listing all its translations so
  // search engines serve the right language.
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, `${siteUrl}${landingPath(l) === "/" ? "" : landingPath(l)}`])
  );
  const landings: MetadataRoute.Sitemap = LOCALES.map((l) => ({
    url: languages[l],
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: l === "fr" ? 1 : 0.8,
    alternates: { languages },
  }));

  return [
    ...landings,
    {
      url: `${siteUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}