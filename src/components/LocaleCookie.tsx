"use client";

import { useEffect } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

// Rendered on every landing page: remembers the language the visitor is
// reading so the sign-up funnel that follows is in the same language.
export default function LocaleCookie({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);
  return null;
}
