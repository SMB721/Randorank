// Single source of truth for the displayed Premium price, so the pricing
// section and the funnel paywall can't drift apart. The amounts actually
// charged live in Stripe (see PRICE_IDS in lib/stripe.ts).
export const PREMIUM_PRICE = { monthly: 6.99, yearly: 59 } as const;

// Card-required free trial, applied through Stripe at checkout. Seven days so
// the trial always spans a weekend, when most hikes happen.
export const PREMIUM_TRIAL_DAYS = 7;

export const PREMIUM_YEARLY_SAVINGS_PERCENT = Math.round(
  (1 - PREMIUM_PRICE.yearly / (PREMIUM_PRICE.monthly * 12)) * 100
);

export const PREMIUM_FEATURES = [
  "Randos illimitées : GPS en direct et import GPX",
  "Générateur de tracé illimité",
  "Photos illimitées et fiche de partage automatique",
  "Classement national et régional en entier",
  "Badges, défis et niveaux",
  "Historique complet de vos sorties",
];
