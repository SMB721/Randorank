import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FaqAccordion from "@/components/home/FaqAccordion";
import CommunityStatsSection from "@/components/home/CommunityStatsSection";
import PhoneMockup from "@/components/home/PhoneMockup";
import FloatingStatCard from "@/components/home/FloatingStatCard";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/config";
import { getLandingDict } from "@/lib/i18n/landing";
import type { CommunityStats, CommunityWeeklyKm } from "@/lib/supabase/types";

const heroImage =
  "https://images.unsplash.com/photo-1616494268339-f49a1c4ac8f8?auto=format&fit=crop&w=2000&q=80";
const forestSpot =
  "https://images.unsplash.com/photo-1562593028-1fe2d15bde36?auto=format&fit=crop&w=900&q=80";
const lakeSpot =
  "https://images.unsplash.com/photo-1600807497639-3b5d8e74a232?auto=format&fit=crop&w=900&q=80";
const groupSpot =
  "https://images.unsplash.com/photo-1674085678761-5472e776e4c8?auto=format&fit=crop&w=900&q=80";
// Real topo tiles (Aiguilles Rouges, Chamonix), baked into a static asset —
// see public/images/route-map-bg-v3.jpg. Clean, minimal basemap (Wikimedia's
// "osm-intl" style) rather than a busy topo render — closer to what Strava/
// Komoot actually show. Attribution required: © OpenStreetMap contributors,
// credited near the mockup. Filename carries a version suffix on purpose:
// renaming is what reliably busts the Next.js image-optimizer cache when
// only the file content changes.
const routeMapBg = "/images/route-map-bg-v3.jpg";

// Below this, the community counter reads as embarrassingly small rather
// than impressive — hide the section until real usage clears the bar, no
// manual flag to remember to flip later.
const COMMUNITY_STATS_MIN_KM = 500;
const COMMUNITY_STATS_MIN_HIKERS = 15;

