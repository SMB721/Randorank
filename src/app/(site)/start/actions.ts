"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PSEUDO_MAX, PSEUDO_MIN, randomPseudo } from "@/lib/pseudo";

const UNIQUE_VIOLATION = "23505";
const MAX_PSEUDO_ATTEMPTS = 5;

// "Value first, account later": opens an anonymous Supabase session so the
// visitor can import hikes, generate a route and see the app without an
// email or password. The same user id is kept when they later link an email
// or Google account (see AuthForm), so nothing they did is lost.
export async function startAnonymousAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user: existing },
  } = await supabase.auth.getUser();
  if (existing) {
    redirect("/dashboard");
  }

  const wanted = String(formData.get("pseudo") ?? "").trim();
  if (wanted && (wanted.length < PSEUDO_MIN || wanted.length > PSEUDO_MAX)) {
    redirect("/start?error=length");
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.error("signInAnonymously failed:", error?.message);
    redirect("/start?error=failed");
  }

  // The chosen pseudo wins if it is free; otherwise (or when none was given)
  // fall back to a generated one. The username column is unique, so a
  // collision just means trying another number. It stays editable in the
  // profile either way.
  const candidates = [wanted, ...Array.from({ length: MAX_PSEUDO_ATTEMPTS }, randomPseudo)].filter(
    Boolean
  );
  for (const username of candidates) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", data.user.id);
    if (!updateError) break;
    if (updateError.code !== UNIQUE_VIOLATION) {
      console.error("startAnonymousAction: could not set username:", updateError.message);
      break;
    }
  }

  redirect("/dashboard");
}
