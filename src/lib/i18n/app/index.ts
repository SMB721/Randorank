import type { Locale } from "../config";
import type { Dict } from "./core";
import { fr } from "./fr";
import { en } from "./en";
import { it } from "./it";
import { es } from "./es";
import { de } from "./de";

export type { Dict, DictKey, Translator, Vars } from "./core";
export { createTranslator } from "./core";

const dictionaries: Record<Locale, Dict> = { fr, en, it, es, de };

export function getAppDict(locale: Locale): Dict {
  return dictionaries[locale];
}
