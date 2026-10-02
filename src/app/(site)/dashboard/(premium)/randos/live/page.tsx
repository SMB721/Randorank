import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LiveRecorder from "@/components/dashboard/LiveRecorder";
import { getT } from "@/lib/i18n/app/server";

export default async function LiveRandoPage() {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/randos"
          className="text-sm font-semibold text-summit-600 hover:underline"
        >
          {t("live.back")}
        </Link>

        <h1 className="mt-4 font-display text-4xl tracking-wide text-trail-900">
          {t("live.title")}
        </h1>
        <p className="mt-1 text-trail-600">{t("live.subtitle")}</p>

        <div className="mt-8">
          <LiveRecorder />
        </div>
      </div>
    </main>
  );
}
