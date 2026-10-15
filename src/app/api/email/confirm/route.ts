import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isToken, messagePage, siteUrl } from "@/lib/email/pages";
import type { EmailLocale } from "@/lib/email/weekly-summary";

// Link in the confirmation e-mail (double opt-in). Only a profile that asked
// for the summary (weekly_summary = true) can be confirmed.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!isToken(token)) return messagePage("fr", "invalid", siteUrl());

  const { data } = await createAdminClient()
    .from("profiles")
    .update({ weekly_summary_confirmed_at: new Date().toISOString() })
    .eq("email_token", token)
    .eq("weekly_summary", true)
    .select("email_locale")
    .maybeSingle<{ email_locale: EmailLocale }>();

  return data
    ? messagePage(data.email_locale, "confirmed", siteUrl())
    : messagePage("fr", "invalid", siteUrl());
}