export default async function LandingPage({ locale }: { locale: Locale }) {
  const t = getLandingDict(locale);
  const spotItems = [forestSpot, lakeSpot, groupSpot].map((src, i) => ({
    src,
    ...t.spots.items[i],
  }));
  const supabase = await createClient();
  const [{ data: stats }, { data: weekly }] = await Promise.all([
    supabase.from("community_stats").select("*").single<CommunityStats>(),
    supabase
      .from("community_weekly_km")
      .select("*")
      .returns<CommunityWeeklyKm[]>(),
  ]);

  const showCommunityStats =
    (stats?.total_km ?? 0) >= COMMUNITY_STATS_MIN_KM &&
    (stats?.total_hikers ?? 0) >= COMMUNITY_STATS_MIN_HIKERS;

  return (
    <>
      <Header locale={locale} dict={t.header} />

      <main>
        {/* Hero */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center">
          <Image
            src={heroImage}
            alt={t.hero.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-trail-950" />

          <div className="relative z-10 space-y-6 pt-16">
            <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm font-semibold text-white backdrop-blur">
              {t.hero.badge}
            </span>
            <h1
              className={`font-display leading-[0.95] tracking-wide text-white hyphens-auto break-words sm:text-8xl ${
                // German compounds ("Herausforderung") overflow a 375px
                // screen at the default size.
                locale === "de" ? "text-5xl" : "text-6xl"
              }`}
            >
              {t.hero.titleLine1}
              <br />
              <span className="text-summit-400">{t.hero.titleLine2}</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-white/85">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
              <Link
                href="/auth"
                className="rounded-xl bg-summit-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
              >
                {t.hero.ctaPrimary}
              </Link>
              <Link
                href="/auth?mode=login"
                className="rounded-xl border-2 border-white/40 bg-white/5 px-8 py-3 text-base font-semibold text-white backdrop-blur transition hover:border-white/70"
              >
                {t.hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>

        {/* Spots & communauté */}
        <section id="spots" className="bg-trail-950 px-6 py-24 text-white">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-400">
                {t.spots.eyebrow}
              </span>
              <h2 className="mt-3 font-display text-4xl tracking-wide sm:text-5xl">
                {t.spots.title}
              </h2>
              <p className="mt-4 text-white/70">
                {t.spots.text}
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {spotItems.map((spot) => (
                <div
                  key={spot.title}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={spot.src}
                    alt={spot.alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs uppercase tracking-widest text-summit-400">
                      {spot.caption}
                    </p>
                    <p className="font-display text-2xl tracking-wide">{spot.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partage — le principal levier d'acquisition organique (voir CLAUDE.md
            §2.5) : la fiche générée après une rando, prête pour les réseaux. */}
        <section className="bg-trail-50 px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="relative flex justify-center py-6">
                <FloatingStatCard
                  icon="📸"
                  label={t.share.floatingTap.label}
                  value={t.share.floatingTap.value}
                  className="left-0 top-0 sm:left-4"
                  delay="0.3s"
                />
                <FloatingStatCard
                  icon="🏅"
                  label={t.share.floatingUnlocked.label}
                  value={t.share.floatingUnlocked.value}
                  className="bottom-0 right-0 sm:right-2"
                  delay="1.3s"
                />

                <PhoneMockup>
                  <div className="relative h-full w-full">
                    <Image
                      src={groupSpot}
                      alt={t.share.imageAlt}
                      fill
                      sizes="280px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />
                    <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                      <span className="font-display text-xs tracking-wide text-white">
                        RandoRank
                      </span>
                      <span className="text-[0.6rem] text-white/70">{t.share.date}</span>
                    </div>
                    <div className="absolute inset-x-3 bottom-3 space-y-2">
                      <p className="font-display text-lg leading-tight text-white">
                        {t.share.routeName}
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {t.share.stats.map((s) => (
                          <div
                            key={s.u}
                            className="rounded-lg bg-white/15 px-1 py-1.5 text-center backdrop-blur"
                          >
                            <p className="font-display text-sm text-white">{s.v}</p>
                            <p className="text-[0.55rem] uppercase tracking-widest text-white/60">
                              {s.u}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PhoneMockup>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
                {t.share.eyebrow}
              </span>
              <h2 className="mt-3 font-display text-4xl tracking-wide text-trail-900 sm:text-5xl">
                {t.share.titleLine1}
                <br />
                {t.share.titleLine2}
              </h2>
              <p className="mt-4 text-trail-700">
                {t.share.text}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-trail-400">
                  {t.share.shareOn}
                </span>
                <div className="flex gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white"
                    aria-label="Instagram"
                  >
                    <InstagramIcon />
                  </span>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-trail-950 text-white"
                    aria-label="TikTok"
                  >
                    <TikTokIcon />
                  </span>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white"
                    aria-label="Facebook"
                  >
                    <ShareFacebookIcon />
                  </span>
                </div>
              </div>

              <Link
                href="/auth"
                className="mt-6 inline-block rounded-xl bg-summit-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
              >
                {t.share.cta}
              </Link>
            </div>
          </div>
        </section>

        {/* Génération d'itinéraire */}
        <section id="navigation" className="bg-trail-50 px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
                {t.route.eyebrow}
              </span>
              <h2 className="mt-3 font-display text-4xl tracking-wide text-trail-900 sm:text-5xl">
                {t.route.titleLine1}
                <br />
                {t.route.titleLine2}
              </h2>
              <p className="mt-4 text-trail-700">
                {t.route.text}
              </p>
              <Link
                href="/auth"
                className="mt-6 inline-block rounded-xl bg-trail-900 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-trail-900/20 transition hover:bg-trail-800"
              >
                {t.route.cta}
              </Link>
            </div>

            <div className="relative flex justify-center py-6">
              <FloatingStatCard
                icon="🧭"
                label={t.route.floatingRoute.label}
                value={t.route.floatingRoute.value}
                className="left-0 top-2 sm:left-4"
                delay="0.2s"
              />
              <FloatingStatCard
                icon="⛰️"
                label={t.route.floatingElevation.label}
                value={t.route.floatingElevation.value}
                className="bottom-4 right-0 sm:right-2"
                delay="1.1s"
              />

              <PhoneMockup>
                <div className="flex h-full flex-col bg-trail-50">
                  <div className="flex items-center justify-between bg-trail-950 px-4 py-3 text-white">
                    <span className="font-display text-sm tracking-wide">RandoRank</span>
                    <span aria-hidden="true">🧭</span>
                  </div>

                  <div className="relative flex-1 bg-trail-50">
                    {/* Real map (Chamonix) in a clean, minimal style — like
                        Strava/Komoot use — rather than a busy topo render: a
                        genuine map is what sells "this is a hiking route", and
                        legible street/place names read better here than dense
                        contour lines. */}
                    <Image
                      src={routeMapBg}
                      alt={t.route.mapAlt}
                      fill
                      sizes="280px"
                      className="object-cover"
                    />

                    <svg
                      viewBox="0 0 200 220"
                      className="absolute inset-0 h-full w-full"
                      fill="none"
                      aria-hidden="true"
                    >
                      {/* Route overlay — point A to point B, not a closed loop: a
                          single reading direction (start at the bottom, finish at
                          the summit) is far more instantly legible than a loop shape
                          at this size. A longer, winding path (crossing the map
                          several times) reads as a longer hike than a short direct
                          diagonal would. White casing keeps it visible over the map. */}
                      <path
                        d="M60,214 C 42,198 46,172 66,156 C 86,140 52,124 58,104 C 64,86 96,94 100,74 C 104,56 78,48 88,32 C 96,20 122,26 144,24"
                        stroke="#ffffff"
                        strokeWidth="6"
                        strokeOpacity="0.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M60,214 C 42,198 46,172 66,156 C 86,140 52,124 58,104 C 64,86 96,94 100,74 C 104,56 78,48 88,32 C 96,20 122,26 144,24"
                        stroke="#fd7310"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Départ marker */}
                      <circle cx="60" cy="214" r="7" fill="#ffffff" />
                      <circle cx="60" cy="214" r="4" fill="#233e1c" />

                      {/* Arrivée marker — a pin shape, distinct from the plain start
                          dot, so the two ends read differently at a glance. */}
                      <path
                        d="M144,24 C 136,24 130,30 130,38 C 130,47 144,58 144,58 C 144,58 158,47 158,38 C 158,30 152,24 144,24 Z"
                        fill="#fd7310"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <circle cx="144" cy="37" r="4" fill="#ffffff" />
                    </svg>

                    <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-white backdrop-blur">
                      {t.route.level}
                    </span>
                    <span className="absolute bottom-2 left-[30%] -translate-x-1/2 rounded-full bg-black/40 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-white backdrop-blur">
                      {t.route.start}
                    </span>
                    <span className="absolute left-[72%] top-2 -translate-x-1/2 rounded-full bg-black/40 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-widest text-white backdrop-blur">
                      {t.route.end}
                    </span>
                    <span className="absolute bottom-1 left-1.5 rounded bg-black/30 px-1 text-[0.4rem] leading-tight text-white/80">
                      © OpenStreetMap contributors
                    </span>
                  </div>

                  <div className="space-y-2 p-3">
                    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                      <span className="text-xs font-medium text-trail-600">{t.route.distance}</span>
                      <span className="font-display text-base tracking-wide text-trail-900">
                        {t.route.distanceValue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                      <span className="text-xs font-medium text-trail-600">{t.route.duration}</span>
                      <span className="font-display text-base tracking-wide text-trail-900">
                        {t.route.durationValue}
                      </span>
                    </div>
                    <button className="mt-1 w-full rounded-xl bg-summit-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-summit-500/30">
                      {t.route.startCta}
                    </button>
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </div>
        </section>

        {/* Classement */}
        <section id="classement" className="bg-trail-900 px-6 py-24 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-400">
                {t.ranking.eyebrow}
              </span>
              <h2 className="mt-3 font-display text-4xl tracking-wide sm:text-5xl">
                {t.ranking.titleLine1}
                <br />
                {t.ranking.titleLine2}
              </h2>
              <p className="mt-4 text-white/70">
                {t.ranking.text}
              </p>
            </div>

            <div className="relative flex justify-center py-6">
              <FloatingStatCard
                icon="🏆"
                label={t.ranking.floatingPosition.label}
                value={t.ranking.floatingPosition.value}
                className="left-0 top-0 sm:left-6"
                delay="0.4s"
                dark
              />
              <FloatingStatCard
                icon="🔥"
                label={t.ranking.floatingNext.label}
                value={t.ranking.floatingNext.value}
                className="bottom-2 right-0 sm:right-4"
                delay="1.4s"
                dark
              />

              <PhoneMockup>
                <div className="flex h-full flex-col bg-trail-950 text-white">
                  <div className="px-4 pb-3 pt-4">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/40">
                      {t.ranking.month}
                    </p>
                    <div className="mt-2 flex gap-2 text-[0.65rem] font-semibold">
                      <span className="rounded-full bg-summit-500 px-3 py-1 text-white">
                        {t.ranking.tabs.national}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-white/60">
                        {t.ranking.tabs.region}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-white/60">
                        {t.ranking.tabs.friends}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 px-3 pb-3">
                    {[
                      { rank: "1", name: "Le Monchu", km: t.ranking.kms[0], highlight: false },
                      { rank: "2", name: "Cimes&Co", km: t.ranking.kms[1], highlight: false },
                      { rank: "3", name: t.ranking.you, km: t.ranking.kms[2], highlight: true },
                      { rank: "4", name: "TrailSeeker", km: t.ranking.kms[3], highlight: false },
                    ].map((row) => (
                      <div
                        key={row.rank}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                          row.highlight ? "bg-summit-500/20 ring-1 ring-summit-400" : "bg-white/5"
                        }`}
                      >
                        <span
                          className={`font-display text-sm ${
                            row.highlight ? "text-summit-400" : "text-white/50"
                          }`}
                        >
                          #{row.rank}
                        </span>
                        <span className="flex-1 text-xs font-medium">{row.name}</span>
                        <span className="text-xs text-white/60">{row.km}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </div>
        </section>

        {/* Communauté en mouvement — vraies données agrégées (community_stats /
            community_weekly_km), pas de chiffres inventés. Masquée tant que
            le volume réel n'est pas au niveau (voir showCommunityStats). */}
        {showCommunityStats && stats && (
          <section className="bg-trail-950 px-6 py-24 text-white">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-400">
                {t.community.eyebrow}
              </span>
              <h2 className="mt-3 font-display text-4xl tracking-wide sm:text-5xl">
                {t.community.title}
              </h2>
              <p className="mt-4 text-white/70">
                {t.community.text}
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-3xl">
              <CommunityStatsSection
                stats={stats}
                weekly={weekly ?? []}
                labels={{ km: t.community.kmLabel, elevation: t.community.elevationLabel, chart: t.community.chartLabel }}
              />
            </div>
          </section>
        )}

        {/* Offres — teaser seulement : le tableau de prix complet est dans le
            dashboard, réservé aux comptes créés (voir /bienvenue/paywall). */}
        <section id="offres" className="bg-white px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
              {t.offers.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-trail-900 sm:text-5xl">
              {t.offers.title}
            </h2>
            <p className="mt-4 text-trail-600">
              {t.offers.text}
            </p>
            <Link
              href="/auth"
              className="mt-6 inline-block rounded-xl bg-summit-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
            >
              {t.offers.cta}
            </Link>
          </div>
        </section>

        {/* RandoRank en quelques mots */}
        <section id="apropos" className="bg-trail-50 px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
              {t.about.eyebrow}
            </span>
            <p className="mt-4 text-xl leading-relaxed text-trail-800">
              {t.about.text}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-white px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
              {t.faq.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-trail-900 sm:text-5xl">
              {t.faq.title}
            </h2>
          </div>

          <div className="mt-12">
            <FaqAccordion items={t.faq.items} />
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-trail-500">
            {t.faq.disclaimer}
          </p>
        </section>

        {/* CTA final */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <Image
            src={forestSpot}
            alt={t.finalCta.imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-trail-950/80" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
              {t.finalCta.title}
            </h2>
            <p className="mt-4 text-white/80">
              {t.finalCta.text}
            </p>
            <Link
              href="/auth"
              className="mt-6 inline-block rounded-xl bg-summit-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
            >
              {t.finalCta.cta}
            </Link>
          </div>
        </section>
      </main>

      <Footer locale={locale} dict={t.footer} />
    </>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3c.4 2.1 1.8 3.6 4 3.9v2.8c-1.4 0-2.8-.4-4-1.2v6.2c0 3.3-2.7 5.8-6 5.5-2.9-.3-5.1-2.7-5.1-5.6 0-3.1 2.6-5.6 5.8-5.5v2.9c-1.5-.2-2.9.9-2.9 2.5 0 1.4 1.1 2.5 2.5 2.6 1.6.1 3-1.1 3-2.8V3h2.7z" />
    </svg>
  );
}

function ShareFacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z" />
    </svg>
  );
}