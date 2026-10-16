"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { INVITE_COOKIE, isInviteCode } from "@/lib/invite";

// Applies the invite code kept in the cookie. Returns the inviter's name when
// a friendship was created, otherwise null. The cookie is dropped whenever it
// was usable or can never be (bad code, already invited, own link); it is
// kept for guests, who have to create an account first.
export async function acceptInviteAction(): Promise<{ name: string } | null> {
  const store = await cookies();
  const code = store.get(INVITE_COOKIE)?.value;
  if (!isInviteCode(code)) {
    if (code) store.delete(INVITE_COOKIE);
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return null;

  const { data, error } = await supabase.rpc("accept_invite", { p_code: code });
  if (error) {
    console.error("accept_invite failed:", error.message);
    return null;
  }
  store.delete(INVITE_COOKIE);
  return typeof data === "string" ? { name: data } : null;
}
