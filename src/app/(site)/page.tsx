import type { Metadata } from "next";
import LandingPage from "@/components/home/LandingPage";
import { landingAlternates, landingPath } from "@/lib/i18n/config";

// French is the default locale and stays at "/" (see lib/i18n/config.ts);
// the other locales live under /en, /it, /es, /de.
export const metadata: Metadata = {
  alternates: { canonical: landingPath("fr"), languages: landingAlternates() },
};

export default function Home() {
  return <LandingPage locale="fr" />;
}
