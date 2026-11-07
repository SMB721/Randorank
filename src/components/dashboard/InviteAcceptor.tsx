"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteAction } from "@/app/actions/invite";
import { INVITE_COOKIE } from "@/lib/invite";
import { useT } from "@/lib/i18n/app/client";

// Mounted in the app shell. Only calls the server when an invite cookie is
// present, so ordinary page loads cost nothing.
export default function InviteAcceptor() {
  const { t } = useT();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!document.cookie.split("; ").some((c) => c.startsWith(`${INVITE_COOKIE}=`))) return;
    acceptInviteAction().then((result) => {
      if (result) {
        setName(result.name);
        router.refresh();
      }
    });
  }, [router]);

  if (name === null) return null;
  return (
    <div className="mx-auto mt-3 max-w-3xl rounded-xl bg-summit-50 px-4 py-3 text-center text-sm font-semibold text-summit-700">
      {t("invite.accepted", { name: name || t("invite.someone") })}
    </div>
  );
}
