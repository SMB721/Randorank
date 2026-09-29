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
import { SUBSCRIPTION_LABELS, type Profile } from "@/lib/supabase/types";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
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
          Compte
        </h1>
        <p className="mt-1 text-trail-600">{user.email}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/randos"
            className="flex items-center justify-between rounded-2xl border border-trail-200 bg-white p-5 transition hover:border-trail-400"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-trail-500">
                Mes randos
              </p>
              <p className="mt-1 font-display text-xl text-trail-900">
                {profile.hike_count} sortie{profile.hike_count > 1 ? "s" : ""}
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
                Statistiques globales
              </p>
              <p className="mt-1 font-display text-xl text-trail-900">
                {profile.total_distance_km} km cumulés
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
                Badges
              </p>
              <p className="mt-1 font-display text-xl text-trail-900">
                {earnedCount ?? 0} / {badgeCount ?? 0} débloqués
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
                Défis
              </p>
              <p className="mt-1 font-display text-xl text-trail-900">En cours</p>
            </div>
            <span aria-hidden="true" className="text-trail-400">
              →
            </span>
          </Link>
        </div>

        {checkout === "success" && (
          <p className="mt-4 rounded-lg bg-summit-50 px-3 py-2 text-sm text-summit-700">
            Abonnement activé — bienvenue dans le club ✓
          </p>
        )}
        {checkout === "canceled" && (
          <p className="mt-4 rounded-lg bg-trail-100 px-3 py-2 text-sm text-trail-600">
            Paiement annulé, aucun changement n&apos;a été effectué.
          </p>
        )}
        {checkout === "error" && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Le service de paiement est momentanément indisponible — réessayez dans un instant.
          </p>
        )}

        <div className="mt-6 rounded-2xl border border-summit-200 bg-summit-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-summit-600">
            Offre actuelle
          </p>
          <p className="mt-1 font-display text-2xl text-trail-900">
            {SUBSCRIPTION_LABELS[profile.subscription_tier]}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/abonnement"
              className="text-sm font-semibold text-summit-600 hover:underline"
            >
              {hasStripeAccount ? "Changer d'offre" : "Passer Premium"} →
            </Link>
            {hasStripeAccount && (
              <form action={createPortalSessionAction}>
                <button
                  type="submit"
                  className="text-sm font-semibold text-trail-600 hover:underline"
                >
                  Gérer mon abonnement (facturation, résiliation)
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-trail-200 bg-white p-6">
          <h2 className="font-display text-2xl tracking-wide text-trail-900">
            Pseudo &amp; région
          </h2>
          <p className="mt-1 text-sm text-trail-500">
            Votre pseudo et votre région apparaissent sur le{" "}
            <Link href="/dashboard/classement" className="font-semibold text-summit-600 hover:underline">
              classement
            </Link>
            .
          </p>
          <div className="mt-4">
            <AvatarUploadForm initialAvatarUrl={profile.avatar_url} username={profile.username} />
          </div>
          <div className="mt-6">
            <ProfileEditForm profile={profile} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-trail-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-wide text-trail-900">
                Confidentialité
              </h2>
              <p className="mt-1 text-sm text-trail-500">
                Flouter le départ et l&apos;arrivée de vos randos (environ 300 m) sur la
                carte, pour ne pas exposer votre domicile.
              </p>
            </div>
            <BlurEndpointsToggle initialValue={profile.blur_endpoints} profileId={profile.id} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-trail-200 bg-white p-6">
          <h2 className="font-display text-2xl tracking-wide text-trail-900">
            Vos données
          </h2>
          <p className="mt-1 text-sm text-trail-500">
            Conformément au RGPD, vous pouvez récupérer une copie de toutes vos données ou
            supprimer définitivement votre compte.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a
              href="/dashboard/export"
              download
              className="rounded-xl border-2 border-trail-900 px-5 py-2.5 text-sm font-semibold text-trail-900 transition hover:bg-trail-900 hover:text-white"
            >
              Télécharger mes données
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
              Installer l&apos;app
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
