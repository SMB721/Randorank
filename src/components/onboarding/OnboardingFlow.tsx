"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@/app/(site)/bienvenue/actions";
import { FRENCH_REGIONS } from "@/lib/supabase/types";
import {
  DISTANCE_OPTIONS,
  EXPERIENCE_OPTIONS,
  FREQUENCY_OPTIONS,
  GEAR_OPTIONS,
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  REFERRAL_OPTIONS,
  type Option,
  type OnboardingAnswers,
} from "@/lib/onboarding";

type Step = {
  title: string;
  subtitle: string;
  isValid: (a: OnboardingAnswers) => boolean;
};

const STEPS: Step[] = [
  {
    title: "On fait connaissance ?",
    subtitle: "Votre prénom, votre nom, et le pseudo qui s'affichera sur le classement.",
    isValid: (a) =>
      !!a.firstName.trim() && !!a.lastName.trim() && a.username.trim().length >= 2,
  },
  {
    title: "Votre niveau, en toute honnêteté.",
    subtitle: "Pas de jugement — le classement, lui, tranchera avec vos vrais kilomètres.",
    isValid: (a) => !!a.declaredLevel && !!a.experience,
  },
  {
    title: "Votre rythme de croisière.",
    subtitle: "Soyez sincère, personne ne compte. Enfin si, le classement.",
    isValid: (a) => !!a.frequency && !!a.typicalDistance,
  },
  {
    title: "Où marchez-vous d'habitude ?",
    subtitle: "Votre région alimente le classement régional. Le lieu précis est facultatif.",
    isValid: (a) => !!a.region,
  },
  {
    title: "Ce qui vous fait sortir.",
    subtitle: "Votre moteur, et de quoi on peut se servir pour suivre vos sorties.",
    isValid: (a) => !!a.goal && !!a.gear,
  },
  {
    title: "Comment nous avez-vous trouvés ?",
    subtitle: "Dernière question sur nous, promis.",
    isValid: (a) => !!a.referral,
  },
  {
    title: "Vos traces, votre vie privée.",
    subtitle: "Un tracé GPS peut révéler votre domicile. À vous de décider.",
    isValid: (a) => a.consent,
  },
];

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder-white/30 outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-400/20";

