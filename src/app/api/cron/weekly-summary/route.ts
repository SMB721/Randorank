import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailConfigured, sendEmail } from "@/lib/email/send";
import {
  renderWeeklySummaryEmail,
  summarizeWeek,
  type EmailLocale,
} from "@/lib/email/weekly-summary";
import { siteUrl } from "@/lib/email/pages";

// Called by Vercel Cron every Monday (vercel.json). Vercel sends
// "Authorization: Bearer $CRON_SECRET". `?dry=1` lists what would be sent
// without sending or recording anything.
export const maxDuration = 60;

const BATCH = 200;
const DAY = 24 * 60 * 60 * 1000;

type Member = {
  id: string;
  first_name: string | null;
  username: string | null;
  email_locale: EmailLocale;
  email_token: string;
  hike_count: number;
};

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!emailConfigured()) {
    return NextResponse.json({ skipped: "RESEND_API_KEY / EMAIL_FROM not set" });
  }

  const dry = req.nextUrl.searchParams.get("dry") === "1";
  const supabase = createAdminClient();
  const since = new Date(Date.now() - 7 * DAY).toISOString();
  const notSentSince = new Date(Date.now() - 5 * DAY).toISOString();
  const site = siteUrl();

  const { data: members, error } = await supabase
    .from("profiles")
    .select("id, first_name, username, email_locale, email_token, hike_count")
    .eq("weekly_summary", true)
    .not("weekly_summary_confirmed_at", "is", null)
    .or(`last_weekly_summary_at.is.null,last_weekly_summary_at.lt.${notSentSince}`)
    .order("last_weekly_summary_at", { ascending: true, nullsFirst: true })
    .limit(BATCH)
    .returns<Member[]>();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const report = { candidates: members.length, sent: 0, skipped: 0, failed: 0, dry };

  for (const member of members) {
    const { data: auth } = await supabase.auth.admin.getUserById(member.id);
    const email = auth?.user?.email;
    if (!email || auth.user?.is_anonymous) {
      report.skipped++;
      continue;
    }

    const { data: hikes } = await supabase
      .from("hikes")
      .select("distance_km, elevation_gain_m")
      .eq("user_id", member.id)
      .eq("is_valid", true)
      .or(`started_at.gte.${since},and(started_at.is.null,created_at.gte.${since})`);

    // Someone who never recorded a hike gets nothing: there is no week to sum up.
    if (!hikes?.length && member.hike_count === 0) {
      report.skipped++;
      continue;
    }

    const { data: own } = await supabase
      .from("profiles_public")
      .select("national_rank, total_distance_km")
      .eq("id", member.id)
      .maybeSingle<{ national_rank: number; total_distance_km: number }>();
    let nextKm: number | null = null;
    if (own && own.national_rank > 1) {
      const { data: next } = await supabase
        .from("profiles_public")
        .select("total_distance_km")
        .eq("national_rank", own.national_rank - 1)
        .limit(1)
        .maybeSingle<{ total_distance_km: number }>();
      nextKm = next ? Number(next.total_distance_km) : null;
    }

    const data = summarizeWeek(
      hikes ?? [],
      { rank: own?.national_rank ?? null, ownKm: Number(own?.total_distance_km ?? 0), nextKm },
      member.first_name || member.username
    );
    const unsubscribe = `${site}/api/email/unsubscribe?token=${member.email_token}`;
    const message = renderWeeklySummaryEmail(member.email_locale, data, {
      app: `${site}/dashboard/classement`,
      generate: `${site}/dashboard/generateur`,
      unsubscribe,
    });

    if (dry) {
      report.sent++;
      continue;
    }
    const result = await sendEmail({ to: email, ...message, unsubscribeUrl: unsubscribe });
    if (result.ok) {
      await supabase
        .from("profiles")
        .update({ last_weekly_summary_at: new Date().toISOString() })
        .eq("id", member.id);
      report.sent++;
    } else {
      console.error("weekly summary failed for", member.id, result.error);
      report.failed++;
    }
  }

  return NextResponse.json(report);
}
