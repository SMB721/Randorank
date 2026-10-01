import type { Locale } from "../config";
import type { LandingDict } from "./types";
import { fr } from "./fr";
import { en } from "./en";
import { it } from "./it";
import { es } from "./es";
import { de } from "./de";

export type { LandingDict } from "./types";

const dictionaries: Record<Locale, LandingDict> = { fr, en, it, es, de };

export function getLandingDict(locale: Locale): LandingDict {
  return dictionaries[locale];
}
