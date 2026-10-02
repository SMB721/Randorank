import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImportGpxForm from "@/components/dashboard/ImportGpxForm";
import { formatDate, formatDuration } from "@/lib/format";
import type { Hike } from "@/lib/supabase/types";
import { getT } from "@/lib/i18n/app/server";

export default async function RandosPage() {
  const tr = await getT();
  const { t } = tr;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const hikesQuery = supabase
    .from("hikes")
    .select(
      "id, name, source, distance_km, elevation_gain_m, duration_seconds, avg_speed_kmh, started_at, is_valid, validation_notes, created_at, user_id"
    )
    .order("created_at", { ascending: false });
  const { data: hikes } = await hikesQuery.returns<Hike[]>();

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-semibold text-summit-600 hover:underline">
          {t("randos.back")}
        </Link>

        <h1 className="mt-4 font-display text-4xl tracking-wide text-trail-900">
          {t("randos.title")}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <p className="text-trail-600">{t("randos.subtitle")}</p>
        </div>

        <Link
          href="/dashboard/randos/live"
          className="mt-8 flex items-center justify-between rounded-2xl bg-trail-900 p-6 text-white shadow-lg shadow-trail-900/20 transition hover:bg-trail-800"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-summit-400">
              {t("randos.live.eyebrow")}
            </p>
            <p className="mt-1 font-display text-2xl tracking-wide">
              {t("randos.live.title")}
            </p>
            <p className="mt-1 text-sm text-white/60">{t("randos.live.text")}</p>
          </div>
          <span className="font-display text-3xl text-summit-400" aria-hidden="true">
            →
          </span>
        </Link>

        <details className="mt-4 rounded-2xl border border-trail-200 bg-white p-6">
          <summary className="cursor-pointer font-display text-xl tracking-wide text-trail-900">
            {t("randos.import.summary")}
          </summary>
              <p className="mt-2 text-sm text-trail-500">{t("randos.import.text")}</p>
              <div className="mt-4">
                <ImportGpxForm />
              </div>
        </details>

        <div className="mt-8 space-y-3">
          {!hikes || hikes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-trail-300 bg-white p-6 text-center text-sm text-trail-500">
              {t("randos.empty")}
            </p>
          ) : (
            hikes.map((hike) => (
              <Link
                key={hike.id}
                href={`/dashboard/randos/${hike.id}`}
                className="flex items-center justify-between rounded-2xl border border-trail-200 bg-white p-5 transition hover:border-summit-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-xl tracking-wide text-trail-900">
                      {hike.name}
                    </p>
                    <span className="rounded-full bg-trail-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-trail-500">
                      {hike.source === "live_recording" ? t("randos.source.live") : t("randos.source.import")}
                    </span>
                  </div>
                  <p className="text-sm text-trail-500">{formatDate(hike.started_at, tr)}</p>
                  {!hike.is_valid && (
                    <p className="mt-1 text-xs font-medium text-amber-700">
                      {t("randos.invalid")}
                    </p>
                  )}
                </div>
                <div className="flex gap-4 text-right text-sm text-trail-600">
                  <div>
                    <p className="font-display text-lg text-trail-900">{hike.distance_km} km</p>
                    <p className="text-xs text-trail-400">{t("randos.unit.distance")}</p>
                  </div>
                  <div>
                    <p className="font-display text-lg text-trail-900">
                      {hike.elevation_gain_m} m
                    </p>
                    <p className="text-xs text-trail-400">{t("randos.unit.elevation")}</p>
                  </div>
                  <div>
                    <p className="font-display text-lg text-trail-900">
                      {formatDuration(hike.duration_seconds)}
                    </p>
                    <p className="text-xs text-trail-400">{t("randos.unit.duration")}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
