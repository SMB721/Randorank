"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "RandoRank est-il gratuit ?",
    answer:
      "Oui : l'offre Freemium te permet de créer ton profil et de suivre tes stats de base gratuitement, sans limite de temps, avec 1 rando enregistrée ou importée par semaine. Les offres Premium et VIP débloquent les randos illimitées, la génération d'itinéraire, les statistiques avancées et des défis exclusifs — détail dans la section Offres ci-dessus.",
  },
  {
    question: "Comment fonctionne la génération d'itinéraire ?",
    answer:
      "Tu indiques la distance que tu veux réaliser (et éventuellement un point de départ ou un dénivelé max). RandoRank te propose un parcours réellement praticable, puis affine la proposition selon ton niveau et les infos de santé que tu renseignes dans ton profil, pour te suggérer un tracé adapté plutôt qu'un simple itinéraire générique.",
  },
  {
    question: "Est-ce que mes statistiques sont publiques ?",
    answer:
      "Tes statistiques détaillées restent privées et te servent avant tout à analyser ta propre progression. Seuls les kilomètres validés apparaissent dans le classement public, pour comparer ta progression à celle des autres randonneurs sans exposer le détail de tes sorties.",
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