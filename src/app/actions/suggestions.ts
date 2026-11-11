"use server";

import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n/server";
import { sendEmail } from "@/lib/email/send";
import { SUGGESTION_NOTIFY_EMAIL, suggestionNotification } from "@/lib/email/suggestion";
import {
  SUGGESTIONS_PER_DAY,
  SUGGESTION_MAX,
  SUGGESTION_MIN,
  isSuggestionKind,
} from "@/lib/suggestions";

export type SuggestionResult =
  | { success: true }
  | { success: false; error: "notLoggedIn" | "tooShort" | "limit" | "saveFailed" };

export async function submitSuggestionAction(
  kind: string,
  rawMessage: string
): Promise<SuggestionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "notLoggedIn" };

  const message = typeof rawMessage === "string" ? rawMessage.trim().slice(0, SUGGESTION_MAX) : "";
  if (!isSuggestionKind(kind) || message.length < SUGGESTION_MIN) {
    return { success: false, error: "tooShort" };
  }

  // A daily cap keeps the bag from being used as a spam pipe.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("suggestions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= SUGGESTIONS_PER_DAY) return { success: false, error: "limit" };

  const locale = await getRequestLocale();
  const { error } = await supabase.from("suggestions").insert({
    user_id: user.id,
    kind,
    message,
    locale,
  });
  if (error) {
    console.error("submitSuggestionAction failed:", error.code, error.message);
    return { success: false, error: "saveFailed" };
  }

  // Tell the team. The message is already saved, so a failure here (provider
  // not configured, network) is logged and never shown to the member.
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle<{ username: string | null }>();
  const notice = await sendEmail({
    to: SUGGESTION_NOTIFY_EMAIL,
    ...suggestionNotification({ kind, message, username: profile?.username ?? null, locale }),
  });
  if (!notice.ok && !notice.skipped) {
    console.error("suggestion notification failed:", notice.error);
  }

  return { success: true };
}
