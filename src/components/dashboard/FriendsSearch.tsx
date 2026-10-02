"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  followUserAction,
  searchProfilesAction,
  type SearchResult,
} from "@/app/(site)/dashboard/(premium)/classement/actions";
import { useT } from "@/lib/i18n/app/client";
import { levelKey } from "@/lib/i18n/app/labels";

export default function FriendsSearch({ followingIds }: { followingIds: string[] }) {
  const { t } = useT();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startSearch(async () => {
      const data = await searchProfilesAction(query);
      setResults(data);
    });
  }

  async function handleFollow(id: string) {
    setPendingId(id);
    setError(null);
    const result = await followUserAction(id);
    setPendingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-trail-200 bg-white p-5">
      <p className="text-sm font-semibold text-trail-900">{t("friends.add")}</p>
      <form onSubmit={handleSearch} className="mt-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("friends.placeholder")}
          className="flex-1 rounded-xl border border-trail-200 bg-white px-4 py-2 text-sm text-trail-700 outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="rounded-xl bg-trail-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-trail-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSearching ? "..." : t("friends.search")}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {results && (
        <div className="mt-3 space-y-1.5">
          {results.length === 0 ? (
            <p className="text-xs text-trail-400">{t("friends.none")}</p>
          ) : (
            results.map((r) => {
              const alreadyFollowing = followingIds.includes(r.id);
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-trail-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-trail-900">
                      {r.username || t("rank.anonymous")}
                    </p>
                    <p className="text-xs text-trail-500">
                      {r.region || t("rank.regionMissing")} · {t(levelKey(r.user_level))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFollow(r.id)}
                    disabled={alreadyFollowing || pendingId === r.id}
                    className="shrink-0 rounded-full border border-summit-400 px-3 py-1 text-xs font-semibold text-summit-600 transition hover:bg-summit-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {alreadyFollowing ? t("friends.following") : pendingId === r.id ? "..." : t("friends.follow")}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
