"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "../config";
import { createTranslator, type Dict, type Translator } from "./core";

const I18nContext = createContext<Translator | null>(null);

// Mounted once in the dashboard layout, so client components read the
// language with useT() instead of receiving texts through props.
export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dict;
  children: React.ReactNode;
}) {
  const value = useMemo(() => createTranslator(locale, dict), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): Translator {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside <I18nProvider>");
  return ctx;
}
