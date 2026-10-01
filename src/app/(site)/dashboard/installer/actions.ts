"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Marks the one-time "install this as an app" screen as seen, then sends the
// user on to the dashboard — called both from "Plus tard" and after a
// successful install, so it's never shown to the same account twice.
export async function dismissInstallPromptAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("profiles")
      .update({ install_prompt_seen: true })
      .eq("id", user.id);
  }

  redirect("/dashboard");
}
