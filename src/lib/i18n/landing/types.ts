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
      how: string;
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
    cta: string;
    ctaNote: string;
    imageAlt: string;
    liveBadge: string;
    stickyCta: string;
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
    tabs: { national: string; friends: string };
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
  howItWorks: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: { tag: string; title: string; text: string }[];
    preview: {
      distance: string; // label above the km value in the route preview
      level: string; // "Amateur" chip
      ready: string; // "loop ready" line under the mini map
      recording: string; // live badge
      elevation: string; // "D+" label
      ranking: string; // ranking card title
      you: string; // the visitor's own row
      places: string; // "{n}" is replaced, e.g. "+47 places"
    };
    cta: string;
    ctaNote: string;
  };
  badges: { eyebrow: string; title: string; text: string; locked: string };
  challenge: {
    eyebrow: string;
    title: string;
    text: string;
    example: string;
    progress: string; // "{done}" and "{goal}" are replaced
  };
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
    nav: { routes: string; analyses: string; rankings: string; how: string; faq: string };
    legalTitle: string;
    legal: { notice: string; privacy: string; cookies: string; terms: string };
    followTitle: string;
    rights: string;
  };
}
