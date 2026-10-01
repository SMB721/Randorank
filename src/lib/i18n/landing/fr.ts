import type { LandingDict } from "./types";

// Source of truth: copy moved verbatim from the original landing page.
export const fr: LandingDict = {
  meta: {
    title: "RandoRank — Chaque sentier devient un défi",
    description:
      "L'app de rando fun et communautaire : défis, classements et badges pour marcheurs et randonneurs.",
  },
  header: {
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    menuLabel: "Menu",
    login: "Connexion",
    signup: "Inscription",
    language: "Langue",
    links: {
      ranking: "Classement",
      navigation: "Navigation",
      offers: "Offres",
      faq: "FAQ",
      spots: "Spots & communauté",
      follow: "Suivez-nous",
    },
  },
  hero: {
    badge: "🥾 Rejoignez la communauté RandoRank",
    titleLine1: "Chaque sentier",
    titleLine2: "devient un défi.",
    subtitle:
      "Suivez vos randos, débloquez de nouveaux badges, grimpez au classement et partagez vos plus belles sorties.",
    ctaPrimary: "Créer mon profil",
    ctaSecondary: "J'ai déjà un compte",
    imageAlt: "Randonneur au sommet d'une crête face aux montagnes",
  },
  spots: {
    eyebrow: "Spots & communauté",
    title: "Vos spots. Vos repères.",
    text: "Forêt, lac d'altitude ou ascension entre amis : découvrez les spots partagés par la communauté et retrouvez les randonneurs qui vivent les mêmes levers de soleil que vous.",
    items: [
      {
        alt: "Randonneur sur un sentier forestier face aux montagnes",
        title: "Sous-bois",
        caption: "Sentiers ombragés",
      },
      {
        alt: "Randonneur face à un lac d'altitude entouré de sommets enneigés",
        title: "Lac d'altitude",
        caption: "Eaux turquoise",
      },
      {
        alt: "Groupe de randonneurs sur un sentier menant à un sommet rocheux",
        title: "Cimes en vue",
        caption: "Entre randonneurs",
      },
    ],
  },
  share: {
    eyebrow: "Partagez vos exploits",
    titleLine1: "Une fiche stylée.",
    titleLine2: "Prête pour vos stories.",
    text: "À la fin de chaque rando, RandoRank génère automatiquement une fiche visuelle avec votre tracé, vos stats et vos plus belles photos — pensée pour Instagram, TikTok et Facebook, pas pour dormir dans un tiroir.",
    shareOn: "Partagez sur",
    cta: "Créer ma première fiche",
    floatingTap: { label: "En un tap", value: "Prêt à partager" },
    floatingUnlocked: { label: "Débloqué", value: "Sommet du Diable" },
    imageAlt: "Fiche rando générée par RandoRank, prête à partager",
    date: "12.06.26",
    routeName: "Crête des Trois Sommets",
    stats: [
      { v: "14,2", u: "km" },
      { v: "+680", u: "m D+" },
      { v: "4h05", u: "durée" },
    ],
  },
  route: {
    eyebrow: "Générez votre parcours",
    titleLine1: "Indiquez votre distance.",
    titleLine2: "RandoRank prépare la suite.",
    text: "Renseignez la distance que vous êtes prêt·e à réaliser — et votre objectif si vous en avez un. RandoRank vous propose un parcours réellement praticable, puis l'ajuste selon votre niveau et les informations de santé de votre profil, pour vous suggérer un tracé adapté plutôt qu'un itinéraire générique.",
    cta: "Préparer mon itinéraire",
    floatingRoute: { label: "Itinéraire généré", value: "12 km" },
    floatingElevation: { label: "Dénivelé max", value: "+450 m" },
    level: "Niveau amateur",
    start: "Départ",
    end: "Arrivée",
    mapAlt: "Extrait de carte, secteur de Chamonix",
    distance: "Distance",
    distanceValue: "12 km",
    duration: "Durée estimée",
    durationValue: "3h15",
    startCta: "Démarrer la sortie",
  },
  ranking: {
    eyebrow: "Classement",
    titleLine1: "Chaque kilomètre",
    titleLine2: "compte.",
    text: "Les kilomètres réellement parcourus vous font grimper. Suivez votre position au classement, débloquez des badges et battez vos propres objectifs, ou ceux de vos amis.",
    floatingPosition: { label: "Votre position", value: "#3" },
    floatingNext: { label: "Pour passer #2", value: "6,4 km" },
    month: "Classement · Septembre 2026",
    tabs: { national: "National", region: "Région", friends: "Amis" },
    you: "Vous",
    kms: ["58,1 km", "48,5 km", "42,0 km", "39,7 km"],
  },
  community: {
    eyebrow: "Communauté en mouvement",
    title: "Ce n'est pas que des chiffres.",
    text: "C'est l'ensemble des kilomètres réellement parcourus, validés, par tous les randonneurs de RandoRank.",
    kmLabel: "Parcourus par la communauté",
    elevationLabel: "De dénivelé cumulé",
    chartLabel: "Kilomètres cumulés par semaine, communauté entière",
  },
  offers: {
    eyebrow: "Offres",
    title: "Le MUL. Point.",
    text: "Une seule offre, tout inclus : randos, tracés et photos illimités, classement complet. Le détail des tarifs s'affiche dès la création de votre profil.",
    cta: "Créer mon profil",
  },
  about: {
    eyebrow: "RandoRank en quelques mots",
    text: "RandoRank vous aide à préparer des itinéraires de randonnée selon votre niveau, à partager votre passion et à découvrir de nouveaux spots. Enregistrez chaque parcours, analysez vos randos et comparez-vous à vos amis comme à l'ensemble des randonneurs du site — par région, par département, jusqu'à l'échelle du pays.",
  },
  faq: {
    eyebrow: "Tout est clair",
    title: "Questions fréquentes",
    items: [
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
    ],
    disclaimer:
      "RandoRank vous donne des repères, pas des consignes de sécurité en montagne : vérifiez toujours la météo et vos propres capacités avant de partir.",
  },
  finalCta: {
    title: "Prêt·e à relever le premier défi ?",
    text: "Rejoignez les randonneurs qui suivent, partagent et progressent ensemble.",
    cta: "Créer mon profil",
    imageAlt: "Sentier forestier menant vers les montagnes",
  },
  footer: {
    tagline:
      "Le carnet de route des randonneurs : sorties, défis et classements entre passionnés.",
    navTitle: "Navigation",
    nav: {
      routes: "Itinéraires",
      analyses: "Analyses",
      rankings: "Classements",
      offers: "Offres",
      faq: "FAQ",
    },
    legalTitle: "Légal",
    legal: {
      notice: "Mentions légales",
      privacy: "Confidentialité",
      cookies: "Cookies",
      terms: "Conditions",
    },
    followTitle: "Suivez-nous",
    rights: "Tous droits réservés.",
  },
};
