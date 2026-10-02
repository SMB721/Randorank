import type { Translator } from "@/lib/i18n/app";

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "—";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

/** Long date in the user's language ("12 juin 2026" / "June 12, 2026"). */
export function formatDate(isoDate: string | null, tr: Pick<Translator, "t" | "locale">): string {
  if (!isoDate) return tr.t("common.unknownDate");
  return new Date(isoDate).toLocaleDateString(tr.locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
