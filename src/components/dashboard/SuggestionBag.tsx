"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitSuggestionAction } from "@/app/actions/suggestions";
import { SUGGESTION_KINDS, SUGGESTION_MAX, type SuggestionKind } from "@/lib/suggestions";
import { useT } from "@/lib/i18n/app/client";

function BackpackIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5.5V4.5a3 3 0 0 1 6 0v1" />
      <path d="M6.5 8.5a3.5 3.5 0 0 1 3.5-3h4a3.5 3.5 0 0 1 3.5 3V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6.5 19z" />
      <path d="M9.5 14.5h5v3.5h-5z" />
      <path d="M6.5 12H4.8A.8.8 0 0 0 4 12.8v3.4a.8.8 0 0 0 .8.8h1.7M17.5 12h1.7a.8.8 0 0 1 .8.8v3.4a.8.8 0 0 1-.8.8h-1.7" />
    </svg>
  );
}

const KIND_EMOJI: Record<SuggestionKind, string> = { idea: "💡", problem: "🧗", love: "💚" };

// Floating "sac à idées": a backpack button that opens a small card where a
// member can drop an idea, a problem or a kind word. It sits above the
// bottom tab bar and never blocks the page behind it.
export default function SuggestionBag() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<SuggestionKind>("idea");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startSend] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, sent]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startSend(async () => {
      const result = await submitSuggestionAction(kind, message);
      if (result.success) {
        setSent(true);
        setMessage("");
        return;
      }
      setError(
        result.error === "tooShort"
          ? t("suggest.error.short")
          : result.error === "limit"
            ? t("suggest.error.limit")
            : t("suggest.error.save")
      );
    });
  }

  function closeAndReset() {
    setOpen(false);
    setSent(false);
    setError(null);
  }

  return (
    <div
      className="fixed right-4 z-40 flex flex-col items-end gap-3"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 4.75rem)" }}
    >
      {open && (
        <div
          role="dialog"
          aria-label={t("suggest.title")}
          className="w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-trail-100 bg-white p-5 text-trail-900 shadow-2xl shadow-trail-950/30"
        >
          {sent ? (
            <div className="space-y-3 text-center">
              <p className="text-4xl" aria-hidden="true">
                🥾
              </p>
              <p className="font-display text-2xl tracking-wide">{t("suggest.thanks.title")}</p>
              <p className="text-sm text-trail-600">{t("suggest.thanks.text")}</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="flex-1 rounded-xl border border-trail-200 py-2.5 text-sm font-semibold text-trail-700 transition hover:bg-trail-50"
                >
                  {t("suggest.another")}
                </button>
                <button
                  type="button"
                  onClick={closeAndReset}
                  className="flex-1 rounded-xl bg-trail-950 py-2.5 text-sm font-semibold text-white transition hover:bg-trail-800"
                >
                  {t("suggest.close")}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl tracking-wide">{t("suggest.title")}</p>
                  <p className="mt-1 text-sm text-trail-600">{t("suggest.intro")}</p>
                </div>
                <button
                  type="button"
                  onClick={closeAndReset}
                  aria-label={t("suggest.close")}
                  className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-trail-400 transition hover:bg-trail-50 hover:text-trail-700"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("suggest.title")}>
                {SUGGESTION_KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={kind === k}
                    onClick={() => setKind(k)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      kind === k
                        ? "border-summit-500 bg-summit-50 text-summit-700"
                        : "border-trail-200 text-trail-600 hover:border-trail-300"
                    }`}
                  >
                    <span aria-hidden="true">{KIND_EMOJI[k]} </span>
                    {t(`suggest.kind.${k}`)}
                  </button>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={SUGGESTION_MAX}
                rows={4}
                required
                placeholder={t("suggest.placeholder")}
                className="w-full resize-none rounded-xl border border-trail-200 px-4 py-3 text-sm outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
              />

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? t("suggest.sending") : t("suggest.send")}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? closeAndReset() : setOpen(true))}
        aria-expanded={open}
        aria-label={t("suggest.open")}
        className="flex h-14 items-center gap-2 rounded-full bg-summit-500 px-4 text-sm font-bold text-white shadow-xl shadow-trail-950/40 transition hover:bg-summit-600"
      >
        <BackpackIcon />
        <span className="hidden sm:inline">{t("suggest.open")}</span>
      </button>
    </div>
  );
}
