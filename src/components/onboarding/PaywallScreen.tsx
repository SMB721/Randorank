"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCheckoutSessionAction } from "@/app/actions/subscription";
import {
  PREMIUM_PRICE,
  PREMIUM_TRIAL_DAYS,
  PREMIUM_YEARLY_SAVINGS_PERCENT,
} from "@/lib/pricing";
import HtmlLang from "@/components/HtmlLang";
import { formatEuro, landingPath, type Locale } from "@/lib/i18n/config";
import { fill, type FunnelDict } from "@/lib/i18n/funnel";

type Period = "monthly" | "yearly";

type Props = {
  locale: Locale;
  dict: FunnelDict["paywall"];
  firstName: string | null;
  level: string | null;
  experience: string | null;
  region: string | null;
  area: string | null;
  goal: string | null;
  goalLabel: string | null;
  checkoutStatus: string | null;
};

export default function PaywallScreen({
  locale,
  dict: t,
  firstName,
  level,
  experience,
  region,
  area,
  goal,
  goalLabel,
  checkoutStatus,
}: Props) {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("monthly");

  // Stripe redirects here before its webhook has necessarily flipped the
  // tier. The server page sends paid users on to /dashboard, so just
  // re-fetch until the webhook lands instead of bouncing them back to a
  // paywall they already paid.
  const activating = checkoutStatus === "success";
  useEffect(() => {
    if (!activating) return;
    const id = setInterval(() => router.refresh(), 2000);
    return () => clearInterval(id);
  }, [activating, router]);

  // One line of copy per stated goal — the recap is what makes the paywall
  // feel like the end of the funnel rather than a wall.
  const pitch =
    goal === "challenge"
      ? region
        ? fill(t.pitch.challengeRegion, { region })
        : t.pitch.challenge
      : goal === "fitness" || goal === "photos" || goal === "discovery"
        ? t.pitch[goal]
        : null;
  const price =
    period === "monthly" ? PREMIUM_PRICE.monthly : PREMIUM_PRICE.yearly / 12;
  const chargeAfterTrial =
    period === "monthly"
      ? fill(t.thenMonthly, { amount: formatEuro(locale, PREMIUM_PRICE.monthly) })
      : fill(t.thenYearly, { amount: formatEuro(locale, PREMIUM_PRICE.yearly) });

  const recap = [
    level && { k: t.recapLevel, v: experience ? `${level} · ${experience}` : level },
    region && { k: t.recapArea, v: area ? `${area}, ${region}` : region },
    goalLabel && { k: t.recapGoal, v: goalLabel },
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <main className="flex min-h-screen flex-col bg-trail-950 px-6 pb-8 pt-6 text-white">
      <HtmlLang locale={locale} />
      <header className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link href={landingPath(locale)} className="font-display text-2xl tracking-wide">
          RANDO<span className="text-summit-400">RANK</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
          {t.step}
        </span>
      </header>

      <div className="mx-auto mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-full rounded-full bg-summit-500" />
      </div>

      <div className="mx-auto w-full max-w-md flex-1 py-8">
        <h1 className="font-display text-4xl leading-tight tracking-wide">
          {firstName ? fill(t.titleNamed, { name: firstName }) : t.title}
        </h1>
        {pitch && <p className="mt-2 text-sm text-white/70">{pitch}</p>}

        {recap.length > 0 && (
          <dl className="mt-6 divide-y divide-white/10 rounded-xl border border-white/15 bg-white/5">
            {recap.map((row) => (
              <div key={row.k} className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  {row.k}
                </dt>
                <dd className="text-right text-sm font-semibold">{row.v}</dd>
              </div>
            ))}
          </dl>
        )}

        {activating && (
          <p className="mt-4 rounded-lg bg-summit-500/15 px-3 py-2 text-sm text-summit-300">
            {t.activating}
          </p>
        )}
        {checkoutStatus === "canceled" && (
          <p className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/70">
            {t.canceled}
          </p>
        )}
        {checkoutStatus === "error" && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {t.error}
          </p>
        )}

        <div className="mt-6 rounded-2xl border border-summit-400 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-400">{t.planEyebrow}</p>
          <h2 className="mt-1 font-display text-3xl tracking-wide">{t.planName}</h2>
          <p className="text-sm italic text-white/50">{t.planTagline}</p>

          <div className="mt-5 inline-flex rounded-full border border-white/15 bg-white/5 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              className={`rounded-full px-4 py-1.5 transition ${
                period === "monthly" ? "bg-white text-trail-900" : "text-white/60"
              }`}
            >
              {t.monthly}
            </button>
            <button
              type="button"
              onClick={() => setPeriod("yearly")}
              className={`rounded-full px-4 py-1.5 transition ${
                period === "yearly" ? "bg-white text-trail-900" : "text-white/60"
              }`}
            >
              {t.yearly} <span className="text-summit-500">-{PREMIUM_YEARLY_SAVINGS_PERCENT}%</span>
            </button>
          </div>

          <p className="mt-4 inline-block rounded-full bg-summit-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-summit-300">
            {fill(t.trialBadge, { days: PREMIUM_TRIAL_DAYS })}
          </p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-5xl tracking-wide">{formatEuro(locale, price)}</span>
            <span className="text-white/50">{t.perMonth}</span>
          </div>
          <p className="text-xs text-white/50">{chargeAfterTrial}</p>

          <ul className="mt-5 space-y-2 text-sm">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-white/80">
                <span className="mt-0.5 text-summit-400" aria-hidden="true">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>

          <form action={createCheckoutSessionAction.bind(null, "premium", period)}>
            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
            >
              {fill(t.cta, { days: PREMIUM_TRIAL_DAYS })}
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-white/50">
            {t.cardNote}
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/40">
            <span aria-hidden="true">🔒</span>
            {t.secure}
          </p>
        </div>
      </div>
    </main>
  );
}
