import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LiveRecorder from "@/components/dashboard/LiveRecorder";
import QuotaPaywall from "@/components/dashboard/QuotaPaywall";
import { getHikeQuotaStatus } from "@/lib/quota";
import type { SubscriptionTier } from "@/lib/supabase/types";

export default async function LiveRandoPage() {
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

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/randos"
          className="text-sm font-semibold text-summit-600 hover:underline"
        >
          ← Mes randos
        </Link>

        <h1 className="mt-4 font-display text-4xl tracking-wide text-trail-900">
          Enregistrer ma rando
        </h1>
        <p className="mt-1 text-trail-600">
          RandoRank suit ta position en direct pendant que tu marches.
        </p>

        <div className="mt-8">
          {quota.quotaExceeded ? (
            <QuotaPaywall limit={quota.limit} />
          ) : (
            <LiveRecorder />
          )}
        </div>
      </div>
    </main>
  );
}
