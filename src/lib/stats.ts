// Advanced statistics over a user's hikes. Pure functions on plain data (no
// database, no i18n) so the maths stays easy to test. Only hikes that passed
// the anti-cheat checks (is_valid) are counted, same as the leaderboard.

export type StatsHike = {
  id: string;
  name: string;
  distanceKm: number;
  elevationGainM: number;
  durationSeconds: number;
  avgSpeedKmh: number;
  /** ISO date of the hike (started_at, else the import date). */
  date: string;
};

export type RecordEntry = { id: string; name: string; value: number };

export type MonthStat = {
  /** "2026-03" — UTC month. */
  key: string;
  km: number;
  elevationM: number;
  hikes: number;
};

export type AdvancedStats = {
  totals: { hikes: number; km: number; elevationM: number; seconds: number };
  averages: {
    kmPerHike: number;
    elevationPerHike: number;
    /** Distance over moving time across hikes with a known duration; null if none. */
    speedKmh: number | null;
    /** Minutes per km at that speed; null if unknown. */
    paceMinPerKm: number | null;
  };
  records: {
    longest: RecordEntry | null;
    biggestClimb: RecordEntry | null;
    /** Fastest average speed among hikes of at least MIN_KM_FOR_SPEED_RECORD. */
    fastest: RecordEntry | null;
    longestDuration: RecordEntry | null;
  };
  /** Last `monthsBack` months ending with the current one, oldest first. */
  months: MonthStat[];
  /** Change in km of the current month against the previous one; null if no previous km. */
  monthDeltaPct: number | null;
  streak: { currentWeeks: number; bestWeeks: number };
  /** 0 = Sunday … 6 = Saturday (JS getUTCDay); null with no hikes. */
  favoriteWeekday: { day: number; count: number } | null;
};

export const MIN_KM_FOR_SPEED_RECORD = 3;
const WEEK_MS = 7 * 24 * 3600 * 1000;

const monthKey = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

// Monday 00:00 UTC of the week containing `d`, as a week index.
function weekIndex(d: Date): number {
  const dayStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const mondayOffset = (d.getUTCDay() + 6) % 7;
  return Math.floor((dayStart - mondayOffset * 24 * 3600 * 1000) / WEEK_MS);
}

function best(
  hikes: StatsHike[],
  value: (h: StatsHike) => number,
  eligible: (h: StatsHike) => boolean = () => true
): RecordEntry | null {
  let top: StatsHike | null = null;
  for (const h of hikes) {
    if (!eligible(h)) continue;
    if (top === null || value(h) > value(top)) top = h;
  }
  return top && value(top) > 0 ? { id: top.id, name: top.name, value: value(top) } : null;
}

