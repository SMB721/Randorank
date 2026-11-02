// Countries offered at sign-up. France first (current audience), then the
// English-speaking markets targeted next, then the other app languages.
// "ZZ" is the ISO user-assigned code we use for "somewhere else".
export const COUNTRY_CODES = [
  "FR", "BE", "CH", "LU", "GB", "IE", "US", "CA", "AU", "NZ", "ZA", "DE", "ES", "IT", "ZZ",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export const OTHER_COUNTRY: CountryCode = "ZZ";

export function isCountryCode(value: string): value is CountryCode {
  return (COUNTRY_CODES as readonly string[]).includes(value);
}

const OTHER_LABEL: Record<string, string> = {
  fr: "Autre pays",
  en: "Other country",
  de: "Anderes Land",
  es: "Otro país",
  it: "Altro paese",
};

/** Country name in the visitor's language (Intl, so no dictionary entries). */
export function countryName(code: string, locale: string): string {
  if (code === OTHER_COUNTRY) return OTHER_LABEL[locale] ?? OTHER_LABEL.en;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
