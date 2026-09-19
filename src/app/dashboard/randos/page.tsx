import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ImportGpxForm from "@/components/dashboard/ImportGpxForm";
import QuotaPaywall from "@/components/dashboard/QuotaPaywall";
import { getHikeQuotaStatus } from "@/lib/quota";
import { formatDate, formatDuration } from "@/lib/format";
import type { Hike, SubscriptionTier } from "@/lib/supabase/types";

export default async function RandosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single<{ subscription_tier: SubscriptionTier }>();

  const quota = await getHikeQuotaStatus(
    supabase,
    user.id,
    profile?.subscription_tier ?? "freemium"
  );

  const { data: hikes } = await supabase
    .from("hikes")
    .select(
      "id, name, source, distance_km, elevation_gain_m, duration_seconds, avg_speed_kmh, started_at, is_valid, validation_notes, created_at, user_id"
    )
    .order("created_at", { ascending: false })
    .returns<Hike[]>();

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-semibold text-summit-600 hover:underline">
          ← Dashboard
        </Link>

        <h1 className="mt-4 font-display text-4xl tracking-wide text-trail-900">
          Mes randos
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <p className="text-trail-600">
            Enregistre ta sortie en direct, ou importe une trace existante.
          </p>
          {quota.isLimited && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                quota.quotaExceeded
                  ? "bg-red-50 text-red-700"
                  : "bg-summit-50 text-summit-700"
              }`}
            >
              {quota.quotaExceeded
                ? "Quota Freemium atteint cette semaine"
                : `${quota.remaining}/${quota.limit} rando Freemium restante cette semaine`}
            </span>
          )}
        </div>

        {quota.quotaExceeded ? (
          <div className="mt-8">
            <QuotaPaywall limit={quota.limit} />
          </div>
        ) : (
          <Link
            href="/dashboard/randos/live"
            className="mt-8 flex items-center justify-between rounded-2xl bg-trail-900 p-6 text-white shadow-lg shadow-trail-900/20 transition hover:bg-trail-800"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-summit-400">
                GPS en direct
              </p>
              <p className="mt-1 font-display text-2xl tracking-wide">
                Démarrer ma rando
              </p>
              <p className="mt-1 text-sm text-white/60">
                RandoRank suit ta position pendant que tu marches.
              </p>
            </div>
            <span className="font-display text-3xl text-summit-400" aria-hidden="true">
              →
            </span>
          </Link>
        )}

        <details className="mt-4 rounded-2xl border border-trail-200 bg-white p-6">
          <summary className="cursor-pointer font-display text-xl tracking-wide text-trail-900">
            Tu as déjà une trace GPS ?
          </summary>
          {quota.quotaExceeded ? (
            <p className="mt-2 text-sm text-trail-500">
              L&apos;import est aussi soumis au quota hebdomadaire Freemium — passe
              Premium ou VIP pour importer sans limite.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-trail-500">
                Montre connectée, autre appli... importe le fichier .gpx exporté (5
                Mo max).
              </p>
              <div className="mt-4">
                <ImportGpxForm />
              </div>
            </>
          )}
        </details>

        <div className="mt-8 space-y-3">
          {!hikes || hikes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-trail-300 bg-white p-6 text-center text-sm text-trail-500">
              Aucune rando pour l&apos;instant — lance ton premier enregistrement
              ci-dessus.
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
                      {hike.source === "live_recording" ? "GPS direct" : "Import"}
                    </span>
                  </div>
                  <p className="text-sm text-trail-500">{formatDate(hike.started_at)}</p>
                  {!hike.is_valid && (
                    <p className="mt-1 text-xs font-medium text-amber-700">
                      ⚠ Non comptabilisée — anomalie détectée
                    </p>
                  )}
                </div>
                <div className="flex gap-4 text-right text-sm text-trail-600">
                  <div>
                    <p className="font-display text-lg text-trail-900">{hike.distance_km} km</p>
                    <p className="text-xs text-trail-400">distance</p>
                  </div>
                  <div>
                    <p className="font-display text-lg text-trail-900">
                      {hike.elevation_gain_m} m
                    </p>
                    <p className="text-xs text-trail-400">D+</p>
                  </div>
                  <div>
                    <p className="font-display text-lg text-trail-900">
                      {formatDuration(hike.duration_seconds)}
                    </p>
                    <p className="text-xs text-trail-400">durée</p>
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
