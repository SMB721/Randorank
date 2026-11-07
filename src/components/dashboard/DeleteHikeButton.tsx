"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteHikeAction } from "@/app/(site)/dashboard/(app)/randos/actions";
import { useT } from "@/lib/i18n/app/client";

export default function DeleteHikeButton({ hikeId }: { hikeId: string }) {
  const router = useRouter();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const result = await deleteHikeAction(hikeId);
    if (!result.success) {
      setLoading(false);
      setError(result.error);
      return;
    }
    router.push("/dashboard/randos");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-red-600 hover:underline"
      >
        {t("hike.delete.open")}
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800">{t("hike.delete.warning")}</p>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t("hike.delete.loading") : t("hike.delete.confirm")}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={loading}
          className="rounded-xl border border-trail-200 px-4 py-2 text-sm font-semibold text-trail-600 transition hover:bg-trail-50"
        >
          {t("hike.delete.cancel")}
        </button>
      </div>
    </div>
  );
}
