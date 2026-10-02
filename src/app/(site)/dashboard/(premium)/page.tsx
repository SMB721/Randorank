import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeAge, isBirthdayToday } from "@/lib/birthday";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import InstallBanner from "@/components/dashboard/InstallBanner";
import SpotCarousel from "@/components/dashboard/SpotCarousel";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import {
  LEVEL_THRESHOLDS_KM,
  NEXT_LEVEL,
  type Profile,
  type Spot,
} from "@/lib/supabase/types";
import { getT } from "@/lib/i18n/app/server";
import { levelKey } from "@/lib/i18n/app/labels";

const dashboardBg =
  "https://images.unsplash.com/photo-1674085678761-5472e776e4c8?auto=format&fit=crop&w=2000&q=80";

export default async function DashboardPage() {
  const { t, tn } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl tracking-wide text-trail-900">
          {t("home.creating.title")}
        </h1>
        <p className="text-trail-600">{t("home.creating.text")}</p>
      </main>
    );
  }

  // New accounts only (existing profiles were backfilled to "seen" — see
  // migration 0015): send them through the install screen once, before
  // their first real dashboard view.
  if (!profile.install_prompt_seen) {
    redirect("/dashboard/installer");
  }

  const { data: spots } = await supabase.from("spots").select("*").returns<Spot[]>();
  const shuffledSpots = shuffle(spots ?? []);

  const displayName = profile.username || user.email?.split("@")[0] || t("home.defaultName");
  const initial = displayName.charAt(0).toUpperCase();
  const celebrateBirthday = isBirthdayToday(profile.birth_date);
  const age = computeAge(profile.birth_date);

  const nextLevel = NEXT_LEVEL[profile.user_level];
  const nextThreshold = LEVEL_THRESHOLDS_KM[profile.user_level];
  const progressPercent = nextThreshold
    ? Math.min(100, Math.round((profile.total_distance_km / nextThreshold) * 100))
    : 100;
  const kmRemaining = nextThreshold
    ? Math.max(0, nextThreshold - profile.total_distance_km)
    : 0;

  const stats = [
    {
      label: t("home.stat.hikes"),
      value: profile.hike_count,
      decimals: 0,
      suffix: "",
      icon: <BootIcon />,
    },
    {
      label: t("home.stat.distance"),
      value: profile.total_distance_km,
      decimals: 1,
      suffix: " km",
      icon: <RouteIcon />,
    },
    {
      label: t("home.stat.elevation"),
      value: profile.total_elevation_m,
      decimals: 0,
      suffix: " m",
      icon: <PeakIcon />,
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <Image
          src={dashboardBg}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-trail-950/75" />
      </div>

      <main>
        {/* Profile header band */}
        <div className="px-6 pb-16 pt-6 text-white">
          <div className="mx-auto max-w-4xl">
            <DashboardHeader dark />

            <div className="mt-6">
              <InstallBanner />
            </div>

            <div className="mt-8 flex items-center gap-4">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-summit-500 font-display text-3xl tracking-wide">
                  {initial}
                </div>
              )}
              <div>
                <p className="text-sm text-white/50">{t("home.welcome")}</p>
                <h1 className="font-display text-3xl tracking-wide sm:text-4xl">
                  {displayName} 🥾
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                    {profile.region || t("home.regionMissing")}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                    {t(levelKey(profile.user_level))}
                  </span>
                </div>
              </div>
            </div>

            {celebrateBirthday && (
              <div className="mt-6 rounded-2xl border border-summit-400/40 bg-summit-500/15 p-4 text-center">
                <p className="font-display text-xl tracking-wide text-white">
                  {t("home.birthday.title", { name: displayName })}
                </p>
                <p className="mt-1 text-sm text-white/70">
                  {tn("home.birthday.text", profile.hike_count, { age: age ?? "" })}
                </p>
              </div>
            )}

            {/* Actions principales — accessibles sans passer par le menu ☰. */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/dashboard/randos/live"
                className="flex items-center justify-between gap-3 rounded-2xl bg-summit-500 px-5 py-4 font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    🥾
                  </span>
                  {t("home.startHike")}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/dashboard/generateur"
                className="flex items-center justify-between gap-3 rounded-2xl border-2 border-white/30 bg-white/5 px-5 py-4 font-semibold text-white backdrop-blur transition hover:border-white/60 hover:bg-white/10"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    🧭
                  </span>
                  {t("home.generate")}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

      <div className="mx-auto -mt-8 max-w-4xl px-6 pb-16">
        {/* Stat cards, overlapping the header band */}
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="animate-fade-in-up rounded-2xl border border-white/15 bg-white/10 p-5 text-center text-white shadow-xl backdrop-blur-md"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-summit-400">
                {stat.icon}
              </div>
              <p className="mt-3 font-display text-3xl tracking-wide">
                <AnimatedNumber value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-white/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Progression */}
        <div
          className="mt-6 animate-fade-in-up rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-md"
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                {t("home.progress")}
              </p>
              <p className="mt-1 font-display text-2xl tracking-wide">
                {t(levelKey(profile.user_level))}
              </p>
            </div>
            {nextLevel && (
              <p className="text-right text-sm text-white/70">
                {t("home.remainingBefore")}{" "}
                <span className="font-semibold text-summit-400">{kmRemaining} km</span>
                <br />
                {t("home.remainingAfter", { level: t(levelKey(nextLevel)) })}
              </p>
            )}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-summit-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {!nextLevel && (
            <p className="mt-2 text-sm text-white/70">
              {t("home.maxLevel")}
            </p>
          )}
        </div>

        <WeatherWidget />

        <SpotCarousel spots={shuffledSpots} />
      </div>
    </main>
    </div>
  );
}

// Fisher-Yates — reshuffled server-side on every dashboard load, so the
// carousel order varies between visits.
function shuffle(spots: Spot[]): Spot[] {
  const result = [...spots];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function BootIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3v5.5L6 12v3a2 2 0 002 2h9a2 2 0 002-2c0-2-1.5-3-3-3.5L12 10V3H9z"
      />
      <path strokeLinecap="round" d="M6 17h13" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path
        strokeLinecap="round"
        d="M5 8c0 6 14 2 14 8"
        strokeDasharray="2.5 2.5"
      />
    </svg>
  );
}

function PeakIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 19L10 6l3 5 2-3 6 11H3z" />
    </svg>
  );
}
