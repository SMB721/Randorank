import { currentQuotaWindowStart } from "@/lib/gating";
import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Routes the generator produced for this user in the current month window.
 * Server-only on purpose: it lives outside the "use server" action files so
 * it is never exposed as a callable endpoint.
 */
export async function countMonthlyGenerations(
  supabase: ServerSupabase,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("route_generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", currentQuotaWindowStart());
  return count ?? 0;
}
