import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GenerateurForm from "@/components/dashboard/GenerateurForm";
import { createClient } from "@/lib/supabase/server";

export default async function GenerateurPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-6">
      <DashboardHeader />

      <div className="mx-auto mt-10 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
          Explorer
        </span>
        <h1 className="mt-1 font-display text-4xl tracking-wide text-trail-900">
          Générateur de tracé
        </h1>
        <p className="mt-1 text-trail-600">
          Donnez une distance, on vous propose une boucle praticable depuis votre
          position.
        </p>

        <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span aria-hidden="true" className="text-lg">
            ⚠️
          </span>
          <p className="text-sm text-amber-800">
            Itinéraire indicatif, pas une consigne de sécurité. Vérifiez toujours la
            météo, votre niveau et votre équipement avant de partir — RandoRank ne
            remplace pas une carte topographique à jour ni votre propre jugement en
            montagne.
          </p>
        </div>

        <div className="mt-6">
          <GenerateurForm />
        </div>
      </div>
    </main>
  );
}
