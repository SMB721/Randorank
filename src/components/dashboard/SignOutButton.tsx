"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n/app/client";

export default function SignOutButton() {
  const router = useRouter();
  const { t } = useT();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="w-full rounded-xl border-2 border-trail-200 py-3 text-sm font-semibold text-trail-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-60"
    >
      {loading ? t("signout.loading") : t("signout.label")}
    </button>
  );
}
