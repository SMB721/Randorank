import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProfileEditForm from "@/components/dashboard/ProfileEditForm";
import AvatarUploadForm from "@/components/dashboard/AvatarUploadForm";
import DeleteAccountButton from "@/components/dashboard/DeleteAccountButton";
import SignOutButton from "@/components/dashboard/SignOutButton";
import BlurEndpointsToggle from "@/components/dashboard/BlurEndpointsToggle";
import { createPortalSessionAction } from "@/app/actions/subscription";
import type { Profile } from "@/lib/supabase/types";
import LanguageSelector from "@/components/dashboard/LanguageSelector";
import { getT } from "@/lib/i18n/app/server";
import { subscriptionKey } from "@/lib/i18n/app/labels";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const { t, tn } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) {
    redirect("/dashboard");
  }

  const hasStripeAccount = profile.subscription_tier !== "freemium";

  const [{ count: badgeCount }, { count: earnedCount }] = await Promise.all([
    supabase.from("badges").select("*", { count: "exact", head: true }),
    supabase
      .from("user_badges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-6">
      <DashboardHeader />

      <div className="mx-auto mt-10 max-w-2xl">
        <h1 className="font-display text-4xl tracking-wide text-trail-900">
          {t("profil.title")}
        </h1>
        <p className="mt-1 text-trail-600">{user.email}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/randos"
            className="flex items-center justify-between rounded-2xl border border-trail-200 bg-white p-5 transition hover:border-trail-400"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-trail-500">
                {t("profil.myHikes")}
              </p>
              <p className="mt-1 font-display text-xl text-trail-900">
                {tn("profil.hikesCount", profile.hike_count)}
              </p>
            </div>
            <span aria-hidden="true" className="text-trail-400">
              →
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-between rounded-2xl border border-trail-200 bg-white p-5 transition hover:border-trail-400"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-trail-500">
                {t("profil.globalStats")}
              </p>
              <p className="mt-1 font-display text-xl text-trail-900">
                {t("profil.kmCumulated", { n: profile.total_distance_km })}
              </p>
            </div>
            <span aria-hidden="true" className="text-trail-400">
              →
            </span>
          </Link>
          <Link
            href="/dashboard/badges"
            className="flex items-center justify-between rounded-2xl border border-trail-200 bg-white p-5 transition hover:border-trail-400"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-trail-500">
                {t("profil.badges")}
              </p>
              <p className="mt-1 font-display text-xl text-trail-900">
                {t("badges.count", { earned: earnedCount ?? 0, total: badgeCount ?? 0 })}
              </p>
            </div>
            <span aria-hidden="true" className="text-trail-400">
              →
            </span>
          </Link>
          <Link
            href="/dashboard/defis"
            className="flex items-center justify-between rounded-2xl border border-trail-200 bg-white p-5 transition hover:border-trail-400"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-trail-500">
                {t("profil.challenges")}
              </p>
              <p className="mt-1 font-display text-xl text-trail-900">{t("profil.inProgress")}</p>
            </div>
            <span aria-hidden="true" className="text-trail-400">
              →
            </span>
          </Link>
        </div>

        {checkout === "success" && (
          <p className="mt-4 rounded-lg bg-summit-50 px-3 py-2 text-sm text-summit-700">
            {t("profil.checkoutSuccess")}
          </p>
        )}
        {checkout === "canceled" && (
          <p className="mt-4 rounded-lg bg-trail-100 px-3 py-2 text-sm text-trail-600">
            {t("profil.checkoutCanceled")}
          </p>
        )}
        {checkout === "error" && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {t("profil.checkoutError")}
          </p>
        )}

        <div className="mt-6 rounded-2xl border border-summit-200 bg-summit-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-summit-600">
            {t("profil.subscription")}
          </p>
          <p className="mt-1 font-display text-2xl text-trail-900">
                {t(subscriptionKey(profile.subscription_tier))}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {!hasStripeAccount && (
              <Link
                href="/bienvenue/paywall"
                className="text-sm font-semibold text-summit-600 hover:underline"
              >
                {t("profil.becomeMul")}
              </Link>
            )}
            {hasStripeAccount && (
              <form action={createPortalSessionAction}>
                <button
                  type="submit"
                  className="text-sm font-semibold text-trail-600 hover:underline"
                >
                  {t("profil.manage")}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-trail-200 bg-white p-6">
          <h2 className="font-display text-2xl tracking-wide text-trail-900">
            {t("profil.identityTitle")}
          </h2>
          <p className="mt-1 text-sm text-trail-500">
            {t("profil.identityBefore")}{" "}
            <Link href="/dashboard/classement" className="font-semibold text-summit-600 hover:underline">
              {t("profil.identityLink")}
            </Link>
            {t("profil.identityAfter")}
          </p>
          <div className="mt-4">
            <AvatarUploadForm initialAvatarUrl={profile.avatar_url} username={profile.username} />
          </div>
          <div className="mt-6">
            <ProfileEditForm profile={profile} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-trail-200 bg-white p-6">
          <h2 className="font-display text-2xl tracking-wide text-trail-900">
            {t("lang.title")}
          </h2>
          <p className="mt-1 text-sm text-trail-500">{t("lang.text")}</p>
          <div className="mt-4">
            <LanguageSelector />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-trail-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-wide text-trail-900">
                {t("profil.privacyTitle")}
              </h2>
              <p className="mt-1 text-sm text-trail-500">{t("profil.privacyText")}</p>
            </div>
            <BlurEndpointsToggle initialValue={profile.blur_endpoints} profileId={profile.id} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-trail-200 bg-white p-6">
          <h2 className="font-display text-2xl tracking-wide text-trail-900">
            {t("profil.dataTitle")}
          </h2>
          <p className="mt-1 text-sm text-trail-500">{t("profil.dataText")}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a
              href="/dashboard/export"
              download
              className="rounded-xl border-2 border-trail-900 px-5 py-2.5 text-sm font-semibold text-trail-900 transition hover:bg-trail-900 hover:text-white"
            >
              {t("profil.dataDownload")}
            </a>
            <DeleteAccountButton />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/dashboard/installer"
            className="flex items-center justify-between rounded-2xl border border-trail-200 bg-white p-5 transition hover:border-trail-400"
          >
            <span className="flex items-center gap-3 font-semibold text-trail-900">
              <span aria-hidden="true">📲</span>
              {t("profil.install")}
            </span>
            <span aria-hidden="true" className="text-trail-400">
              →
            </span>
          </Link>

          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
