"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/app/client";
import type { DictKey } from "@/lib/i18n/app";

const tabs: { label: DictKey; href: string; icon: string; exact: boolean }[] = [
  { label: "nav.home", href: "/dashboard", icon: "🏠", exact: true },
  { label: "nav.explore", href: "/dashboard/generateur", icon: "🧭", exact: false },
  { label: "nav.community", href: "/dashboard/communaute", icon: "👥", exact: false },
  { label: "nav.ranking", href: "/dashboard/classement", icon: "🏆", exact: false },
  { label: "nav.account", href: "/dashboard/profil", icon: "👤", exact: false },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const { t } = useT();

  // The install screen is a focused, one-time interstitial — a nav bar
  // pointing at other sections would just distract from it.
  if (pathname.startsWith("/dashboard/installer")) {
    return null;
  }

  return (
    <nav
      aria-label={t("nav.aria")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-trail-950/95 backdrop-blur-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[0.65rem] font-semibold transition ${
                isActive ? "text-summit-400" : "text-white/50"
              }`}
            >
              <span className="text-xl" aria-hidden="true">
                {tab.icon}
              </span>
              {t(tab.label)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
