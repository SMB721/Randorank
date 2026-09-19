"use client";

import { useState } from "react";
import Link from "next/link";
import { createCheckoutSessionAction } from "@/app/actions/subscription";
import type { PaidTier } from "@/lib/stripe";

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
  features: string[];
  cta: string;
};

const tiers: Tier[] = [
  {
    name: "Freemium",
    nickname: "Le Monchu",
    tagline: "Le citadin suréquipé, mais un peu perdu.",
    hook: "Pour découvrir RandoRank",
    price: "free",
    features: [
      "Profil et badges de base",
      "1 rando enregistrée ou importée par semaine",
      "Historique avec carte du tracé",
      "Statistiques de base (distance, D+, durée, vitesse)",
      "Classement et défis de lancement",
      "Jusqu'à 3 photos par rando",
    ],
    cta: "Commencer gratuitement",
  },
  {
    name: "Premium",
    nickname: "Le MUL",
    tagline: "L'obsédé de l'optimisation et de la performance.",
    hook: "🔓 Randos et génération de tracé ILLIMITÉES",
    price: { monthly: 6.99, yearly: 59 },
    paidTier: "premium",
    highlight: true,
    features: [
      "Tout Freemium, plus :",
      "Randos illimitées (GPS direct et import)",
      "Génération de tracé illimitée selon distance et niveau",
      "Statistiques avancées et comparaisons",
      "Photos illimitées + fiche rando complète",
      "Visuel de partage HD personnalisable",
      "Badges et défis Premium exclusifs",
    ],
    cta: "Devenir Le MUL",
  },
  {
    name: "VIP",
    nickname: "Le Thru-Hiker",
    tagline: "Le puriste qui vit l'expérience à 100%.",
    hook: "🔓 Comparaison nationale détaillée + itinéraires multi-jours",
    price: { monthly: 12.99, yearly: 109 },
    paidTier: "vip",
    dark: true,
    features: [
      "Tout Premium, plus :",
      "Comparaison avancée par région, département et pays",
      "Génération d'itinéraires multi-jours",
      "Défis VIP avec récompenses et titres exclusifs",
      "Accès anticipé aux nouvelles fonctionnalités",
      "Support prioritaire",
    ],
    cta: "Devenir Thru-Hiker",
  },
];

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
            <span className="ml-1 text-summit-500">-2 mois</span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
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
            {tier.price !== "free" && (
              <p
                className={`mt-1 text-xs font-semibold ${
                  tier.dark ? "text-summit-400" : "text-summit-600"
                }`}
              >
                5 jours d&apos;essai gratuit, sans engagement
              </p>
            )}

            <ul className="mt-6 flex-1 space-y-3 text-sm">
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

            {tier.paidTier ? (
              <form action={createCheckoutSessionAction.bind(null, tier.paidTier, period)}>
                <button
                  type="submit"
                  className={`mt-8 w-full rounded-xl px-6 py-3 text-center text-sm font-semibold transition ${
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
                className="mt-8 rounded-xl border-2 border-trail-900 px-6 py-3 text-center text-sm font-semibold text-trail-900 transition hover:bg-trail-900 hover:text-white"
              >
                {tier.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-trail-400">
        Paiement sécurisé par Stripe. Résiliable à tout moment depuis ton profil.
      </p>
    </div>
  );
}