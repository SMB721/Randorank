import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  USER_LEVEL_LABELS,
  type Badge,
  type UserBadge,
  type UserLevel,
} from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/server";

const LEVEL_ORDER: UserLevel[] = ["debutant", "amateur", "avance"];

function requirementLabel(badge: Badge): string {
  switch (badge.metric) {
    case "hike_count":
      return `${badge.threshold} sortie${badge.threshold > 1 ? "s" : ""}`;
    case "total_distance_km":
      return `${badge.threshold} km cumulés`;
    case "total_elevation_m":
      return `${badge.threshold} m de D+ cumulés`;
    case "user_level":
      return `Niveau ${USER_LEVEL_LABELS[LEVEL_ORDER[badge.threshold]]}`;
  }
}

export default async function BadgesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const [{ data: badges }, { data: earned }] = await Promise.all([
    supabase
      .from("badges")
      .select("*")
      .order("metric", { ascending: true })
      .order("threshold", { ascending: true })
      .returns<Badge[]>(),
    supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", user.id)
      .returns<UserBadge[]>(),
  ]);

  const earnedByBadgeId = new Map((earned ?? []).map((ub) => [ub.badge_id, ub]));
  const allBadges = badges ?? [];
  const earnedCount = allBadges.filter((b) => earnedByBadgeId.has(b.id)).length;

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-6">
      <DashboardHeader />

      <div className="mx-auto mt-10 max-w-3xl">
        <h1 className="font-display text-4xl tracking-wide text-trail-900">Badges</h1>
        <p className="mt-1 text-trail-600">
          Débloqués à la sueur des mollets — pas de raccourci possible.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-summit-300 bg-summit-50 px-4 py-2 text-sm font-semibold text-summit-700">
          {earnedCount} / {allBadges.length} débloqués
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {allBadges.map((badge) => {
            const earnedBadge = earnedByBadgeId.get(badge.id);
            const isEarned = Boolean(earnedBadge);

            return (
              <div
                key={badge.id}
                className={`flex items-start gap-4 rounded-2xl border p-5 transition ${
                  isEarned
                    ? "border-summit-300 bg-summit-50"
                    : "border-trail-200 bg-white opacity-60"
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${
                    isEarned ? "bg-summit-100" : "grayscale"
                  }`}
                >
                  {badge.icon}
                </div>
                <div>
                  <p className="font-display text-xl tracking-wide text-trail-900">
                    {badge.name}
                  </p>
                  <p className="mt-1 text-sm text-trail-600">{badge.description}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-trail-400">
                    {isEarned
                      ? `Débloqué le ${new Date(earnedBadge!.earned_at).toLocaleDateString("fr-FR")}`
                      : `À débloquer · ${requirementLabel(badge)}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
