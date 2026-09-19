"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPhotosAction } from "@/app/dashboard/randos/[id]/photo-actions";

export default function PhotoUploadForm({ hikeId }: { hikeId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await uploadPhotosAction(hikeId, formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setInfo(
      result.skipped > 0
        ? `${result.uploaded} photo(s) ajoutée(s), ${result.skipped} ignorée(s) (limite atteinte ou fichier invalide).`
        : `${result.uploaded} photo(s) ajoutée(s) ✓`
    );
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <input
        name="photos"
        type="file"
        accept="image/*"
        multiple
        required
        className="block w-full rounded-xl border border-trail-200 bg-white px-4 py-2.5 text-sm text-trail-700 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-trail-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-trail-800 focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
      />
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {info && <p className="rounded-lg bg-trail-50 px-3 py-2 text-sm text-trail-700">{info}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-summit-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Import en cours..." : "Ajouter des photos"}
      </button>
    </form>
  );
}
