import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  FRENCH_REGIONS,
  USER_LEVEL_LABELS,
  type PublicProfile,
  type SubscriptionTier,
  type UserLevel,
} from "@/lib/supabase/types";

const TOP_N = 50;

const TIER_BADGE: Partial<Record<SubscriptionTier, string>> = {
  premium: "Le MUL",
  vip: "Le Thru-Hiker",
};

type Scope = "national" | "regional";

export default async function ClassementPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; region?: string; niveau?: string }>;
}) {
  const params = await searchParams;
  const scope: Scope = params.scope === "regional" ? "regional" : "national";
  const niveau = params.niveau || undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const { data: me } = await supabase
    .from("profiles_public")
    .select("*")
    .eq("id", user.id)
    .single<PublicProfile>();

  // The region tab needs a region to show — default to the visitor's own,
  // falling back to the first one on the list if theirs isn't set.
  const region = scope === "regional" ? params.region || me?.region || FRENCH_REGIONS[0] : undefined;

  let query = supabase
    .from("profiles_public")
    .select("*")
    .order(scope === "regional" ? "regional_rank" : "national_rank", { ascending: true })
    .limit(TOP_N);

  if (scope === "regional" && region) query = query.eq("region", region);
  if (niveau) query = query.eq("user_level", niveau);

  const { data: rows } = await query.returns<PublicProfile[]>();

  const meVisible = rows?.some((r) => r.id === user.id) ?? false;
  const rankField = scope === "regional" ? "regional_rank" : "national_rank";

  function hrefFor(next: Partial<{ scope: Scope; region: string; niveau: string }>) {
    const p = new URLSearchParams();
    const s = next.scope ?? scope;
    p.set("scope", s);
    if (s === "regional") {
      const r = next.region ?? region;
      if (r) p.set("region", r);
    }
    const n = next.niveau ?? niveau;
    if (n) p.set("niveau", n);
    return `/dashboard/classement?${p.toString()}`;
  }

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-semibold text-summit-600 hover:underline">
          ← Dashboard
        </Link>

        <h1 className="mt-4 font-display text-4xl tracking-wide text-trail-900">
          Classement
        </h1>
        <p className="mt-1 text-trail-600">
          Les kilomètres réellement parcourus te font grimper.
        </p>

        {me && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-summit-300 bg-summit-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-summit-600">
                Position nationale
              </p>
              <p className="mt-1 font-display text-3xl text-trail-900">#{me.national_rank}</p>
            </div>
            <div className="rounded-2xl border border-trail-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-trail-500">
                Position en {me.region || "ta région"}
              </p>
              <p className="mt-1 font-display text-3xl text-trail-900">#{me.regional_rank}</p>
            </div>
          </div>
        )}

        {/* Scope tabs: two distinct rankings, not one list filtered twice. */}
        <div className="mt-6 inline-flex rounded-full border border-trail-200 bg-white p-1 text-sm font-semibold">
          <Link
            href={hrefFor({ scope: "national" })}
            className={`rounded-full px-5 py-2 transition ${
              scope === "national" ? "bg-trail-900 text-white" : "text-trail-600"
            }`}
          >
            National
          </Link>
          <Link
            href={hrefFor({ scope: "regional" })}
            className={`rounded-full px-5 py-2 transition ${
              scope === "regional" ? "bg-trail-900 text-white" : "text-trail-600"
            }`}
          >
            Par région
          </Link>
        </div>

        <form className="mt-4 flex flex-wrap gap-3" method="get">
          <input type="hidden" name="scope" value={scope} />

          {scope === "regional" && (
            <select
              name="region"
              defaultValue={region}
              className="rounded-xl border border-trail-200 bg-white px-4 py-2 text-sm text-trail-700"
            >
              {FRENCH_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}

          <select
            name="niveau"
            defaultValue={niveau ?? ""}
            className="rounded-xl border border-trail-200 bg-white px-4 py-2 text-sm text-trail-700"
          >
            <option value="">Tous les niveaux</option>
            {(Object.keys(USER_LEVEL_LABELS) as UserLevel[]).map((lvl) => (
              <option key={lvl} value={lvl}>
                {USER_LEVEL_LABELS[lvl]}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-xl bg-trail-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-trail-800"
          >
            Filtrer
          </button>
        </form>

        <div className="mt-6 space-y-2">
          {!rows || rows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-trail-300 bg-white p-6 text-center text-sm text-trail-500">
              Personne dans ce filtre pour l&apos;instant — élargis ta recherche ou reviens
              bientôt, la communauté grandit vite.
            </p>
          ) : (
            <>
              {rows.length < 5 && (
                <p className="rounded-xl bg-trail-100 px-4 py-2 text-xs text-trail-600">
                  Encore peu de randonneurs dans ce filtre — élargis la recherche pour un
                  classement plus complet.
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
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-right font-display text-xl text-trail-400">
                      {row[rankField]}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-trail-900 font-display text-lg text-white">
                      {(row.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="flex items-center gap-2 font-semibold text-trail-900">
                        {row.username || "Randonneur anonyme"}
                        {TIER_BADGE[row.subscription_tier] && (
                          <span className="rounded-full bg-summit-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-summit-700">
                            {TIER_BADGE[row.subscription_tier]}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-trail-500">
                        {row.region || "Région non renseignée"} ·{" "}
                        {USER_LEVEL_LABELS[row.user_level]}
                      </p>
                    </div>
                  </div>
                  <p className="font-display text-lg text-trail-900">
                    {row.total_distance_km} km
                  </p>
                </div>
              ))}
              {!meVisible && me && (
                <p className="pt-2 text-center text-xs text-trail-400">
                  Tu n&apos;apparais pas dans ce top {TOP_N} filtré — vois ta position
                  ci-dessus.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
