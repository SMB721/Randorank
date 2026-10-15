"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailConfigured, sendEmail } from "@/lib/email/send";
import { renderConfirmationEmail, type EmailLocale } from "@/lib/email/weekly-summary";
import { siteUrl } from "@/lib/email/pages";
import { getRequestLocale } from "@/lib/i18n/server";

export type WeeklySummaryState = "off" | "pending" | "unavailable" | "error";

// Turning the summary on only records the request and sends a confirmation
// e-mail: nothing is sent weekly until the member clicks the link
// (weekly_summary_confirmed_at). The sensitive columns are written with the
// service role, never from the browser.
export async function setWeeklySummaryAction(enable: boolean): Promise<WeeklySummaryState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous || !user.email) return "error";

  const admin = createAdminClient();

  if (!enable) {
    const { error } = await admin
      .from("profiles")
      .update({ weekly_summary: false, weekly_summary_confirmed_at: null })
      .eq("id", user.id);
    return error ? "error" : "off";
  }

  if (!emailConfigured()) return "unavailable";

  const locale = (await getRequestLocale()) as EmailLocale;
  const { data, error } = await admin
    .from("profiles")
    .update({ weekly_summary: true, weekly_summary_confirmed_at: null, email_locale: locale })
    .eq("id", user.id)
    .select("email_token")
    .single<{ email_token: string }>();
  if (error || !data) return "error";

  const message = renderConfirmationEmail(
    locale,
    `${siteUrl()}/api/email/confirm?token=${data.email_token}`
  );
  const sent = await sendEmail({ to: user.email, ...message });
  if (!sent.ok) {
    console.error("weekly summary confirmation failed:", sent.error);
    await admin.from("profiles").update({ weekly_summary: false }).eq("id", user.id);
    return "error";
  }
  return "pending";
}
