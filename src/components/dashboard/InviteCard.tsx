"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/app/client";

export default function InviteCard({ code }: { code: string }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);

  const link = () => `${window.location.origin}/i/${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link());
      setCopied(true);
    } catch {
      window.prompt(t("invite.card.copy"), link());
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ text: t("invite.share.text"), url: link() });
        return;
      } catch {
        // Cancelled or unavailable: fall back to copying the link.
      }
    }
    await copy();
  }

  return (
    <div className="rounded-2xl border border-summit-200 bg-summit-50 p-5">
      <p className="font-display text-2xl tracking-wide text-trail-900">{t("invite.card.title")}</p>
      <p className="mt-1 text-sm text-trail-600">{t("invite.card.text")}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={share}
          className="rounded-xl bg-summit-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
        >
          {t("invite.card.share")}
        </button>
        <button
          type="button"
          onClick={copy}
          className="rounded-xl border-2 border-trail-900 px-5 py-2.5 text-sm font-semibold text-trail-900 transition hover:bg-trail-900 hover:text-white"
        >
          {copied ? t("invite.card.copied") : t("invite.card.copy")}
        </button>
      </div>
    </div>
  );
}
