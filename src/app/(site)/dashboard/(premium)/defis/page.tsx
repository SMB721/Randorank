import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { createClient } from "@/lib/supabase/server";
import type { Challenge, ChallengeProgressRow } from "@/lib/supabase/types";
import type { Translator } from "@/lib/i18n/app";
import { getT } from "@/lib/i18n/app/server";
import { challengeDescription, challengeName } from "@/lib/i18n/app/labels";

const TOP_N = 5;

function formatProgress(metric: Challenge["metric"], value: number, tr: Translator): string {
  switch (metric) {
    case "hike_count":
      return tr.tn("defis.unit.hikes", value);
    case "distance_km_sum":
      return tr.t("defis.unit.distance", { n: value });
    case "elevation_gain_m_sum":
    case "elevation_gain_m_max":
      return tr.t("defis.unit.elevation", { n: value });
  }
}

export default async function DefisPage() {
  const tr = await getT();
  const { t } = tr;
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
        <h1 className="font-display text-4xl tracking-wide text-trail-900">{t("defis.title")}</h1>
        <p className="mt-1 text-trail-600">{t("defis.subtitle")}</p>

        {!challenges || challenges.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-trail-300 bg-white p-6 text-center text-sm text-trail-500">
            {t("defis.none")}
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
                        {challengeName(tr, challenge)}
                      </p>
                      <p className="mt-1 text-sm text-trail-600">{challengeDescription(tr, challenge)}</p>
                    </div>
                  </div>

                  {me && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-trail-500">
                        <span>
                          {t("defis.you", {
                            progress: formatProgress(challenge.metric, me.progress, tr),
                            goal: formatProgress(challenge.metric, challenge.threshold, tr),
                          })}
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
                      {t("defis.noProgress")}
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
                            {row.username || t("rank.anonymous")}
                          </span>
                          <span className="font-semibold text-trail-900">
                            {formatProgress(challenge.metric, row.progress, tr)}
                          </span>
                        </div>
                      ))}
                      {me && !meInTop && (
                        <p className="pt-1 text-center text-xs text-trail-400">
                          {t("defis.notTop", { n: TOP_N })}
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
