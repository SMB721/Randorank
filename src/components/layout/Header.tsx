"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const menuLinks = [
  { label: "Classement", href: "/#classement" },
  { label: "Navigation", href: "/#navigation" },
  { label: "Offres", href: "/#offres" },
  { label: "FAQ", href: "/#faq" },
  { label: "Spots & communauté", href: "/#spots" },
  { label: "Suivez-nous", href: "/#suivez-nous" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

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
            href="/"
            className="font-display text-2xl tracking-wide text-white"
            onClick={() => setOpen(false)}
          >
            RANDO<span className="text-summit-400">RANK</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur transition hover:border-white/60"
          >
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-trail-950 px-6 py-6 text-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <Link
              href="/"
              className="font-display text-2xl tracking-wide"
              onClick={() => setOpen(false)}
            >
              RANDO<span className="text-summit-400">RANK</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
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
                key={link.label}
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

          <div className="mx-auto flex w-full max-w-md gap-3 pb-4">
            <Link
              href="/auth?mode=login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border-2 border-white/30 py-3 text-center text-sm font-semibold transition hover:border-white/60"
            >
              Connexion
            </Link>
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl bg-summit-500 py-3 text-center text-sm font-semibold shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
            >
              Inscription
            </Link>
          </div>
        </div>
      )}
    </>
  );
}