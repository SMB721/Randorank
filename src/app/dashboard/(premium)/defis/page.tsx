import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { createClient } from "@/lib/supabase/server";
import type { Challenge, ChallengeProgressRow } from "@/lib/supabase/types";

const TOP_N = 5;

function formatProgress(metric: Challenge["metric"], value: number): string {
  switch (metric) {
    case "hike_count":
      return `${value} sortie${value > 1 ? "s" : ""}`;
    case "distance_km_sum":
      return `${value} km`;
    case "elevation_gain_m_sum":
    case "elevation_gain_m_max":
      return `${value} m de D+`;
  }
}

export default async function DefisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: challenges }, { data: progress }] = await Promise.all([
    supabase
      .from("challenges")
      .select("*")
      .lte("period_start", today)
      .gte("period_end", today)
      .order("created_at", { ascending: true })
      .returns<Challenge[]>(),
    supabase.from("challenge_progress").select("*").returns<ChallengeProgressRow[]>(),
  ]);

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-6">
      <DashboardHeader />

      <div className="mx-auto mt-10 max-w-3xl">
        <h1 className="font-display text-4xl tracking-wide text-trail-900">Défis du mois</h1>
        <p className="mt-1 text-trail-600">
          Chaque rando validée compte. Les trichés, non.
        </p>

        {!challenges || challenges.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-trail-300 bg-white p-6 text-center text-sm text-trail-500">
            Pas de défi actif pour le moment — revenez bientôt.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            {challenges.map((challenge) => {
              const rows = (progress ?? [])
                .filter((r) => r.challenge_id === challenge.id)
                .sort((a, b) => a.rank - b.rank);
              const top = rows.slice(0, TOP_N);
              const me = rows.find((r) => r.user_id === user!.id);
              const meInTop = top.some((r) => r.user_id === user!.id);
              const percent = me
                ? Math.min(100, Math.round((me.progress / challenge.threshold) * 100))
                : 0;

              return (
                <div key={challenge.id} className="rounded-2xl border border-trail-200 bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-summit-100 text-2xl">
                      {challenge.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-xl tracking-wide text-trail-900">
                        {challenge.name}
                      </p>
                      <p className="mt-1 text-sm text-trail-600">{challenge.description}</p>
                    </div>
                  </div>

                  {me && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-trail-500">
                        <span>
                          Vous : {formatProgress(challenge.metric, me.progress)} sur{" "}
                          {formatProgress(challenge.metric, challenge.threshold)}
                        </span>
                        <span>#{me.rank}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-trail-100">
                        <div
                          className="h-full rounded-full bg-summit-500 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {top.length === 0 ? (
                    <p className="mt-4 text-xs text-trail-400">
                      Personne n&apos;a encore de progression sur ce défi — soyez le premier.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-1.5">
                      {top.map((row) => (
                        <div
                          key={row.user_id}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                            row.user_id === user!.id ? "bg-summit-50" : ""
                          }`}
                        >
                          <span className="flex items-center gap-2 text-trail-700">
                            <span className="w-5 text-right font-display text-trail-400">
                              {row.rank}
                            </span>
                            {row.username || "Randonneur anonyme"}
                          </span>
                          <span className="font-semibold text-trail-900">
                            {formatProgress(challenge.metric, row.progress)}
                          </span>
                        </div>
                      ))}
                      {me && !meInTop && (
                        <p className="pt-1 text-center text-xs text-trail-400">
                          Vous n&apos;êtes pas dans le top {TOP_N} — continuez.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
