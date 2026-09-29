import Link from "next/link";

// Navigation now lives entirely in the bottom tab bar (see BottomTabBar) plus
// the Compte page (history, défis, installer, déconnexion) — this is just
// the logo/wordmark, kept as its own component so every page doesn't repeat
// the markup and color variants.
export default function DashboardHeader({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={`font-display text-2xl tracking-wide ${dark ? "text-white" : "text-trail-900"}`}
    >
      RANDO<span className="text-summit-500">RANK</span>
    </Link>
  );
}
