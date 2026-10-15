import { redirect } from "next/navigation";
import GuestBanner from "@/components/dashboard/GuestBanner";
import InstallPromptListener from "@/components/InstallPromptListener";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <>
      <InstallPromptListener />
      {user.is_anonymous && <GuestBanner />}
      {children}
    </>
  );
}
