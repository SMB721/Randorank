"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { importGpxAction } from "@/app/dashboard/randos/actions";

export default function ImportGpxForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await importGpxAction(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setWarning(result.warning);
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="gpx" className="text-sm font-medium text-trail-800">
          Fichier GPX
        </label>
        <input
          id="gpx"
          name="gpx"
          type="file"
          accept=".gpx"
          required
          className="block w-full rounded-xl border border-trail-200 bg-white px-4 py-2.5 text-sm text-trail-700 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-trail-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-trail-800 focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && !warning && (
        <p className="rounded-lg bg-trail-50 px-3 py-2 text-sm text-trail-700">
          Rando importée et comptabilisée dans tes stats ✓
        </p>
      )}
      {success && warning && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Rando enregistrée, mais une anomalie a été détectée et elle n&apos;est pas
          comptabilisée dans tes stats : {warning}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-summit-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Import en cours..." : "Importer"}
      </button>
    </form>
  );
}
