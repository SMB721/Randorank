import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { USER_LEVELS, type Badge, type UserBadge } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/app/server";
import { badgeDescription, badgeName, levelKey } from "@/lib/i18n/app/labels";
import type { Translator } from "@/lib/i18n/app";

function requirementLabel(badge: Badge, tr: Translator): string {
  switch (badge.metric) {
    case "hike_count":
      return tr.tn("badges.req.hikes", badge.threshold);
    case "total_distance_km":
      return tr.t("badges.req.distance", { n: badge.threshold });
    case "total_elevation_m":
      return tr.t("badges.req.elevation", { n: badge.threshold });
    case "user_level":
      return tr.t("badges.req.level", { level: tr.t(levelKey(USER_LEVELS[badge.threshold])) });
  }
}

export default async function BadgesPage() {
  const tr = await getT();
  const { t } = tr;
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
        <h1 className="font-display text-4xl tracking-wide text-trail-900">{t("badges.title")}</h1>
        <p className="mt-1 text-trail-600">{t("badges.subtitle")}</p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-summit-300 bg-summit-50 px-4 py-2 text-sm font-semibold text-summit-700">
          {t("badges.count", { earned: earnedCount, total: allBadges.length })}
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
                    {badgeName(tr, badge)}
                  </p>
                  <p className="mt-1 text-sm text-trail-600">{badgeDescription(tr, badge)}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-trail-400">
                    {isEarned
                      ? t("badges.earnedOn", {
                          date: new Date(earnedBadge!.earned_at).toLocaleDateString(tr.locale),
                        })
                      : t("badges.toUnlock", { req: requirementLabel(badge, tr) })}
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
