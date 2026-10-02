"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { computeAge } from "@/lib/birthday";
import { FRENCH_REGIONS, type Profile } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n/app/client";

function isoDateYearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { t } = useT();
  const supabase = createClient();

  const [username, setUsername] = useState(profile.username ?? "");
  const [region, setRegion] = useState(profile.region ?? "");
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? "");
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
        birth_date: birthDate || null,
      })
      .eq("id", profile.id);

    setLoading(false);

    if (error) {
      setError(
        error.code === "23505"
          ? t("pe.usernameTaken")
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
          {t("pe.username")}
        </label>
        <input
          id="username"
          type="text"
          maxLength={30}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t("pe.usernamePlaceholder")}
          className="w-full rounded-xl border border-trail-200 px-4 py-2.5 text-sm outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="region" className="text-sm font-medium text-trail-800">
          {t("pe.region")}
        </label>
        <select
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full rounded-xl border border-trail-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
        >
          <option value="">{t("pe.regionNone")}</option>
          {FRENCH_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="birth-date" className="text-sm font-medium text-trail-800">
          {t("pe.birth")}{" "}
          <span className="font-normal text-trail-400">{t("pe.birthHint")}</span>
        </label>
        <input
          id="birth-date"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          min={isoDateYearsAgo(120)}
          max={isoDateYearsAgo(5)}
          className="w-full rounded-xl border border-trail-200 px-4 py-2.5 text-sm outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
        />
        {birthDate && (
          <p className="text-xs text-trail-500">
            {t("pe.birthAge", { age: computeAge(birthDate) ?? "" })}
          </p>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && !error && (
        <p className="rounded-lg bg-trail-50 px-3 py-2 text-sm text-trail-700">
          {t("pe.saved")}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-trail-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-trail-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t("pe.saving") : t("pe.save")}
      </button>
    </form>
  );
}
