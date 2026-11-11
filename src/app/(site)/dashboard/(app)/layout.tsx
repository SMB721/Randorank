import { redirect } from "next/navigation";
import GuestBanner from "@/components/dashboard/GuestBanner";
import InstallPromptListener from "@/components/InstallPromptListener";
import { createClient } from "@/lib/supabase/server";
import { nicknameRequired } from "@/lib/nickname";

// The app is open to everyone, guests included ("value first, account
// later"): the only requirement is a session, anonymous or not. What a free
// or guest account can do is decided per feature in lib/gating.ts, and
// server actions re-check it — this layout only guards page navigation.
// /dashboard/abonnement, /profil, /export and /installer live outside this
// group; they handle their own checks.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  // New members pick a nickname: the sign-up flow asks for it on its first
  // screen, and this keeps anyone who skipped it (closed the tab, signed in
  // with Google) from using the app. Accounts created before the rule
  // (lib/nickname.ts) and guests are left alone.
  if (!user.is_anonymous) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, created_at")
      .eq("id", user.id)
      .maybeSingle<{ username: string | null; created_at: string }>();
    if (profile && !profile.username?.trim() && nicknameRequired(profile.created_at)) {
      redirect("/bienvenue");
    }
  }

  return (
    <>
      <InstallPromptListener />
      {user.is_anonymous && <GuestBanner />}
      {children}
    </>
  );
}
