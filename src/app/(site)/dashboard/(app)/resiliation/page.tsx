import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { submitCancellationSurveyAction } from "@/app/actions/subscription";
import { CANCELLATION_COMMENT_MAX, CANCELLATION_REASONS } from "@/lib/cancellation";
import { isPaidTier } from "@/lib/gating";
import { getT } from "@/lib/i18n/app/server";

export default async function ResiliationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single<{ subscription_tier: string }>();

  // Nothing to cancel without a paid plan.
  if (!profile || !isPaidTier(profile.subscription_tier as never)) {
    redirect("/dashboard/profil");
  }

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-6">
      <DashboardHeader />

      <div className="mx-auto mt-10 max-w-xl">
        <h1 className="font-display text-4xl tracking-wide text-trail-900">
          {t("cancel.title")}
        </h1>
        <p className="mt-2 text-trail-600">{t("cancel.intro")}</p>

        {error === "reason" && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {t("cancel.error")}
          </p>
        )}

        <form action={submitCancellationSurveyAction} className="mt-6 space-y-6">
          <fieldset className="space-y-2">
            <legend className="sr-only">{t("cancel.title")}</legend>
            {CANCELLATION_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-trail-200 bg-white px-4 py-3 text-trail-800 transition hover:border-trail-400 has-[:checked]:border-summit-500 has-[:checked]:bg-summit-50"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  className="h-4 w-4 accent-summit-600"
                />
                {t(`cancel.reason.${reason}`)}
              </label>
            ))}
          </fieldset>

          <div>
            <label htmlFor="comment" className="text-sm font-semibold text-trail-700">
              {t("cancel.comment.label")}
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              maxLength={CANCELLATION_COMMENT_MAX}
              placeholder={t("cancel.comment.placeholder")}
              className="mt-1 w-full rounded-xl border border-trail-200 bg-white px-4 py-3 text-trail-900 outline-none focus:border-summit-500"
            />
            <p className="mt-1 text-xs text-trail-500">{t("cancel.privacy")}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="rounded-xl bg-trail-900 px-6 py-3 font-semibold text-white transition hover:bg-trail-700"
            >
              {t("cancel.submit")}
            </button>
            <button
              type="submit"
              name="skip"
              value="1"
              formNoValidate
              className="text-sm font-semibold text-trail-600 hover:underline"
            >
              {t("cancel.skip")}
            </button>
            <Link
              href="/dashboard/profil"
              className="text-sm font-semibold text-summit-600 hover:underline sm:ml-auto"
            >
              {t("cancel.keep")}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
