"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";

// The sign-up funnel shares the French root layout (its language comes from a
// cookie, so reading it in the layout would force every page dynamic). This
// keeps <html lang> right for screen readers once the page hydrates.
export default function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.lang = "fr";
    };
  }, [locale]);
  return null;
}
