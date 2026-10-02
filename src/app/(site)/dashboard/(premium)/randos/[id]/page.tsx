import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HikeMapLoader from "@/components/dashboard/HikeMapLoader";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import PhotoUploadForm from "@/components/dashboard/PhotoUploadForm";
import PhotoGallery, { type GalleryPhoto } from "@/components/dashboard/PhotoGallery";
import { formatDate, formatDuration } from "@/lib/format";
import { formatValidationNotes } from "@/lib/gpx";
import { getT } from "@/lib/i18n/app/server";
import type { HikeWithTrack, Photo, SubscriptionTier } from "@/lib/supabase/types";

export default async function HikeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tr = await getT();
  const { t } = tr;
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
    .select("subscription_tier, blur_endpoints")
    .eq("id", user.id)
    .single<{ subscription_tier: SubscriptionTier; blur_endpoints: boolean }>();

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
    { label: t("hike.stat.distance"), value: hike.distance_km, decimals: 2, suffix: " km" },
    { label: t("hike.stat.elevation"), value: hike.elevation_gain_m, decimals: 0, suffix: " m" },
    { label: t("hike.stat.duration"), value: null, display: formatDuration(hike.duration_seconds) },
    { label: t("hike.stat.speed"), value: hike.avg_speed_kmh, decimals: 1, suffix: " km/h" },
  ];

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/randos"
          className="text-sm font-semibold text-summit-600 hover:underline"
        >
          {t("hike.back")}
        </Link>

        <h1 className="mt-4 font-display text-4xl tracking-wide text-trail-900">
          {hike.name}
        </h1>
        <p className="mt-1 text-trail-600">{formatDate(hike.started_at, tr)}</p>

        {!hike.is_valid && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t("hike.invalid", { notes: formatValidationNotes(hike.validation_notes, tr) ?? "" })}
          </div>
        )}

        <div className="mt-6 h-80 overflow-hidden rounded-2xl border border-trail-200">
          <HikeMapLoader
            coordinates={hike.track_geojson.coordinates}
            blurred={profile?.blur_endpoints ?? false}
          />
        </div>
        {profile?.blur_endpoints && (
          <p className="mt-2 text-xs text-trail-400">
            {t("hike.blurBefore")}{" "}
            <Link href="/dashboard/profil" className="underline hover:text-trail-600">
              {t("hike.blurLink")}
            </Link>
            {t("hike.blurAfter")}
          </p>
        )}

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
            {t("hike.share")}
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-trail-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl tracking-wide text-trail-900">{t("hike.photos")}</h2>
          </div>

          <div className="mt-4">
            <PhotoGallery photos={photos} />
          </div>

          <div className="mt-6">
<PhotoUploadForm hikeId={hike.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
