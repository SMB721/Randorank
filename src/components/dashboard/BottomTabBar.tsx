"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/app/client";
import type { DictKey } from "@/lib/i18n/app";

type IconName = "home" | "explore" | "community" | "ranking" | "account";

const tabs: { label: DictKey; href: string; icon: IconName; exact: boolean }[] = [
  { label: "nav.home", href: "/dashboard", icon: "home", exact: true },
  { label: "nav.explore", href: "/dashboard/generateur", icon: "explore", exact: false },
  { label: "nav.community", href: "/dashboard/communaute", icon: "community", exact: false },
  { label: "nav.ranking", href: "/dashboard/classement", icon: "ranking", exact: false },
  { label: "nav.account", href: "/dashboard/profil", icon: "account", exact: false },
];

// Line icons drawn on a 24px grid. The active tab gets a filled variant so
// the selection reads at a glance, not just through color.
function TabIcon({ name, active }: { name: IconName; active: boolean }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? 2.2 : 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const fill = active ? "currentColor" : "none";

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3.5 10.5 12 3.5l8.5 7" />
          <path d="M5.5 9v10.5h13V9" fill={fill} fillOpacity={0.18} />
          <path d="M10 19.5v-5.5h4v5.5" />
        </svg>
      );
    case "explore":
      // A trail winding between two peaks: "find a route".
      return (
        <svg {...common}>
          <path d="M2.5 19 8.5 8l3.5 6 2.5-4 7 9z" fill={fill} fillOpacity={0.18} />
          <path d="M8.5 8 10 5.5" />
          <circle cx="17.5" cy="5" r="1.6" />
        </svg>
      );
    case "community":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" fill={fill} fillOpacity={0.18} />
          <path d="M3 19.5c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5" />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M16.5 14.2c2.3.2 3.9 2 4.4 4.8" />
        </svg>
      );
    case "ranking":
      // Podium: the core of RandoRank.
      return (
        <svg {...common}>
          <path d="M9 20.5V9h6v11.5" fill={fill} fillOpacity={0.18} />
          <path d="M3 20.5v-6.5h6M15 20.5V12h6v8.5M2 20.5h20" />
          <path d="m12 3.2.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 5.3l2-.3z" />
        </svg>
      );
    case "account":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.8" fill={fill} fillOpacity={0.18} />
          <path d="M4.5 20.5c.8-4 3.8-6.5 7.5-6.5s6.7 2.5 7.5 6.5" />
        </svg>
      );
  }
}

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
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 pb-2 pt-2.5 text-[0.68rem] font-semibold tracking-wide transition-colors ${
                isActive ? "text-summit-400" : "text-white/55 hover:text-white/80"
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-summit-500"
                />
              )}
              <TabIcon name={tab.icon} active={isActive} />
              {t(tab.label)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
