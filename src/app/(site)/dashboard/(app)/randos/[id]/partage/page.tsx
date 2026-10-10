import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/app/server";
import { hasCleanShareCard } from "@/lib/gating";
import type { SubscriptionTier } from "@/lib/supabase/types";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  const { data: hike } = await supabase
    .from("hikes")
    .select("id, user_id")
    .eq("id", id)
    .single<{ id: string; user_id: string }>();

  if (!hike || hike.user_id !== user.id) {
    notFound();
  }

  const imageUrl = `/dashboard/randos/${hike.id}/image`;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single<{ subscription_tier: SubscriptionTier }>();
  const watermarked = !hasCleanShareCard(profile?.subscription_tier ?? "freemium");

  return (
    <main className="min-h-screen bg-trail-950 px-6 py-16">
      <div className="mx-auto max-w-md text-center">
        <Link
          href={`/dashboard/randos/${hike.id}`}
          className="text-sm font-semibold text-summit-400 hover:underline"
        >
          {t("share.back")}
        </Link>

        <h1 className="mt-4 font-display text-3xl tracking-wide text-white">
          {t("share.title")}
        </h1>
        <p className="mt-1 text-sm text-white/60">{t("share.text")}</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={t("share.alt")} className="w-full" />
        </div>

        {watermarked && (
          <p className="mt-4 text-xs text-white/60">
            {t("share.freeNote")}{" "}
            <Link href="/bienvenue/paywall" className="font-semibold text-summit-400 hover:underline">
              {t("share.freeCta")}
            </Link>
          </p>
        )}

        <a
          href={imageUrl}
          download={`randorank-${hike.id}.png`}
          className="mt-6 inline-block rounded-xl bg-summit-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
        >
          {t("share.download")}
        </a>
      </div>
    </main>
  );
}
