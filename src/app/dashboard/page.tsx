import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SpotCarousel from "@/components/dashboard/SpotCarousel";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import {
  LEVEL_THRESHOLDS_KM,
  NEXT_LEVEL,
  USER_LEVEL_LABELS,
  type Profile,
  type Spot,
} from "@/lib/supabase/types";

const dashboardBg =
  "https://images.unsplash.com/photo-1674085678761-5472e776e4c8?auto=format&fit=crop&w=2000&q=80";

export default async function DashboardPage() {
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
          Un instant...
        </h1>
        <p className="text-trail-600">
          Ton profil est en cours de création, recharge la page dans quelques
          secondes.
        </p>
      </main>
    );
  }

  const { data: spots } = await supabase.from("spots").select("*").returns<Spot[]>();
  const shuffledSpots = shuffle(spots ?? []);

  const displayName = profile.username || user.email?.split("@")[0] || "Randonneur";
  const initial = displayName.charAt(0).toUpperCase();

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
      label: "Sorties",
      value: profile.hike_count,
      decimals: 0,
      suffix: "",
      icon: <BootIcon />,
    },
    {
      label: "Distance cumulée",
      value: profile.total_distance_km,
      decimals: 1,
      suffix: " km",
      icon: <RouteIcon />,
    },
    {
      label: "Dénivelé cumulé",
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

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-summit-500 font-display text-3xl tracking-wide">
                {initial}
              </div>
              <div>
                <p className="text-sm text-white/50">Bienvenue</p>
                <h1 className="font-display text-3xl tracking-wide sm:text-4xl">
                  {displayName} 🥾
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                    {profile.region || "Région non renseignée"}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                    {USER_LEVEL_LABELS[profile.user_level]}
                  </span>
                </div>
              </div>
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
                Progression
              </p>
              <p className="mt-1 font-display text-2xl tracking-wide">
                {USER_LEVEL_LABELS[profile.user_level]}
              </p>
            </div>
            {nextLevel && (
              <p className="text-right text-sm text-white/70">
                Encore <span className="font-semibold text-summit-400">{kmRemaining} km</span>
                <br />
                pour passer {USER_LEVEL_LABELS[nextLevel]}
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
              Niveau maximum atteint — la référence de la communauté 🏔️
            </p>
          )}
        </div>

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
