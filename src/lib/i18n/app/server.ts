import { cache } from "react";
import { getRequestLocale } from "../server";
import { createTranslator, getAppDict } from "./index";

/** Translator + raw dictionary for server components and actions. */
export const getT = cache(async () => {
  const locale = await getRequestLocale();
  const dict = getAppDict(locale);
  return { ...createTranslator(locale, dict), dict };
});
