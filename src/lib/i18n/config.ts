// Landing-page i18n. French is the default locale and lives at "/" (no
// prefix) so existing URLs and SEO are untouched; every other locale lives
// under "/<locale>". The app itself (auth, dashboard, funnel) is still
// French-only: only the public landing page is translated for now.
export const LOCALES = ["fr", "en", "it", "es", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  it: "Italiano",
  es: "Español",
  de: "Deutsch",
};

export const OG_LOCALES: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_GB",
  it: "it_IT",
  es: "es_ES",
  de: "de_DE",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Path of the landing page for a locale, optionally to a section anchor. */
export function landingPath(locale: Locale, hash?: string): string {
  const base = locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
  return hash ? `${base}#${hash}` : base;
}

/** hreflang map for <link rel="alternate">, including x-default. */
export function landingAlternates(): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = landingPath(l);
  languages["x-default"] = landingPath(DEFAULT_LOCALE);
  return languages;
}

/**
 * The visitor's language is remembered in a cookie set when they view a
 * landing page, so the (unprefixed) sign-up funnel and checkout can follow
 * it. It is a UI preference only, not personal data.
 */
export const LOCALE_COOKIE = "rr_locale";

/** Stripe Checkout supports these UI locales; ours are a subset. */
export const STRIPE_LOCALES: Record<Locale, "fr" | "en" | "it" | "es" | "de"> = {
  fr: "fr",
  en: "en",
  it: "it",
  es: "es",
  de: "de",
};

/** Formats an amount in euros the way the locale writes it (6,99 € / €6.99). */
export function formatEuro(locale: Locale, amount: number): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
