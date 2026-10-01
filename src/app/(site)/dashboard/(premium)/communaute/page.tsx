import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FriendsSearch from "@/components/dashboard/FriendsSearch";
import SpotCarousel from "@/components/dashboard/SpotCarousel";
import { createClient } from "@/lib/supabase/server";
import { USER_LEVEL_LABELS, type PublicProfile, type Spot } from "@/lib/supabase/types";

const FRIENDS_PREVIEW_COUNT = 3;

export default async function CommunautePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const { data: following } = await supabase
    .from("follows")
    .select("followed_id")
    .eq("follower_id", user.id)
    .returns<{ followed_id: string }[]>();
  const followingIds = (following ?? []).map((f) => f.followed_id);

  const [{ data: friendRows }, { data: spots }] = await Promise.all([
    followingIds.length > 0
      ? supabase.from("profiles_public").select("*").in("id", followingIds).returns<PublicProfile[]>()
      : Promise.resolve({ data: [] as PublicProfile[] }),
    supabase.from("spots").select("*").returns<Spot[]>(),
  ]);

  const topFriends = (friendRows ?? [])
    .sort((a, b) => b.total_distance_km - a.total_distance_km)
    .slice(0, FRIENDS_PREVIEW_COUNT);

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-6">
      <DashboardHeader />

      <div className="mx-auto mt-10 max-w-3xl">
        <h1 className="font-display text-4xl tracking-wide text-trail-900">Communauté</h1>
        <p className="mt-1 text-trail-600">
          Vos amis, les spots partagés et ce qui se passe autour de vous.
        </p>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-wide text-trail-900">Vos amis</h2>
            <Link
              href="/dashboard/classement?scope=amis"
              className="text-sm font-semibold text-summit-600 hover:underline"
            >
              Classement entre amis →
            </Link>
          </div>

          {topFriends.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-trail-300 bg-white p-6 text-center text-sm text-trail-500">
              Vous ne suivez personne pour l&apos;instant — cherchez un pseudo ci-dessous pour
              commencer.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {topFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between rounded-2xl border border-trail-200 bg-white p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {friend.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={friend.avatar_url}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-trail-900 font-display text-lg text-white">
                        {(friend.username || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-trail-900">
                        {friend.username || "Randonneur anonyme"}
                      </p>
                      <p className="truncate text-xs text-trail-500">
                        {friend.region || "Région non renseignée"} ·{" "}
                        {USER_LEVEL_LABELS[friend.user_level]}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 font-display text-lg text-trail-900">
                    {friend.total_distance_km} km
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <FriendsSearch followingIds={followingIds} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl tracking-wide text-trail-900">
            Spots partagés
          </h2>
          <p className="mt-1 text-sm text-trail-500">
            Découvrez les spots partagés par la communauté RandoRank.
          </p>
          <div className="overflow-hidden rounded-2xl bg-trail-950 px-4 pb-4">
            <SpotCarousel spots={spots ?? []} />
          </div>
        </section>
      </div>
    </main>
  );
}
