import UpsellCard from "@/components/dashboard/UpsellCard";
import ElevationProfile from "@/components/dashboard/ElevationProfile";
import EnergyCards from "@/components/stats/EnergyCards";
import { sampleCoordinates } from "@/lib/elevationProfile";
import { formatPace } from "@/lib/format";
import { getT } from "@/lib/i18n/app/server";
import type { HikeWithTrack } from "@/lib/supabase/types";

// Premium analysis block on a hike's page: altitude profile, pace, average
// slope, energy. Free accounts get a pitch instead — and no data is sent for
// it, the gate is applied before anything is computed.
export default async function HikeInsights({
  hike,
  premium,
}: {
  hike: HikeWithTrack;
  premium: boolean;
}) {
  const { t, locale } = await getT();

  if (!premium) {
    return (
      <UpsellCard
        icon="📈"
        title={t("stats.hike.locked.title")}
        text={t("stats.hike.locked.text")}
        cta={t("stats.locked.cta")}
        href="/bienvenue/paywall"
      />
    );
  }

  const profile = hike.elevation_profile ?? null;
  const coordinates = profile ? sampleCoordinates(hike.track_geojson.coordinates, profile.length) : [];
  const hasProfile = profile !== null && coordinates.length === profile.length;

  const distanceKm = Number(hike.distance_km);
  const elevationGainM = Number(hike.elevation_gain_m);
  const pace =
    hike.duration_seconds > 0 && distanceKm > 0 ? hike.duration_seconds / 60 / distanceKm : null;
  const slope = distanceKm > 0 ? (elevationGainM / (distanceKm * 1000)) * 100 : 0;
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  const tiles = [
    { label: t("stats.hike.pace"), value: pace === null ? "—" : `${formatPace(pace)} /km` },
    { label: t("stats.hike.slope"), value: `${number.format(slope)} %` },
    ...(hasProfile
      ? [
          { label: t("stats.hike.highest"), value: `${Math.max(...profile)} m` },
          { label: t("stats.hike.lowest"), value: `${Math.min(...profile)} m` },
        ]
      : []),
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-trail-200 bg-white p-6">
      <h2 className="font-display text-2xl tracking-wide text-trail-900">{t("stats.hike.title")}</h2>

      {hasProfile ? (
        <ElevationProfile coordinates={coordinates} elevations={profile} />
      ) : (
        <p className="rounded-xl bg-trail-50 px-4 py-3 text-sm text-trail-500">
          {t("stats.hike.noProfile")}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-trail-50 p-3">
            <p className="font-display text-xl text-trail-900">{tile.value}</p>
            <p className="text-xs uppercase tracking-widest text-trail-500">{tile.label}</p>
          </div>
        ))}
      </div>

      <EnergyCards distanceKm={distanceKm} elevationGainM={elevationGainM} />
    </div>
  );
}
