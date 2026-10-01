type Opt = { label: string; hint?: string };

export interface FunnelDict {
  auth: {
    imageAlt: string;
    backHome: string;
    signupTitle: string;
    loginTitle: string;
    signupSubtitle: string;
    loginSubtitle: string;
    tabSignup: string;
    tabLogin: string;
    google: string;
    facebook: string;
    or: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    hidePassword: string;
    showPassword: string;
    strengthTitle: string;
    strength: { empty: string; weak: string; medium: string; strong: string };
    checks: { chars: string; upper: string; digit: string };
    termsBefore: string;
    termsConditions: string;
    termsMiddle: string;
    termsPrivacy: string;
    submitLoading: string;
    submitSignup: string;
    submitLogin: string;
    accountCreated: string;
    genericError: string;
  };
  onboarding: {
    metaTitle: string;
    steps: { title: string; subtitle: string }[];
    firstName: string;
    lastName: string;
    username: string;
    usernameHint: string;
    groupLevel: string;
    groupExperience: string;
    groupFrequency: string;
    groupDistance: string;
    regionPlaceholder: string;
    areaPlaceholder: string;
    groupGoal: string;
    groupGear: string;
    blurTitle: string;
    blurText: string;
    consentBefore: string;
    consentLink: string;
    consentAfter: string;
    back: string;
    loading: string;
    finish: string;
    next: string;
    options: {
      level: Record<"debutant" | "amateur" | "avance", Opt>;
      experience: Record<"lt_1y" | "1_3y" | "3_10y" | "gt_10y", Opt>;
      frequency: Record<"lt_1" | "1_2" | "3_4" | "gt_5", Opt>;
      goal: Record<"challenge" | "fitness" | "photos" | "discovery", Opt>;
      distance: Record<"lt_10" | "10_20" | "20_30" | "gt_30", Opt>;
      gear: Record<"gps_watch" | "phone_app" | "none", Opt>;
      referral: Record<"friends" | "instagram" | "tiktok" | "strava" | "search" | "other", Opt>;
    };
    errors: {
      notLoggedIn: string;
      nameRequired: string;
      nameTooLong: string;
      usernameLength: string;
      level: string;
      experience: string;
      frequency: string;
      region: string;
      areaTooLong: string;
      goal: string;
      distance: string;
      gear: string;
      referral: string;
      consent: string;
      usernameTaken: string;
      saveFailed: string;
    };
  };
  paywall: {
    metaTitle: string;
    step: string;
    title: string;
    titleNamed: string; // "{name}" is replaced
    recapLevel: string;
    recapArea: string;
    recapGoal: string;
    pitch: {
      challengeRegion: string; // "{region}" is replaced
      challenge: string;
      fitness: string;
      photos: string;
      discovery: string;
    };
    activating: string;
    canceled: string;
    error: string;
    planEyebrow: string;
    planName: string;
    planTagline: string;
    monthly: string;
    yearly: string;
    trialBadge: string; // "{days}" is replaced
    perMonth: string;
    thenMonthly: string; // "{amount}" is replaced
    thenYearly: string;
    features: string[];
    cta: string; // "{days}" is replaced
    cardNote: string;
    secure: string;
  };
}
