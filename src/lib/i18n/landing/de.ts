import type { LandingDict } from "./types";

export const de: LandingDict = {
  meta: {
    title: "RandoRank — Jeder Pfad wird zur Herausforderung",
    description:
      "Die unterhaltsame Wander-App mit Community: Challenges, Ranglisten und Badges für Spaziergänger und Wanderer.",
  },
  header: {
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    menuLabel: "Menü",
    login: "Anmelden",
    signup: "Registrieren",
    language: "Sprache",
    links: {
      ranking: "Rangliste",
      navigation: "Navigation",
      offers: "Angebote",
      faq: "FAQ",
      spots: "Spots & Community",
      follow: "Folgen Sie uns",
    },
  },
  hero: {
    badge: "🥾 Werden Sie Teil der RandoRank-Community",
    titleLine1: "Jeder Pfad",
    titleLine2: "wird zur Herausforderung.",
    subtitle:
      "Zeichnen Sie Ihre Wanderungen auf, schalten Sie neue Badges frei, klettern Sie in der Rangliste und teilen Sie Ihre schönsten Touren.",
    ctaPrimary: "Mein Profil erstellen",
    ctaSecondary: "Ich habe schon ein Konto",
    imageAlt: "Wanderer auf einem Grat vor Bergkulisse",
  },
  spots: {
    eyebrow: "Spots & Community",
    title: "Ihre Spots. Ihre Orientierungspunkte.",
    text: "Wald, Bergsee oder Gipfelanstieg mit Freunden: Entdecken Sie die Spots der Community und finden Sie Wanderer, die dieselben Sonnenaufgänge erleben wie Sie.",
    items: [
      {
        alt: "Wanderer auf einem Waldweg vor Bergkulisse",
        title: "Unterholz",
        caption: "Schattige Pfade",
      },
      {
        alt: "Wanderer vor einem Bergsee, umgeben von schneebedeckten Gipfeln",
        title: "Bergsee",
        caption: "Türkisfarbenes Wasser",
      },
      {
        alt: "Wandergruppe auf einem Pfad zu einem felsigen Gipfel",
        title: "Gipfel in Sicht",
        caption: "Unter Wanderern",
      },
    ],
  },
  share: {
    eyebrow: "Zeigen Sie, was Sie draufhaben",
    titleLine1: "Eine Karte mit Stil.",
    titleLine2: "Bereit für Ihre Stories.",
    text: "Nach jeder Wanderung erstellt RandoRank automatisch eine Bildkarte mit Ihrer Route, Ihren Statistiken und Ihren schönsten Fotos — gemacht für Instagram, TikTok und Facebook, nicht für die Schublade.",
    shareOn: "Teilen auf",
    cta: "Meine erste Karte erstellen",
    floatingTap: { label: "Mit einem Tipp", value: "Bereit zum Teilen" },
    floatingUnlocked: { label: "Freigeschaltet", value: "Teufelsspitze" },
    imageAlt: "Von RandoRank erstellte Wanderkarte, bereit zum Teilen",
    date: "12.06.26",
    routeName: "Grat der Drei Gipfel",
    stats: [
      { v: "14,2", u: "km" },
      { v: "+680", u: "Hm" },
      { v: "4h05", u: "Dauer" },
    ],
  },
  route: {
    eyebrow: "Erstellen Sie Ihre Route",
    titleLine1: "Geben Sie Ihre Distanz an.",
    titleLine2: "RandoRank erledigt den Rest.",
    text: "Geben Sie an, wie weit Sie gehen möchten — und Ihr Ziel, falls Sie eines haben. RandoRank schlägt Ihnen eine wirklich begehbare Route vor und passt sie dann an Ihr Niveau und die Gesundheitsangaben in Ihrem Profil an, damit Sie eine passende Strecke erhalten statt einer generischen Tour.",
    cta: "Meine Route planen",
    floatingRoute: { label: "Route erstellt", value: "12 km" },
    floatingElevation: { label: "Max. Höhenunterschied", value: "+450 m" },
    level: "Niveau Amateur",
    start: "Start",
    end: "Ziel",
    mapAlt: "Kartenausschnitt, Region Chamonix",
    distance: "Distanz",
    distanceValue: "12 km",
    duration: "Geschätzte Dauer",
    durationValue: "3h15",
    startCta: "Tour starten",
  },
  ranking: {
    eyebrow: "Rangliste",
    titleLine1: "Jeder Kilometer",
    titleLine2: "zählt.",
    text: "Die Kilometer, die Sie wirklich gehen, bringen Sie nach oben. Verfolgen Sie Ihre Platzierung, schalten Sie Badges frei und schlagen Sie Ihre eigenen Ziele — oder die Ihrer Freunde.",
    floatingPosition: { label: "Ihre Platzierung", value: "#3" },
    floatingNext: { label: "Für Platz 2", value: "6,4 km" },
    month: "Rangliste · September 2026",
    tabs: { national: "National", region: "Region", friends: "Freunde" },
    you: "Sie",
    kms: ["58,1 km", "48,5 km", "42,0 km", "39,7 km"],
  },
  community: {
    eyebrow: "Community in Bewegung",
    title: "Das sind nicht nur Zahlen.",
    text: "Das sind alle tatsächlich gelaufenen, validierten Kilometer aller RandoRank-Wanderer.",
    kmLabel: "Von der Community zurückgelegt",
    elevationLabel: "Höhenmeter insgesamt",
    chartLabel: "Kilometer pro Woche, gesamte Community",
  },
  offers: {
    eyebrow: "Angebote",
    title: "Le MUL. Punkt.",
    text: "Ein Angebot, alles inklusive: unbegrenzt Wanderungen, Routen und Fotos, komplette Rangliste. Die Preise sehen Sie, sobald Sie Ihr Profil erstellt haben.",
    cta: "Mein Profil erstellen",
  },
  about: {
    eyebrow: "RandoRank in ein paar Worten",
    text: "RandoRank hilft Ihnen, Wanderrouten passend zu Ihrem Niveau zu planen, Ihre Leidenschaft zu teilen und neue Spots zu entdecken. Speichern Sie jede Tour, analysieren Sie Ihre Wanderungen und vergleichen Sie sich mit Freunden und allen Wanderern der Seite — nach Region, nach Département, bis hin zur nationalen Ebene.",
  },
  faq: {
    eyebrow: "Alles klar",
    title: "Häufige Fragen",
    items: [
      {
        question: "Kostet RandoRank etwas?",
        answer:
          "Ja: RandoRank funktioniert ausschließlich im Premium-Abo (monatlich oder jährlich, jederzeit kündbar). Sie haben Zugriff auf alles: unbegrenzt Wanderungen und Routen, Fotos, nationale und regionale Rangliste, Badges — die Preise werden bei der Erstellung Ihres Profils angezeigt.",
      },
      {
        question: "Wie funktioniert die Routenerstellung?",
        answer:
          "Sie geben die gewünschte Distanz an (und optional einen Startpunkt oder einen maximalen Höhenunterschied). RandoRank schlägt Ihnen eine wirklich begehbare Route vor und verfeinert den Vorschlag anhand Ihres Niveaus und der Gesundheitsangaben in Ihrem Profil, damit Sie eine passende Strecke erhalten statt einer einfachen, generischen Route.",
      },
      {
        question: "Sind meine Statistiken öffentlich?",
        answer:
          "Ihre detaillierten Statistiken bleiben privat und dienen vor allem dazu, Ihre eigene Entwicklung zu analysieren. Nur validierte Kilometer erscheinen in der öffentlichen Rangliste, damit Sie sich mit anderen Wanderern vergleichen können, ohne Details Ihrer Touren preiszugeben.",
      },
      {
        question: "Wie werden die Kilometer validiert?",
        answer:
          "Jede importierte oder aufgezeichnete Strecke durchläuft Plausibilitätsprüfungen: realistische Geschwindigkeit, zeitliche Kontinuität, Höhenmeter passend zum Gelände und Erkennung von Teleportationen. Ziel: eine Rangliste, die echte Touren abbildet und keine zusammengebastelten Dateien.",
      },
    ],
    disclaimer:
      "RandoRank gibt Ihnen Orientierung, keine Sicherheitsanweisungen für die Berge: Prüfen Sie vor dem Start immer das Wetter und Ihre eigenen Fähigkeiten.",
  },
  finalCta: {
    title: "Bereit für Ihre erste Herausforderung?",
    text: "Schließen Sie sich den Wanderern an, die gemeinsam aufzeichnen, teilen und besser werden.",
    cta: "Mein Profil erstellen",
    imageAlt: "Waldweg, der zu den Bergen führt",
  },
  footer: {
    tagline:
      "Das Tourenbuch der Wanderer: Touren, Challenges und Ranglisten unter Gleichgesinnten.",
    navTitle: "Navigation",
    nav: {
      routes: "Routen",
      analyses: "Analysen",
      rankings: "Ranglisten",
      offers: "Angebote",
      faq: "FAQ",
    },
    legalTitle: "Rechtliches",
    legal: {
      notice: "Impressum (FR)",
      privacy: "Datenschutz (FR)",
      cookies: "Cookies (FR)",
      terms: "Bedingungen (FR)",
    },
    followTitle: "Folgen Sie uns",
    rights: "Alle Rechte vorbehalten.",
  },
};
