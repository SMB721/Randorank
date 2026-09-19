"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const menuLinks = [
  { label: "Mes randos", href: "/dashboard/randos", icon: "🥾" },
  { label: "Générer un tracé", href: "/dashboard/generateur", icon: "🧭" },
  { label: "Classement", href: "/dashboard/classement", icon: "🏆" },
  { label: "Défis", href: "/dashboard/defis", icon: "🔥" },
  { label: "Badges", href: "/dashboard/badges", icon: "🎖️" },
  { label: "Paramètres", href: "/dashboard/profil", icon: "⚙️" },
  { label: "Accueil", href: "/", icon: "🏠" },
];

export default function DashboardHeader({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className={`font-display text-2xl tracking-wide ${dark ? "text-white" : "text-trail-900"}`}
        >
          RANDO<span className="text-summit-500">RANK</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
            dark
              ? "border-white/30 bg-white/10 text-white hover:border-white/60"
              : "border-trail-200 bg-white text-trail-700 hover:border-trail-400"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-trail-950 px-6 py-6 text-white">
          <div className="mx-auto flex w-full max-w-md items-center justify-between">
            <span className="font-display text-2xl tracking-wide">
              RANDO<span className="text-summit-400">RANK</span>
            </span>
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

          <nav className="mx-auto mt-10 flex w-full max-w-md flex-1 flex-col gap-2">
            {menuLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-lg font-semibold transition hover:border-summit-400/60 hover:bg-white/10"
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="mx-auto mb-4 w-full max-w-md rounded-xl border-2 border-white/20 py-3 text-sm font-semibold text-white/70 transition hover:border-red-400 hover:text-red-300 disabled:opacity-60"
          >
            {loading ? "Déconnexion..." : "Se déconnecter"}
          </button>
        </div>
      )}
    </>
  );
}
