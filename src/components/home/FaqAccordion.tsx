"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "RandoRank est-il payant ?",
    answer:
      "Oui : RandoRank fonctionne uniquement sur abonnement Premium (mensuel ou annuel, résiliable à tout moment). Vous avez accès à tout : randos et tracés illimités, photos, classement national et régional, badges — détail des tarifs affiché à la création de votre profil.",
  },
  {
    question: "Comment fonctionne la génération d'itinéraire ?",
    answer:
      "Vous indiquez la distance que vous voulez réaliser (et éventuellement un point de départ ou un dénivelé max). RandoRank vous propose un parcours réellement praticable, puis affine la proposition selon votre niveau et les infos de santé que vous renseignez dans votre profil, pour vous suggérer un tracé adapté plutôt qu'un simple itinéraire générique.",
  },
  {
    question: "Est-ce que mes statistiques sont publiques ?",
    answer:
      "Vos statistiques détaillées restent privées et vous servent avant tout à analyser votre propre progression. Seuls les kilomètres validés apparaissent dans le classement public, pour comparer votre progression à celle des autres randonneurs sans exposer le détail de vos sorties.",
  },
  {
    question: "Comment les kilomètres sont-ils validés ?",
    answer:
      "Chaque trace importée ou enregistrée passe par des contrôles de cohérence : vitesse plausible, continuité dans le temps, dénivelé cohérent avec le relief, et détection des téléportations. Objectif : un classement qui reflète de vraies sorties, pas des fichiers bricolés.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl divide-y divide-trail-200 rounded-2xl border border-trail-200 bg-white">
      {faqItems.map((item, index) => {
        const isOpen = index === openIndex;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-semibold text-trail-900">{item.question}</span>
              <span
                aria-hidden="true"
                className={`shrink-0 text-xl text-summit-500 transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="px-6 pb-5 text-sm leading-relaxed text-trail-700">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}