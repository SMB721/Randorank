"use server";

import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n/server";
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

  const { error } = await supabase.from("suggestions").insert({
    user_id: user.id,
    kind,
    message,
    locale: await getRequestLocale(),
  });
  if (error) {
    console.error("submitSuggestionAction failed:", error.code, error.message);
    return { success: false, error: "saveFailed" };
  }
  return { success: true };
}
