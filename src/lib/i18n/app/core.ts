import type { Locale } from "../config";
import type { fr } from "./fr";

// French is the source of truth: its keys define what every locale must
// provide, so a missing translation is a compile error rather than a blank.
export type DictKey = keyof typeof fr;
export type Dict = Record<DictKey, string>;

export type Vars = Record<string, string | number>;

export type Translator = {
  locale: Locale;
  /** Looks up a string, replacing "{name}" placeholders. */
  t: (key: DictKey, vars?: Vars) => string;
  /** True when the dictionary has this key (for DB-driven codes). */
  exists: (key: string) => boolean;
  /**
   * Picks "<base>_one" or "<base>_other" for n; "{n}" is filled in. `base`
   * is a plain string on purpose: typing it as the union of plural bases
   * derived from the 336 keys makes the type checker take many minutes.
   * scripts/check-i18n.mjs verifies every used base has both variants.
   */
  tn: (base: string, n: number, vars?: Vars) => string;
};

function fill(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export function createTranslator(locale: Locale, dict: Dict): Translator {
  const rules = new Intl.PluralRules(locale);
  return {
    locale,
    t: (key, vars) => fill(dict[key] ?? key, vars),
    exists: (key) => key in dict,
    tn: (base, n, vars) => {
      const cat = rules.select(n) === "one" ? "one" : "other";
      const key = `${base}_${cat}` as unknown as DictKey;
      return fill(dict[key] ?? key, { n, ...vars });
    },
  };
}
