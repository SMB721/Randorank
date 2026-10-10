import Link from "next/link";
import { getT } from "@/lib/i18n/app/server";
import { formatDuration, formatPace } from "@/lib/format";
import type { AdvancedStats, RecordEntry } from "@/lib/stats";

const card = "rounded-2xl border border-trail-200 bg-white p-5";
const sectionTitle = "font-display text-xl tracking-wide text-trail-900";

export async function StatsTotals({ stats }: { stats: AdvancedStats }) {
  const { t, locale } = await getT();
  const number = new Intl.NumberFormat(locale);
  const tiles = [
    { label: t("stats.totals.hikes"), value: number.format(stats.totals.hikes) },
    { label: t("stats.totals.distance"), value: `${number.format(stats.totals.km)} km` },
    { label: t("stats.totals.elevation"), value: `${number.format(stats.totals.elevationM)} m` },
    { label: t("stats.totals.time"), value: formatDuration(stats.totals.seconds) },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-2xl border border-trail-200 bg-white p-4 text-center">
          <p className="font-display text-2xl tracking-wide text-trail-900">{tile.value}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-trail-500">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}

const CHART_W = 600;
const CHART_H = 170;
const CHART_PAD = { top: 22, bottom: 24, side: 6 };

export async function MonthlyChart({ stats }: { stats: AdvancedStats }) {
  const { t, locale } = await getT();
  const max = Math.max(1, ...stats.months.map((m) => m.km));
  const slot = (CHART_W - CHART_PAD.side * 2) / stats.months.length;
  const barW = slot * 0.62;
  const plotH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
  const delta = stats.monthDeltaPct;

  return (
    <div className={card}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={sectionTitle}>{t("stats.month.title")}</h3>
        {delta !== null && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              delta >= 0 ? "bg-summit-100 text-summit-700" : "bg-trail-100 text-trail-600"
            }`}
          >
            {delta === 0
              ? t("stats.month.same")
              : delta > 0
                ? t("stats.month.up", { pct: delta })
                : t("stats.month.down", { pct: Math.abs(delta) })}
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        role="img"
        aria-label={t("stats.month.title")}
        className="mt-3 h-auto w-full"
      >
        {stats.months.map((m, i) => {
          const h = (m.km / max) * plotH;
          const x = CHART_PAD.side + i * slot + (slot - barW) / 2;
          const y = CHART_PAD.top + plotH - h;
          const current = i === stats.months.length - 1;
          const label = new Date(`${m.key}-01T00:00:00Z`).toLocaleDateString(locale, {
            month: "short",
            timeZone: "UTC",
          });
          return (
            <g key={m.key}>
              <rect
                x={x}
                y={m.km > 0 ? y : CHART_PAD.top + plotH - 2}
                width={barW}
                height={m.km > 0 ? Math.max(h, 2) : 2}
                rx="3"
                fill={current ? "#fd7310" : m.km > 0 ? "#b9c7b3" : "#e5ebe2"}
              />
              {m.km > 0 && (
                <text x={x + barW / 2} y={y - 5} fontSize="11" textAnchor="middle" fill="#4b5d46">
                  {Math.round(m.km)}
                </text>
              )}
              <text
                x={x + barW / 2}
                y={CHART_H - 7}
                fontSize="11"
                textAnchor="middle"
                fill={current ? "#fd7310" : "#8a9a85"}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-right text-xs text-trail-400">km</p>
    </div>
  );
}

function RecordRow({
  icon,
  label,
  value,
  entry,
}: {
  icon: string;
  label: string;
  value: string | null;
  entry: RecordEntry | null;
}) {
  const body = (
    <>
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-trail-500">{label}</p>
        <p className="truncate text-sm text-trail-600">{entry?.name ?? "—"}</p>
      </div>
      <p className="font-display text-xl tracking-wide text-trail-900">{value ?? "—"}</p>
    </>
  );
  const className = "flex items-center gap-3 rounded-xl px-3 py-2.5";
  // Sample entries (Premium preview) have no real page to open.
  return entry && !entry.id.startsWith("sample-") ? (
    <Link href={`/dashboard/randos/${entry.id}`} className={`${className} transition hover:bg-trail-50`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export async function RecordsGrid({ stats }: { stats: AdvancedStats }) {
  const { t, locale } = await getT();
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const r = stats.records;
  return (
    <div className={card}>
      <h3 className={sectionTitle}>{t("stats.records.title")}</h3>
      <div className="mt-2 divide-y divide-trail-100">
        <RecordRow
          icon="📏"
          label={t("stats.records.longest")}
          entry={r.longest}
          value={r.longest ? `${number.format(r.longest.value)} km` : null}
        />
        <RecordRow
          icon="🧗"
          label={t("stats.records.climb")}
          entry={r.biggestClimb}
          value={r.biggestClimb ? `${number.format(r.biggestClimb.value)} m` : null}
        />
        <RecordRow
          icon="⚡"
          label={t("stats.records.fastest")}
          entry={r.fastest}
          value={r.fastest ? `${number.format(r.fastest.value)} km/h` : null}
        />
        <RecordRow
          icon="⏱️"
          label={t("stats.records.duration")}
          entry={r.longestDuration}
          value={r.longestDuration ? formatDuration(r.longestDuration.value) : null}
        />
      </div>
    </div>
  );
}

export async function HabitsCard({ stats }: { stats: AdvancedStats }) {
  const { t, tn, locale } = await getT();
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  // 2024-01-07 was a Sunday, so day 0..6 maps straight onto it.
  const weekday = stats.favoriteWeekday
    ? new Date(Date.UTC(2024, 0, 7 + stats.favoriteWeekday.day)).toLocaleDateString(locale, {
        weekday: "long",
        timeZone: "UTC",
      })
    : null;

  const tiles = [
    {
      icon: "🔥",
      label: t("stats.habits.streak"),
      value: tn("stats.habits.weeks", stats.streak.currentWeeks),
      hint: t("stats.habits.bestStreak", { n: stats.streak.bestWeeks }),
    },
    {
      icon: "📅",
      label: t("stats.habits.favDay"),
      value: weekday ? weekday.charAt(0).toLocaleUpperCase(locale) + weekday.slice(1) : "—",
      hint: stats.favoriteWeekday ? tn("stats.habits.favDayCount", stats.favoriteWeekday.count) : "",
    },
    {
      icon: "🥾",
      label: t("stats.habits.avgDistance"),
      value: `${number.format(stats.averages.kmPerHike)} km`,
      hint: t("stats.habits.avgClimb", { n: stats.averages.elevationPerHike }),
    },
    {
      icon: "🚶",
      label: t("stats.habits.avgSpeed"),
      value: stats.averages.speedKmh === null ? "—" : `${number.format(stats.averages.speedKmh)} km/h`,
      hint:
        stats.averages.paceMinPerKm === null
          ? ""
          : t("stats.habits.pace", { pace: formatPace(stats.averages.paceMinPerKm) }),
    },
  ];

  return (
    <div className={card}>
      <h3 className={sectionTitle}>{t("stats.habits.title")}</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-trail-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-trail-500">
              <span aria-hidden="true">{tile.icon}</span> {tile.label}
            </p>
            <p className="mt-1 font-display text-2xl tracking-wide text-trail-900">{tile.value}</p>
            {tile.hint && <p className="text-xs text-trail-500">{tile.hint}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Premium preview for free accounts: the children are fed fictional data and
// rendered blurred and inert, so there is nothing real to dig out of the page.
export async function SampleOverlay({ children }: { children: React.ReactNode }) {
  const { t } = await getT();
  return (
    <div className="relative">
      <div aria-hidden="true" inert className="pointer-events-none select-none blur-[5px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center pt-6">
        <span className="rounded-full bg-trail-900/90 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
          🔒 {t("stats.sample")}
        </span>
      </div>
    </div>
  );
}
