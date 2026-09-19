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
        <h1 className="font-display text-4xl tracking-wide text-trail-900">
          Générateur de tracé
        </h1>
        <p className="mt-1 text-trail-600">
          Donne une distance, on te propose une boucle praticable depuis ta position.
        </p>

        <div className="mt-6">
          <GenerateurForm />
        </div>
      </div>
    </main>
  );
}
