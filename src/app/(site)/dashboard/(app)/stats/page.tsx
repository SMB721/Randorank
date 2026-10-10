import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UpsellCard from "@/components/dashboard/UpsellCard";
import EnergyCards from "@/components/stats/EnergyCards";
import {
  HabitsCard,
  MonthlyChart,
  RecordsGrid,
  SampleOverlay,
  StatsTotals,
} from "@/components/stats/StatsSections";
import { createClient } from "@/lib/supabase/server";
import { hasAdvancedStats } from "@/lib/gating";
import { computeAdvancedStats, sampleHikes, type StatsHike } from "@/lib/stats";
import { getT } from "@/lib/i18n/app/server";
import type { SubscriptionTier } from "@/lib/supabase/types";

type HikeRow = {
  id: string;
  name: string;
  distance_km: number;
  elevation_gain_m: number;
  duration_seconds: number;
  avg_speed_kmh: number;
  started_at: string | null;
  created_at: string;
};

export default async function StatsPage() {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  const [{ data: profile }, { data: rows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single<{ subscription_tier: SubscriptionTier }>(),
    supabase
      .from("hikes")
      .select("id, name, distance_km, elevation_gain_m, duration_seconds, avg_speed_kmh, started_at, created_at")
      .eq("is_valid", true)
      .returns<HikeRow[]>(),
  ]);

  const premium = hasAdvancedStats(profile?.subscription_tier ?? "freemium");

  const hikes: StatsHike[] = (rows ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    distanceKm: Number(r.distance_km),
    elevationGainM: Number(r.elevation_gain_m),
    durationSeconds: r.duration_seconds,
    avgSpeedKmh: Number(r.avg_speed_kmh),
    date: r.started_at ?? r.created_at,
  }));

  const stats = computeAdvancedStats(hikes);
  // Free accounts only ever receive the fictional sample for the Premium blocks.
  const sample = premium ? null : computeAdvancedStats(sampleHikes());
  const shown = sample ?? stats;

  const body = (
    <div className="space-y-4">
      <MonthlyChart stats={shown} />
      <div className="grid gap-4 md:grid-cols-2">
        <RecordsGrid stats={shown} />
        <HabitsCard stats={shown} />
      </div>
      <EnergyCards distanceKm={shown.totals.km} elevationGainM={shown.totals.elevationM} />
    </div>
  );

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-6">
      <DashboardHeader />

      <div className="mx-auto mt-10 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
          {t("stats.eyebrow")}
        </span>
        <h1 className="mt-1 font-display text-4xl tracking-wide text-trail-900">{t("stats.title")}</h1>
        <p className="mt-1 text-trail-600">{t("stats.subtitle")}</p>

        <div className="mt-6">
          <StatsTotals stats={stats} />
        </div>

        {stats.totals.hikes === 0 && premium ? (
          <p className="mt-6 rounded-2xl border border-dashed border-trail-300 bg-white p-6 text-center text-sm text-trail-500">
            {t("stats.empty")}{" "}
            <Link href="/dashboard/randos" className="font-semibold text-summit-600 hover:underline">
              {t("stats.emptyCta")}
            </Link>
          </p>
        ) : premium ? (
          <div className="mt-6">{body}</div>
        ) : (
          <>
            <div className="mt-6">
              <UpsellCard
                icon="📊"
                title={t("stats.locked.title")}
                text={t("stats.locked.text")}
                cta={t("stats.locked.cta")}
                href="/bienvenue/paywall"
              />
            </div>
            <div className="mt-6">
              <SampleOverlay>{body}</SampleOverlay>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
