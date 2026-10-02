"use client";

import { useRef, useState } from "react";
import { uploadAvatarAction } from "@/app/(site)/dashboard/profil/actions";
import { useT } from "@/lib/i18n/app/client";

export default function AvatarUploadForm({
  initialAvatarUrl,
  username,
}: {
  initialAvatarUrl: string | null;
  username: string | null;
}) {
  const { t } = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.set("avatar", file);
    const result = await uploadAvatarAction(formData);

    setLoading(false);
    if (result.success) {
      setAvatarUrl(result.avatarUrl);
    } else {
      setError(result.error);
    }
    setPreview(null);
    e.target.value = "";
  }

  const displayUrl = preview ?? avatarUrl;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-trail-200 disabled:cursor-not-allowed"
        aria-label={t("avatar.aria")}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-trail-900 font-display text-2xl text-white">
            {(username || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
          {loading ? "…" : t("avatar.change")}
        </div>
      </button>
      <div>
        <p className="text-sm font-medium text-trail-800">{t("avatar.title")}</p>
        <p className="mt-0.5 text-xs text-trail-500">
          {t("avatar.hint")}
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
