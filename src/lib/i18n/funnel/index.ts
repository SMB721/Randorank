import type { Locale } from "../config";
import type { FunnelDict } from "./types";
import { fr } from "./fr";
import { en } from "./en";
import { it } from "./it";
import { es } from "./es";
import { de } from "./de";

export type { FunnelDict } from "./types";

const dictionaries: Record<Locale, FunnelDict> = { fr, en, it, es, de };

export function getFunnelDict(locale: Locale): FunnelDict {
  return dictionaries[locale];
}

/** Replaces "{key}" placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
