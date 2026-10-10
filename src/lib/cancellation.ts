// Reasons offered in the cancellation survey. Stored values stay stable
// (they match the CHECK constraint in 0022); labels live in the i18n files.
export const CANCELLATION_REASONS = [
  "too_expensive",
  "not_using",
  "missing_features",
  "found_alternative",
  "technical_issues",
  "seasonal",
  "other",
] as const;

export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

export function isCancellationReason(value: unknown): value is CancellationReason {
  return (
    typeof value === "string" && (CANCELLATION_REASONS as readonly string[]).includes(value)
  );
}

export const CANCELLATION_COMMENT_MAX = 1000;
