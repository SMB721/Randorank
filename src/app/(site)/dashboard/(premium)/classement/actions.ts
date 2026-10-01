"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PublicProfile } from "@/lib/supabase/types";

const SEARCH_LIMIT = 8;

export type SearchResult = Pick<PublicProfile, "id" | "username" | "region" | "user_level">;

export async function searchProfilesAction(query: string): Promise<SearchResult[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !query.trim()) return [];

  const { data } = await supabase
    .from("profiles_public")
    .select("id, username, region, user_level")
    .ilike("username", `%${query.trim()}%`)
    .neq("id", user.id)
    .limit(SEARCH_LIMIT)
    .returns<SearchResult[]>();

  return data ?? [];
}

export async function followUserAction(followedId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté·e." };

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, followed_id: followedId });

  if (error && error.code !== "23505") {
    // 23505 = already following — treat as a no-op success.
    return { error: error.message };
  }

  revalidatePath("/dashboard/classement");
  return {};
}

// Bound directly into a <form action> below, so it must resolve to void —
// unfollow is idempotent and low-stakes, no error surfaced inline.
export async function unfollowUserAction(followedId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("followed_id", followedId);

  revalidatePath("/dashboard/classement");
}
