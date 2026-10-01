type Pair = { label: string; value: string };

export interface LandingDict {
  meta: { title: string; description: string };
  header: {
    openMenu: string;
    closeMenu: string;
    menuLabel: string;
    login: string;
    signup: string;
    language: string;
    links: {
      ranking: string;
      navigation: string;
      offers: string;
      faq: string;
      spots: string;
      follow: string;
    };
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    imageAlt: string;
  };
  spots: {
    eyebrow: string;
    title: string;
    text: string;
    items: { alt: string; title: string; caption: string }[];
  };
  share: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    text: string;
    shareOn: string;
    cta: string;
    floatingTap: Pair;
    floatingUnlocked: Pair;
    imageAlt: string;
    date: string;
    routeName: string;
    stats: { v: string; u: string }[];
  };
  route: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    text: string;
    cta: string;
    floatingRoute: Pair;
    floatingElevation: Pair;
    level: string;
    start: string;
    end: string;
    mapAlt: string;
    distance: string;
    distanceValue: string;
    duration: string;
    durationValue: string;
    startCta: string;
  };
  ranking: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    text: string;
    floatingPosition: Pair;
    floatingNext: Pair;
    month: string;
    tabs: { national: string; region: string; friends: string };
    you: string;
    kms: string[];
  };
  community: {
    eyebrow: string;
    title: string;
    text: string;
    kmLabel: string;
    elevationLabel: string;
    chartLabel: string;
  };
  offers: { eyebrow: string; title: string; text: string; cta: string };
  about: { eyebrow: string; text: string };
  faq: {
    eyebrow: string;
    title: string;
    items: { question: string; answer: string }[];
    disclaimer: string;
  };
  finalCta: { title: string; text: string; cta: string; imageAlt: string };
  footer: {
    tagline: string;
    navTitle: string;
    nav: { routes: string; analyses: string; rankings: string; offers: string; faq: string };
    legalTitle: string;
    legal: { notice: string; privacy: string; cookies: string; terms: string };
    followTitle: string;
    rights: string;
  };
}
