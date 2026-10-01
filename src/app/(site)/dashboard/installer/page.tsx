import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import InstallAppGuide from "@/components/dashboard/InstallAppGuide";
import { createClient } from "@/lib/supabase/server";

export default async function InstallerPage() {
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

      <div className="mx-auto mt-10 max-w-md">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
          Garde-la à portée de main
        </span>
        <h1 className="mt-3 font-display text-4xl tracking-wide text-trail-900">
          Installez RandoRank comme une vraie app
        </h1>
        <p className="mt-2 text-trail-600">
          Lancez vos sorties depuis votre écran d&apos;accueil, en plein écran, sans
          passer par le navigateur.
        </p>

        <div className="mt-8">
          <InstallAppGuide />
        </div>
      </div>
    </main>
  );
}
