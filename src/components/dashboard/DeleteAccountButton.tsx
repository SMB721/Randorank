"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccountAction } from "@/app/(site)/dashboard/profil/actions";

const CONFIRM_WORD = "SUPPRIMER";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const result = await deleteAccountAction();
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-red-600 hover:underline"
      >
        Supprimer mon compte
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800">
        Cette action est définitive : votre profil, vos randos, vos photos, vos badges et
        votre abonnement seront supprimés. Impossible à annuler.
      </p>
      <div>
        <label htmlFor="confirm-delete" className="text-xs font-medium text-red-700">
          Tapez {CONFIRM_WORD} pour confirmer
        </label>
        <input
          id="confirm-delete"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-1 w-full rounded-lg border border-red-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={confirmText !== CONFIRM_WORD || loading}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Suppression..." : "Supprimer définitivement"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setConfirmText("");
            setError(null);
          }}
          className="rounded-xl border border-trail-200 px-4 py-2 text-sm font-semibold text-trail-600 transition hover:bg-trail-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
