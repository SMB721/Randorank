// Kinds of message accepted by the suggestion bag. Stored values match the
// CHECK constraint in 0027; labels live in the i18n files.
export const SUGGESTION_KINDS = ["idea", "problem", "love"] as const;

export type SuggestionKind = (typeof SUGGESTION_KINDS)[number];

export function isSuggestionKind(value: unknown): value is SuggestionKind {
  return typeof value === "string" && (SUGGESTION_KINDS as readonly string[]).includes(value);
}

export const SUGGESTION_MIN = 3;
export const SUGGESTION_MAX = 1000;
export const SUGGESTIONS_PER_DAY = 5;
