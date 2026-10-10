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

/** Pace as "m:ss" from minutes per km (16.67 -> "16:40"). */
export function formatPace(minPerKm: number): string {
  const whole = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - whole) * 60);
  return seconds === 60 ? `${whole + 1}:00` : `${whole}:${String(seconds).padStart(2, "0")}`;
}
