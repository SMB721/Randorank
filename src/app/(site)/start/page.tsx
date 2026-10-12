import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Entry point kept for old links and ads: sign-up now starts with an email
// (or Google / Facebook) account, so this page only routes. Members who are
// already signed in go straight to the app. Guests created before the change
// keep their session and the banner that invites them to create an account.
export default async function StartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  redirect(user ? "/dashboard" : "/auth?mode=signup");
}
