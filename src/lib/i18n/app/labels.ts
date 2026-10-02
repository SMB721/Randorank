import type { DictKey, Translator } from "./core";
import type { UserLevel } from "@/lib/supabase/types";

// Fixed lookup tables, not template literals: asserting a computed string to
// the 336-member DictKey union makes the type checker crawl.
const LEVEL_KEYS: Record<UserLevel, DictKey> = {
  debutant: "level.debutant",
  amateur: "level.amateur",
  avance: "level.avance",
};

/** Dictionary key of a user level's label. */
export const levelKey = (level: UserLevel): DictKey => LEVEL_KEYS[level];

const SUBSCRIPTION_KEYS: Record<"freemium" | "premium" | "vip", DictKey> = {
  freemium: "sub.freemium",
  premium: "sub.premium",
  vip: "sub.vip",
};

export const subscriptionKey = (tier: "freemium" | "premium" | "vip"): DictKey =>
  SUBSCRIPTION_KEYS[tier];

type TextSource = { code: string; name: string; description: string };
type Lookup = Pick<Translator, "t" | "exists">;

// Badges and challenges live in the database in French, keyed by a stable
// code. The dictionaries translate the known codes; a code added later (and
// not yet translated) falls back to the database text instead of breaking.
function dbText(
  tr: Lookup,
  kind: "badge" | "challenge",
  item: TextSource,
  field: "name" | "desc"
): string {
  const key: string = kind + "." + item.code + "." + field;
  if (!tr.exists(key)) return field === "name" ? item.name : item.description;
  return tr.t(key as unknown as DictKey);
}

export const badgeName = (tr: Lookup, b: TextSource) => dbText(tr, "badge", b, "name");
export const badgeDescription = (tr: Lookup, b: TextSource) => dbText(tr, "badge", b, "desc");
export const challengeName = (tr: Lookup, c: TextSource) => dbText(tr, "challenge", c, "name");
export const challengeDescription = (tr: Lookup, c: TextSource) =>
  dbText(tr, "challenge", c, "desc");
