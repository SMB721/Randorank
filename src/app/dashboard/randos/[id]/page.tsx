import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HikeMapLoader from "@/components/dashboard/HikeMapLoader";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import PhotoUploadForm from "@/components/dashboard/PhotoUploadForm";
import PhotoGallery, { type GalleryPhoto } from "@/components/dashboard/PhotoGallery";
import { getPhotoQuotaStatus } from "@/lib/quota";
import { formatDate, formatDuration } from "@/lib/format";
import type { HikeWithTrack, Photo, SubscriptionTier } from "@/lib/supabase/types";

export default async function HikeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const { data: hike } = await supabase
    .from("hikes_geojson")
    .select("*")
    .eq("id", id)
    .single<HikeWithTrack>();

  if (!hike) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single<{ subscription_tier: SubscriptionTier }>();

  const photoQuota = await getPhotoQuotaStatus(
    supabase,
    hike.id,
    profile?.subscription_tier ?? "freemium"
  );

  const { data: photoRows } = await supabase
    .from("photos")
    .select("id, storage_path, lat, lon")
    .eq("hike_id", hike.id)
    .order("created_at", { ascending: true })
    .returns<Pick<Photo, "id" | "storage_path" | "lat" | "lon">[]>();

  const photos: GalleryPhoto[] = [];
  for (const row of photoRows ?? []) {
    const { data: signed } = await supabase.storage
      .from("photos")
      .createSignedUrl(row.storage_path, 3600);
    if (signed?.signedUrl) {
      photos.push({ id: row.id, url: signed.signedUrl, hasGps: row.lat !== null });
    }
  }

  const stats = [
    { label: "Distance", value: hike.distance_km, decimals: 2, suffix: " km" },
    { label: "Dénivelé positif", value: hike.elevation_gain_m, decimals: 0, suffix: " m" },
    { label: "Durée", value: null, display: formatDuration(hike.duration_seconds) },
    { label: "Vitesse moyenne", value: hike.avg_speed_kmh, decimals: 1, suffix: " km/h" },
  ];

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/randos"
          className="text-sm font-semibold text-summit-600 hover:underline"
        >
          ← Mes randos
        </Link>

        <h1 className="mt-4 font-display text-4xl tracking-wide text-trail-900">
          {hike.name}
        </h1>
        <p className="mt-1 text-trail-600">{formatDate(hike.started_at)}</p>

        {!hike.is_valid && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⚠ Cette rando n&apos;est pas comptabilisée dans tes stats : {hike.validation_notes}
          </div>
        )}

        <div className="mt-6 h-80 overflow-hidden rounded-2xl border border-trail-200">
          <HikeMapLoader coordinates={hike.track_geojson.coordinates} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="animate-fade-in-up rounded-2xl border border-trail-200 bg-white p-4 text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="font-display text-2xl tracking-wide text-trail-900">
                {stat.value === null ? (
                  stat.display
                ) : (
                  <AnimatedNumber value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                )}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-trail-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href={`/dashboard/randos/${hike.id}/partage`}
            target="_blank"
            className="rounded-xl bg-trail-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-trail-800"
          >
            Générer l&apos;image de partage →
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-trail-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl tracking-wide text-trail-900">Photos</h2>
            {photoQuota.isLimited && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  photoQuota.quotaExceeded
                    ? "bg-red-50 text-red-700"
                    : "bg-summit-50 text-summit-700"
                }`}
              >
                {photoQuota.used}/{photoQuota.limit} (Freemium)
              </span>
            )}
          </div>

          <div className="mt-4">
            <PhotoGallery photos={photos} />
          </div>

          <div className="mt-6">
            {photoQuota.quotaExceeded ? (
              <p className="rounded-xl border border-summit-200 bg-summit-50 px-4 py-3 text-sm text-summit-800">
                Limite de {photoQuota.limit} photos atteinte pour cette rando.{" "}
                <Link href="/#offres" className="font-semibold underline">
                  Passe Premium ou VIP
                </Link>{" "}
                pour des photos illimitées.
              </p>
            ) : (
              <PhotoUploadForm hikeId={hike.id} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
