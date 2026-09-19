"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FRENCH_REGIONS, type Profile } from "@/lib/supabase/types";

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState(profile.username ?? "");
  const [region, setRegion] = useState(profile.region ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim() || null,
        region: region || null,
      })
      .eq("id", profile.id);

    setLoading(false);

    if (error) {
      setError(
        error.code === "23505"
          ? "Ce pseudo est déjà pris, essaie-en un autre."
          : error.message
      );
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-medium text-trail-800">
          Pseudo
        </label>
        <input
          id="username"
          type="text"
          maxLength={30}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ton pseudo sur le classement"
          className="w-full rounded-xl border border-trail-200 px-4 py-2.5 text-sm outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="region" className="text-sm font-medium text-trail-800">
          Région
        </label>
        <select
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full rounded-xl border border-trail-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
        >
          <option value="">Non renseignée</option>
          {FRENCH_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && !error && (
        <p className="rounded-lg bg-trail-50 px-3 py-2 text-sm text-trail-700">
          Profil mis à jour ✓
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-trail-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-trail-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
