import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UpsellCard from "@/components/dashboard/UpsellCard";
import FriendsSearch from "@/components/dashboard/FriendsSearch";
import { unfollowUserAction } from "@/app/(site)/dashboard/(app)/classement/actions";
import { createClient } from "@/lib/supabase/server";
import {
  USER_LEVELS,
  type PublicProfile,
  type SubscriptionTier,
} from "@/lib/supabase/types";
import { getT } from "@/lib/i18n/app/server";
import { levelKey } from "@/lib/i18n/app/labels";
import { countryName } from "@/lib/countries";

const TOP_N = 50;

const TIER_BADGE: Partial<Record<SubscriptionTier, string>> = {
  premium: "Le MUL",
};

type Scope = "national" | "amis";
type RankedProfile = PublicProfile & { rank: number };

export default async function ClassementPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; niveau?: string }>;
}) {
  const params = await searchParams;
  const { t, locale } = await getT();
  const scope: Scope = params.scope === "amis" ? "amis" : "national";
  const niveau = params.niveau || undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  const { data: me } = await supabase
    .from("profiles_public")
    .select("*")
    .eq("id", user.id)
    .single<PublicProfile>();

  const { data: following } = await supabase
    .from("follows")
    .select("followed_id")
    .eq("follower_id", user.id)
    .returns<{ followed_id: string }[]>();
  const followingIds = (following ?? []).map((f) => f.followed_id);

  let rows: RankedProfile[] = [];

  if (scope === "amis") {
    const ids = [user.id, ...followingIds];
    let amisQuery = supabase.from("profiles_public").select("*").in("id", ids);
    if (niveau) amisQuery = amisQuery.eq("user_level", niveau);
    const { data: amisRows } = await amisQuery.returns<PublicProfile[]>();
    rows = (amisRows ?? [])
      .sort((a, b) => b.total_distance_km - a.total_distance_km)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  } else {
    // "National" = the visitor's own country (national_rank is per country).
    let query = supabase
      .from("profiles_public")
      .select("*")
      .eq("country", me?.country ?? "FR")
      .order("national_rank", { ascending: true })
      .limit(TOP_N);
    if (niveau) query = query.eq("user_level", niveau);
    const { data } = await query.returns<PublicProfile[]>();
    rows = (data ?? []).map((r) => ({ ...r, rank: r.national_rank }));
  }

  const meVisible = rows.some((r) => r.id === user.id);

  function hrefFor(next: Partial<{ scope: Scope; niveau: string }>) {
    const p = new URLSearchParams();
    p.set("scope", next.scope ?? scope);
    const n = next.niveau ?? niveau;
    if (n) p.set("niveau", n);
    return `/dashboard/classement?${p.toString()}`;
  }

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-6">
      <DashboardHeader />

      <div className="mx-auto mt-10 max-w-3xl">
        <h1 className="font-display text-4xl tracking-wide text-trail-900">
          {t("rank.title")}
        </h1>
        <p className="mt-1 text-trail-600">
          {t("rank.subtitle")}
        </p>

        {user.is_anonymous && (
          <div className="mt-6">
            <UpsellCard
              icon="🏆"
              title={t("guest.rank.title")}
              text={t("guest.rank.text")}
              cta={t("guest.rank.cta")}
              href="/auth?mode=signup&next=/dashboard/classement"
            />
          </div>
        )}

        {me && (
          <div className="mt-6">
            <div className="rounded-2xl border border-summit-300 bg-summit-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-summit-600">
                {t("rank.myCountry", { country: countryName(me.country, locale) })}
              </p>
              <p className="mt-1 font-display text-3xl text-trail-900">#{me.national_rank}</p>
            </div>
          </div>
        )}

        {/* Scope tabs: your country, or the people you follow. */}
        <div className="mt-6 inline-flex rounded-full border border-trail-200 bg-white p-1 text-sm font-semibold">
          <Link
            href={hrefFor({ scope: "national" })}
            className={`rounded-full px-5 py-2 transition ${
              scope === "national" ? "bg-trail-900 text-white" : "text-trail-600"
            }`}
          >
            {t("rank.tab.national")}
          </Link>
          <Link
            href={hrefFor({ scope: "amis" })}
            className={`rounded-full px-5 py-2 transition ${
              scope === "amis" ? "bg-trail-900 text-white" : "text-trail-600"
            }`}
          >
            {t("rank.tab.friends")}
          </Link>
        </div>

        {scope === "amis" ? (
          <div className="mt-4">
            <FriendsSearch followingIds={followingIds} />
          </div>
        ) : (
          <form className="mt-4 flex flex-wrap gap-3" method="get">
            <input type="hidden" name="scope" value={scope} />

            <select
              name="niveau"
              defaultValue={niveau ?? ""}
              className="rounded-xl border border-trail-200 bg-white px-4 py-2 text-sm text-trail-700"
            >
              <option value="">{t("rank.allLevels")}</option>
              {USER_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {t(levelKey(lvl))}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-trail-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-trail-800"
            >
              {t("rank.filter")}
            </button>
          </form>
        )}

        {(
        <div className="mt-6 space-y-2">
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-trail-300 bg-white p-6 text-center text-sm text-trail-500">
              {scope === "amis" ? t("rank.empty.friends") : t("rank.empty.other")}
            </p>
          ) : (
            <>
              {scope !== "amis" && rows.length < 5 && (
                <p className="rounded-xl bg-trail-100 px-4 py-2 text-xs text-trail-600">
                  {t("rank.fewNotice")}
                </p>
              )}
              {rows.map((row) => (
                <div
                  key={row.id}
                  className={`flex items-center justify-between rounded-2xl border p-4 ${
                    row.id === user.id
                      ? "border-summit-300 bg-summit-50"
                      : "border-trail-200 bg-white"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <span className="w-6 shrink-0 text-right font-display text-xl text-trail-400 sm:w-8">
                      {row.rank}
                    </span>
                    {row.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.avatar_url}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-trail-900 font-display text-lg text-white">
                        {(row.username || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold text-trail-900">
                        <span className="truncate">{row.username || t("rank.anonymous")}</span>
                        {TIER_BADGE[row.subscription_tier] && (
                          <span className="shrink-0 rounded-full bg-summit-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-summit-700">
                            {TIER_BADGE[row.subscription_tier]}
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-trail-500">
                        {countryName(row.country, locale)} ·{" "}
                        {t(levelKey(row.user_level))}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 pl-2">
                    <p className="whitespace-nowrap font-display text-lg text-trail-900">
                      {row.total_distance_km} km
                    </p>
                    {scope === "amis" && row.id !== user.id && (
                      <form action={unfollowUserAction.bind(null, row.id)}>
                        <button
                          type="submit"
                          className="whitespace-nowrap text-xs font-semibold text-trail-400 hover:text-red-600 hover:underline"
                        >
                          {t("rank.unfollow")}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
              {scope !== "amis" && !meVisible && me && (
                <p className="pt-2 text-center text-xs text-trail-400">
                  {t("rank.notVisible", { n: TOP_N })}
                </p>
              )}
            </>
          )}
        </div>
        )}
      </div>
    </main>
  );
}
