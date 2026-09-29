// Month/day comparison only — the year is irrelevant for "is it their
// birthday today", and comparing full dates would only ever match once.
export function isBirthdayToday(birthDate: string | null, today: Date = new Date()): boolean {
  if (!birthDate) return false;
  const birth = new Date(birthDate);
  return birth.getUTCMonth() === today.getMonth() && birth.getUTCDate() === today.getDate();
}

export function computeAge(birthDate: string | null, today: Date = new Date()): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getUTCFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getUTCMonth() ||
    (today.getMonth() === birth.getUTCMonth() && today.getDate() >= birth.getUTCDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}
