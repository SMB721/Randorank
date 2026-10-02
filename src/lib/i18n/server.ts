import { cache } from "react";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, isLocale, type Locale } from "./config";

/** Best supported locale for an Accept-Language header, or null. */
export function matchAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter((l) => l.tag && !Number.isNaN(l.q) && l.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const primary = tag.split("-")[0];
    const hit = LOCALES.find((l) => l === primary);
    if (hit) return hit;
  }
  return null;
}

/**
 * The visitor's language for every page that has no locale in its URL
 * (sign-up funnel, dashboard): the language cookie set by the landing page
 * or the language switcher, else the browser's Accept-Language, else French.
 */
export const getRequestLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (value && isLocale(value)) return value;
  return matchAcceptLanguage((await headers()).get("accept-language")) ?? DEFAULT_LOCALE;
});
