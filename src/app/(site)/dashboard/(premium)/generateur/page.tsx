import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GenerateurForm from "@/components/dashboard/GenerateurForm";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/app/server";

export default async function GenerateurPage() {
  const { t } = await getT();
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
          {t("gen.eyebrow")}
        </span>
        <h1 className="mt-1 font-display text-4xl tracking-wide text-trail-900">
          {t("gen.title")}
        </h1>
        <p className="mt-1 text-trail-600">{t("gen.subtitle")}</p>

        <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span aria-hidden="true" className="text-lg">
            ⚠️
          </span>
          <p className="text-sm text-amber-800">{t("gen.warning")}</p>
        </div>

        <div className="mt-6">
          <GenerateurForm />
        </div>
      </div>
    </main>
  );
}
