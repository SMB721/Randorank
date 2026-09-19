import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProfileEditForm from "@/components/dashboard/ProfileEditForm";
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

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-6">
      <DashboardHeader />

      <div className="mx-auto mt-10 max-w-2xl">
        <Link href="/dashboard" className="text-sm font-semibold text-summit-600 hover:underline">
          ← Dashboard
        </Link>

        <h1 className="mt-4 font-display text-4xl tracking-wide text-trail-900">
          Paramètres
        </h1>
        <p className="mt-1 text-trail-600">{user.email}</p>

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
            Le service de paiement est momentanément indisponible — réessaie dans un instant.
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
              href="/#offres"
              className="text-sm font-semibold text-summit-600 hover:underline"
            >
              {hasStripeAccount ? "Changer d'offre" : "Passer Premium ou VIP"} →
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
            Ton pseudo et ta région apparaissent sur le{" "}
            <Link href="/dashboard/classement" className="font-semibold text-summit-600 hover:underline">
              classement
            </Link>
            .
          </p>
          <div className="mt-4">
            <ProfileEditForm profile={profile} />
          </div>
        </div>
      </div>
    </main>
  );
}
