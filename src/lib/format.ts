export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "—";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

export function formatDate(isoDate: string | null): string {
  if (!isoDate) return "Date inconnue";
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
