import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Called by Supabase after email confirmation or OAuth (Google) return.
 * Exchanges the "code" for a user session, then redirects.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
