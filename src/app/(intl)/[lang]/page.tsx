import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPage from "@/components/home/LandingPage";
import {
  DEFAULT_LOCALE,
  LOCALES,
  OG_LOCALES,
  isLocale,
  landingAlternates,
  landingPath,
} from "@/lib/i18n/config";
import { getLandingDict } from "@/lib/i18n/landing";

// Only the non-default locales are served here: "/" is the French page, and
// anything else (including "/fr") is a 404 rather than a duplicate.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getLandingDict(lang);

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: landingPath(lang), languages: landingAlternates() },
    openGraph: {
      type: "website",
      locale: OG_LOCALES[lang],
      siteName: "RandoRank",
      title: meta.title,
      description: meta.description,
      url: landingPath(lang),
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
  };
}

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === DEFAULT_LOCALE) notFound();
  return <LandingPage locale={lang} />;
}
