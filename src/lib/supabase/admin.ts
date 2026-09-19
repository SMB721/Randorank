import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS entirely. Only for trusted server-side
// contexts that aren't tied to a user session — currently just the Stripe
// webhook, which needs to update an arbitrary user's profile by
// stripe_customer_id rather than by auth.uid(). Never import from a client
// component or expose the service role key to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
