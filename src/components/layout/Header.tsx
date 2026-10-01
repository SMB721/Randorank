"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LOCALES, LOCALE_LABELS, landingPath, type Locale } from "@/lib/i18n/config";
import type { LandingDict } from "@/lib/i18n/landing";

export default function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: LandingDict["header"];
}) {
  const [open, setOpen] = useState(false);

  const menuLinks = [
    { label: dict.links.ranking, href: landingPath(locale, "classement") },
    { label: dict.links.navigation, href: landingPath(locale, "navigation") },
    { label: dict.links.offers, href: landingPath(locale, "offres") },
    { label: dict.links.faq, href: landingPath(locale, "faq") },
    { label: dict.links.spots, href: landingPath(locale, "spots") },
    { label: dict.links.follow, href: landingPath(locale, "suivez-nous") },
  ];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-trail-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href={landingPath(locale)}
            className="font-display text-2xl tracking-wide text-white"
            onClick={() => setOpen(false)}
          >
            RANDO<span className="text-summit-400">RANK</span>
          </Link>

          <div className="flex items-center gap-4">
            <LanguageSwitcher
              current={locale}
              label={dict.language}
              className="hidden sm:flex"
            />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={dict.openMenu}
              aria-expanded={open}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur transition hover:border-white/60"
            >
              <span className="sr-only">{dict.menuLabel}</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-trail-950 px-6 py-6 text-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <Link
              href={landingPath(locale)}
              className="font-display text-2xl tracking-wide"
              onClick={() => setOpen(false)}
            >
              RANDO<span className="text-summit-400">RANK</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={dict.closeMenu}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-white/60"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-2">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-lg font-semibold transition hover:border-summit-400/60 hover:bg-white/10"
              >
                {link.label}
                <span aria-hidden="true" className="text-white/40">
                  →
                </span>
              </Link>
            ))}
          </nav>

          <LanguageSwitcher
            current={locale}
            label={dict.language}
            className="mx-auto mb-4 flex w-full max-w-md justify-center"
          />

          <div className="mx-auto flex w-full max-w-md gap-3 pb-4">
            <Link
              href="/auth?mode=login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border-2 border-white/30 py-3 text-center text-sm font-semibold transition hover:border-white/60"
            >
              {dict.login}
            </Link>
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl bg-summit-500 py-3 text-center text-sm font-semibold shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
            >
              {dict.signup}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// Plain links (not a client-side state switch): each locale is its own URL,
// so the switch is crawlable and works without JavaScript.
export function LanguageSwitcher({
  current,
  label,
  className = "",
}: {
  current: Locale;
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={`items-center gap-1 text-xs font-semibold ${className}`}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={landingPath(l)}
          hrefLang={l}
          lang={l}
          title={LOCALE_LABELS[l]}
          aria-current={l === current ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 uppercase tracking-widest transition ${
            l === current
              ? "bg-white text-trail-950"
              : "text-white/60 hover:text-white"
          }`}
        >
          {l}
        </Link>
      ))}
    </nav>
  );
}
