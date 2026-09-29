"use client";

import { useState } from "react";
import Link from "next/link";
import { createCheckoutSessionAction } from "@/app/actions/subscription";
import type { PaidTier } from "@/lib/stripe";
import { PREMIUM_PRICE } from "@/lib/pricing";

type Period = "monthly" | "yearly";

type Tier = {
  name: string;
  nickname: string;
  tagline: string;
  hook: string;
  price: { monthly: number; yearly: number } | "free";
  paidTier?: PaidTier;
  highlight?: boolean;
  dark?: boolean;
  quickStats?: { label: string; value: string }[];
  features: string[];
  cta: string;
};

const tiers: Tier[] = [
  {
    name: "Premium",
    nickname: "Le MUL",
    tagline: "L'obsédé de l'optimisation et de la performance.",
    hook: "🔓 Randos et génération de tracé ILLIMITÉES",
    price: PREMIUM_PRICE,
    paidTier: "premium",
    highlight: true,
    quickStats: [
      { label: "Randos", value: "Illimitées" },
      { label: "Tracés", value: "Illimités" },
      { label: "Photos", value: "Illimitées" },
    ],
    features: [
      "Enregistrement GPS en direct et import GPX",
      "Fiche de partage automatique",
      "Randos, tracés et photos illimités",
      "Historique complet",
      "Classement national et régional en entier",
      "Badge « Le MUL » sur le classement",
      "Accès anticipé et support prioritaire",
    ],
    cta: "Devenir Le MUL",
  },
];

// Derived from Premium's own numbers rather than hardcoded, so the badge
// can't drift out of sync if the price ever changes.
const premiumTier = tiers.find((t) => t.price !== "free");
const yearlySavingsPercent =
  premiumTier && premiumTier.price !== "free"
    ? Math.round((1 - premiumTier.price.yearly / (premiumTier.price.monthly * 12)) * 100)
    : 0;

export default function PricingSection() {
  const [period, setPeriod] = useState<Period>("monthly");

  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-trail-200 bg-white p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`rounded-full px-5 py-2 transition ${
              period === "monthly" ? "bg-trail-900 text-white" : "text-trail-600"
            }`}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setPeriod("yearly")}
            className={`rounded-full px-5 py-2 transition ${
              period === "yearly" ? "bg-trail-900 text-white" : "text-trail-600"
            }`}
          >
            Annuel
            <span className="ml-1 text-summit-500">-{yearlySavingsPercent}%</span>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-md gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border p-8 ${
              tier.dark
                ? "border-trail-900 bg-trail-900 text-white"
                : tier.highlight
                ? "border-summit-400 bg-white shadow-xl shadow-summit-500/10"
                : "border-trail-200 bg-white"
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-summit-500 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Le plus populaire
              </span>
            )}

            <p
              className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                tier.dark ? "text-summit-400" : "text-summit-600"
              }`}
            >
              {tier.name}
            </p>
            <h3
              className={`mt-1 font-display text-3xl tracking-wide ${
                tier.dark ? "text-white" : "text-trail-900"
              }`}
            >
              {tier.nickname}
            </h3>
            <p className={`mt-1 text-sm italic ${tier.dark ? "text-white/60" : "text-trail-500"}`}>
              {tier.tagline}
            </p>

            {tier.hook && (
              <p
                className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${
                  tier.dark
                    ? "bg-summit-400/15 text-summit-300"
                    : tier.highlight
                    ? "bg-summit-100 text-summit-700"
                    : "bg-trail-50 text-trail-700"
                }`}
              >
                {tier.hook}
              </p>
            )}

            <div className="mt-6 flex items-baseline gap-1">
              {tier.price === "free" ? (
                <span className="font-display text-4xl tracking-wide">Gratuit</span>
              ) : (
                <>
                  <span className="font-display text-4xl tracking-wide">
                    {(period === "monthly" ? tier.price.monthly : tier.price.yearly / 12).toFixed(2)}€
                  </span>
                  <span className={tier.dark ? "text-white/50" : "text-trail-400"}>/mois</span>
                </>
              )}
            </div>
            {tier.price !== "free" && period === "yearly" && (
              <p className={`text-xs ${tier.dark ? "text-white/50" : "text-trail-400"}`}>
                Facturé {tier.price.yearly}€ / an
              </p>
            )}

            {tier.quickStats && (
              <div className="mt-6 grid grid-cols-3 gap-2">
                {tier.quickStats.map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-xl px-2 py-3 text-center ${
                      tier.dark ? "bg-white/10" : "bg-trail-50"
                    }`}
                  >
                    <p
                      className={`text-[0.65rem] font-semibold uppercase tracking-wide ${
                        tier.dark ? "text-white/50" : "text-trail-400"
                      }`}
                    >
                      {stat.label}
                    </p>
                    <p
                      className={`mt-0.5 text-sm font-semibold ${
                        tier.dark ? "text-white" : "text-trail-900"
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {tier.paidTier ? (
              <form action={createCheckoutSessionAction.bind(null, tier.paidTier, period)}>
                <button
                  type="submit"
                  className={`mt-6 w-full rounded-xl px-6 py-3 text-center text-sm font-semibold transition ${
                    tier.dark
                      ? "bg-white text-trail-900 hover:bg-white/90"
                      : tier.highlight
                      ? "bg-summit-500 text-white shadow-lg shadow-summit-500/30 hover:bg-summit-600"
                      : "border-2 border-trail-900 text-trail-900 hover:bg-trail-900 hover:text-white"
                  }`}
                >
                  {tier.cta}
                </button>
              </form>
            ) : (
              <Link
                href="/auth"
                className="mt-6 rounded-xl border-2 border-trail-900 px-6 py-3 text-center text-sm font-semibold text-trail-900 transition hover:bg-trail-900 hover:text-white"
              >
                {tier.cta}
              </Link>
            )}

            {tier.price !== "free" && (
              <p
                className={`mt-3 flex items-center justify-center gap-1.5 text-xs ${
                  tier.dark ? "text-white/50" : "text-trail-400"
                }`}
              >
                <span aria-hidden="true">🔒</span>
                Paiement sécurisé par Stripe, résiliable à tout moment
              </p>
            )}

            <p
              className={`mt-6 text-[0.65rem] font-semibold uppercase tracking-widest ${
                tier.dark ? "text-white/40" : "text-trail-400"
              }`}
            >
              Inclus dans {tier.nickname}
            </p>
            <ul className="mt-3 flex-1 space-y-3 text-sm">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 ${tier.dark ? "text-summit-400" : "text-summit-500"}`}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span className={tier.dark ? "text-white/80" : "text-trail-700"}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}