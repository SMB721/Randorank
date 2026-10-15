import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isToken, messagePage, siteUrl } from "@/lib/email/pages";
import type { EmailLocale } from "@/lib/email/weekly-summary";

async function unsubscribe(token: string | null) {
  if (!isToken(token)) return null;
  const { data } = await createAdminClient()
    .from("profiles")
    .update({ weekly_summary: false, weekly_summary_confirmed_at: null })
    .eq("email_token", token)
    .select("email_locale")
    .maybeSingle<{ email_locale: EmailLocale }>();
  return data;
}

// Link in the footer of every summary.
export async function GET(req: NextRequest) {
  const done = await unsubscribe(req.nextUrl.searchParams.get("token"));
  return done
    ? messagePage(done.email_locale, "unsubscribed", siteUrl())
    : messagePage("fr", "invalid", siteUrl());
}

// One-click unsubscribe (RFC 8058): mail clients POST here without opening
// the link.
export async function POST(req: NextRequest) {
  const done = await unsubscribe(req.nextUrl.searchParams.get("token"));
  return new Response(null, { status: done ? 200 : 400 });
}
