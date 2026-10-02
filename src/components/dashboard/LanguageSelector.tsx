"use client";

import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_COOKIE, LOCALE_LABELS, isLocale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/app/client";

// Changes the app language: the choice is stored in the language cookie, which
// every page reads, then the page is refreshed in place.
export default function LanguageSelector() {
  const router = useRouter();
  const { t, locale } = useT();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    if (!isLocale(next)) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <select
      aria-label={t("lang.aria")}
      value={locale}
      onChange={handleChange}
      className="w-full rounded-xl border border-trail-200 bg-white px-4 py-2.5 text-sm text-trail-700 outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100 sm:w-auto"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