export function computeAdvancedStats(
  hikes: StatsHike[],
  now: Date = new Date(),
  monthsBack = 12
): AdvancedStats {
  const km = hikes.reduce((s, h) => s + h.distanceKm, 0);
  const elevationM = hikes.reduce((s, h) => s + h.elevationGainM, 0);
  const seconds = hikes.reduce((s, h) => s + h.durationSeconds, 0);

  const timed = hikes.filter((h) => h.durationSeconds > 0);
  const timedKm = timed.reduce((s, h) => s + h.distanceKm, 0);
  const timedHours = timed.reduce((s, h) => s + h.durationSeconds, 0) / 3600;
  const speedKmh = timedHours > 0 && timedKm > 0 ? timedKm / timedHours : null;

  // Months: a fixed window so empty months show as zero bars.
  const months: MonthStat[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({ key: monthKey(d), km: 0, elevationM: 0, hikes: 0 });
  }
  const byKey = new Map(months.map((m) => [m.key, m]));
  for (const h of hikes) {
    const m = byKey.get(monthKey(new Date(h.date)));
    if (!m) continue;
    m.km += h.distanceKm;
    m.elevationM += h.elevationGainM;
    m.hikes += 1;
  }
  for (const m of months) {
    m.km = Math.round(m.km * 10) / 10;
    m.elevationM = Math.round(m.elevationM);
  }
  const thisMonth = months[months.length - 1];
  const prevMonth = months[months.length - 2];
  const monthDeltaPct =
    prevMonth && prevMonth.km > 0
      ? Math.round(((thisMonth.km - prevMonth.km) / prevMonth.km) * 100)
      : null;

  // Streaks count consecutive calendar weeks with at least one hike. The
  // current streak stays alive through the present week even if nothing has
  // been logged yet, so it only breaks once a whole week has been missed.
  const weeks = [...new Set(hikes.map((h) => weekIndex(new Date(h.date))))].sort((a, b) => a - b);
  let bestWeeks = 0;
  let run = 0;
  for (let i = 0; i < weeks.length; i++) {
    run = i > 0 && weeks[i] === weeks[i - 1] + 1 ? run + 1 : 1;
    bestWeeks = Math.max(bestWeeks, run);
  }
  const thisWeek = weekIndex(now);
  const weekSet = new Set(weeks);
  let cursor = weekSet.has(thisWeek) ? thisWeek : thisWeek - 1;
  let currentWeeks = 0;
  while (weekSet.has(cursor)) {
    currentWeeks++;
    cursor--;
  }

  const dayCounts = new Array<number>(7).fill(0);
  for (const h of hikes) dayCounts[new Date(h.date).getUTCDay()]++;
  const topCount = Math.max(...dayCounts);
  const favoriteWeekday =
    hikes.length > 0 ? { day: dayCounts.indexOf(topCount), count: topCount } : null;

  return {
    totals: { hikes: hikes.length, km: Math.round(km * 10) / 10, elevationM: Math.round(elevationM), seconds },
    averages: {
      kmPerHike: hikes.length ? Math.round((km / hikes.length) * 10) / 10 : 0,
      elevationPerHike: hikes.length ? Math.round(elevationM / hikes.length) : 0,
      speedKmh: speedKmh === null ? null : Math.round(speedKmh * 10) / 10,
      paceMinPerKm: speedKmh === null ? null : 60 / speedKmh,
    },
    records: {
      longest: best(hikes, (h) => h.distanceKm),
      biggestClimb: best(hikes, (h) => h.elevationGainM),
      fastest: best(
        hikes,
        (h) => h.avgSpeedKmh,
        (h) => h.distanceKm >= MIN_KM_FOR_SPEED_RECORD
      ),
      longestDuration: best(hikes, (h) => h.durationSeconds),
    },
    months,
    monthDeltaPct,
    streak: { currentWeeks, bestWeeks },
    favoriteWeekday,
  };
}

/**
 * Fictional hikes used to preview the Premium stats (blurred) on free
 * accounts. Never the user's own data: the paywall is enforced on the server.
 */
export function sampleHikes(now: Date = new Date()): StatsHike[] {
  const names = ["Crêtes du Grand Veymont", "Boucle des lacs", "Sentier des douaniers", "Tour du Mont Ventoux"];
  const hikes: StatsHike[] = [];
  const add = (date: Date, km: number, elevation: number, speed: number) => {
    const i = hikes.length;
    hikes.push({
      id: `sample-${i}`,
      name: names[i % names.length],
      distanceKm: km,
      elevationGainM: elevation,
      durationSeconds: Math.round((km / speed) * 3600),
      avgSpeedKmh: speed,
      date: date.toISOString(),
    });
  };
  const day = (monthsBack: number, d: number) =>
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, d, 8));

  // A steady past: two hikes a month, growing a little over time.
  for (let m = 11; m >= 1; m--) {
    add(day(m, 6), 8 + ((m * 3) % 9), 250 + ((m * 90) % 400), 3.6 + (m % 3) * 0.2);
    add(day(m, 19), 10 + ((m * 5) % 8), 350 + ((m * 130) % 500), 3.8 + (m % 4) * 0.15);
  }
  // A strong current month, so the preview shows a gain over the last one.
  const DAY_MS = 24 * 3600 * 1000;
  add(new Date(now.getTime()), 18, 820, 4.2);
  add(new Date(now.getTime() - DAY_MS), 14, 560, 3.9);
  add(new Date(now.getTime() - 2 * DAY_MS), 12, 430, 3.7);
  return hikes;
}