export default function OnboardingFlow({ initial }: { initial: OnboardingAnswers }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const canContinue = current.isValid(answers);

  function set<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function next() {
    if (!canContinue || loading) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    const result = await completeOnboardingAction(answers);
    if (!result.success) {
      setLoading(false);
      setError(result.error);
      // A taken username is the one error the user fixes on the first screen.
      if (result.error.includes("pseudo")) setStep(0);
      return;
    }
    router.push("/bienvenue/paywall");
    router.refresh();
  }

  // Steps with a single question advance on tap, like an app onboarding;
  // steps with several questions wait for "Continuer".
  function pick<K extends keyof OnboardingAnswers>(key: K, value: string, autoAdvance = false) {
    set(key, value as OnboardingAnswers[K]);
    if (autoAdvance) {
      setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 180);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-trail-950 px-6 pb-8 pt-6 text-white">
      <header className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-wide">
          RANDO<span className="text-summit-400">RANK</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
          {step + 1} / {STEPS.length}
        </span>
      </header>

      <div className="mx-auto mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-summit-500 transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <h1 className="font-display text-4xl leading-tight tracking-wide">{current.title}</h1>
        <p className="mt-2 text-sm text-white/60">{current.subtitle}</p>

        <div className="mt-8 space-y-3">
          {step === 0 && (
            <>
              <input
                className={inputClass}
                placeholder="Prénom"
                autoComplete="given-name"
                maxLength={50}
                value={answers.firstName}
                onChange={(e) => set("firstName", e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Nom"
                autoComplete="family-name"
                maxLength={50}
                value={answers.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Pseudo (classement)"
                maxLength={30}
                value={answers.username}
                onChange={(e) => set("username", e.target.value)}
              />
              <p className="text-xs text-white/40">
                Seul le pseudo est visible des autres. Prénom et nom restent privés.
              </p>
            </>
          )}

          {step === 1 && (
            <>
              <Group label="Votre niveau">
                <Choices compact options={LEVEL_OPTIONS} value={answers.declaredLevel} onPick={(v) => pick("declaredLevel", v)} />
              </Group>
              <Group label="Vous randonnez depuis">
                <Choices compact options={EXPERIENCE_OPTIONS} value={answers.experience} onPick={(v) => pick("experience", v)} />
              </Group>
            </>
          )}

          {step === 2 && (
            <>
              <Group label="Vos sorties">
                <Choices compact options={FREQUENCY_OPTIONS} value={answers.frequency} onPick={(v) => pick("frequency", v)} />
              </Group>
              <Group label="Votre sortie type">
                <Choices compact options={DISTANCE_OPTIONS} value={answers.typicalDistance} onPick={(v) => pick("typicalDistance", v)} />
              </Group>
            </>
          )}

          {step === 3 && (
            <>
              <select
                className={`${inputClass} appearance-none`}
                value={answers.region}
                onChange={(e) => set("region", e.target.value)}
              >
                <option value="" className="text-trail-900">
                  Choisissez votre région
                </option>
                {FRENCH_REGIONS.map((r) => (
                  <option key={r} value={r} className="text-trail-900">
                    {r}
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                placeholder="Massif, ville ou spot habituel (facultatif)"
                maxLength={80}
                value={answers.usualArea}
                onChange={(e) => set("usualArea", e.target.value)}
              />
            </>
          )}

          {step === 4 && (
            <>
              <Group label="Votre moteur">
                <Choices compact options={GOAL_OPTIONS} value={answers.goal} onPick={(v) => pick("goal", v)} />
              </Group>
              <Group label="Vous enregistrez vos sorties avec">
                <Choices compact options={GEAR_OPTIONS} value={answers.gear} onPick={(v) => pick("gear", v)} />
              </Group>
            </>
          )}

          {step === 5 && <Choices compact options={REFERRAL_OPTIONS} value={answers.referral} onPick={(v) => pick("referral", v, true)} />}

          {step === 6 && (
            <>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-orange-500"
                  checked={answers.blurEndpoints}
                  onChange={(e) => set("blurEndpoints", e.target.checked)}
                />
                <span className="text-sm">
                  <span className="font-semibold">Flouter mon départ et mon arrivée</span>
                  <span className="block text-white/50">
                    Recommandé : les premiers et derniers points de vos tracés ne sont pas
                    montrés. Modifiable à tout moment dans votre profil.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-orange-500"
                  checked={answers.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                />
                <span className="text-sm text-white/80">
                  J&apos;accepte que RandoRank traite mes traces GPS pour calculer mes stats,
                  mes défis et mon classement, conformément à la{" "}
                  <Link href="/mentions-legales#confidentialite" className="underline">
                    politique de confidentialité
                  </Link>
                  .
                </span>
              </label>
            </>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}
      </div>

      <footer className="mx-auto flex w-full max-w-md items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40"
          >
            Retour
          </button>
        )}
        <button
          type="button"
          onClick={next}
          disabled={!canContinue || loading}
          className="flex-1 rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Un instant..." : isLast ? "Terminer" : "Continuer"}
        </button>
      </footer>
    </main>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/40">{label}</p>
      {children}
    </div>
  );
}

function Choices({
  options,
  value,
  onPick,
  compact = false,
}: {
  options: Option[];
  value: string;
  onPick: (value: string) => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onPick(o.value)}
            className={`rounded-xl border px-3 py-3 text-left transition ${
              value === o.value
                ? "border-summit-400 bg-summit-500/15"
                : "border-white/15 bg-white/5 hover:border-white/40"
            }`}
          >
            <span className="block text-sm font-semibold">
              {o.emoji && <span aria-hidden="true">{o.emoji} </span>}
              {o.label}
            </span>
            {o.hint && <span className="mt-0.5 block text-xs text-white/50">{o.hint}</span>}
          </button>
        ))}
      </div>
    );
  }
  return (
    <>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onPick(o.value)}
          className={`flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition ${
            value === o.value
              ? "border-summit-400 bg-summit-500/15"
              : "border-white/15 bg-white/5 hover:border-white/40"
          }`}
        >
          {o.emoji && (
            <span className="text-2xl" aria-hidden="true">
              {o.emoji}
            </span>
          )}
          <span>
            <span className="block font-semibold">{o.label}</span>
            {o.hint && <span className="block text-sm text-white/50">{o.hint}</span>}
          </span>
        </button>
      ))}
    </>
  );
}
