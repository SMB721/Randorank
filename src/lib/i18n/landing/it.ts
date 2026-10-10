import type { LandingDict } from "./types";

export const it: LandingDict = {
  meta: {
    title: "RandoRank — Ogni sentiero diventa una sfida",
    description:
      "L'app di escursionismo divertente e social: sfide, classifiche e badge per camminatori ed escursionisti.",
  },
  header: {
    openMenu: "Apri il menu",
    closeMenu: "Chiudi il menu",
    menuLabel: "Menu",
    login: "Accesso",
    signup: "Registrazione",
    language: "Lingua",
    links: {
      ranking: "Classifica",
      navigation: "Navigazione",
      how: "Come funziona",
      faq: "FAQ",
      spots: "Spot e community",
      follow: "Ci segua",
    },
  },
  hero: {
    badge: "🥾 Entri nella community RandoRank",
    titleLine1: "Ogni sentiero",
    titleLine2: "diventa una sfida.",
    subtitle:
      "Registri le sue escursioni, sblocchi nuovi badge, scali la classifica e condivida le sue uscite più belle.",
    cta: "Iniziare la salita",
    ctaNote: "Senza account, senza carta di credito · Scelga un nickname e via",
    imageAlt: "Escursionista su una cresta di fronte alle montagne",
    liveBadge: "{km} km percorsi dalla community",
    stickyCta: "Si parte, basta un nickname",
  },
  spots: {
    eyebrow: "Spot e community",
    title: "I suoi spot. I suoi punti di riferimento.",
    text: "Bosco, lago d'alta quota o salita in compagnia: scopra gli spot condivisi dalla community e ritrovi gli escursionisti che vedono le sue stesse albe.",
    items: [
      {
        alt: "Escursionista su un sentiero nel bosco di fronte alle montagne",
        title: "Sottobosco",
        caption: "Sentieri ombreggiati",
      },
      {
        alt: "Escursionista davanti a un lago d'alta quota circondato da vette innevate",
        title: "Lago d'alta quota",
        caption: "Acque turchesi",
      },
      {
        alt: "Gruppo di escursionisti su un sentiero verso una vetta rocciosa",
        title: "Cime in vista",
        caption: "Tra escursionisti",
      },
    ],
  },
  share: {
    eyebrow: "Condivida le sue imprese",
    titleLine1: "Una scheda in stile.",
    titleLine2: "Pronta per le sue storie.",
    text: "Alla fine di ogni escursione, RandoRank genera automaticamente una scheda visiva con il suo percorso, le sue statistiche e le sue foto più belle — pensata per Instagram, TikTok e Facebook, non per finire in un cassetto.",
    shareOn: "Condivida su",
    cta: "Crea la mia prima scheda",
    floatingTap: { label: "Con un tap", value: "Pronta da condividere" },
    floatingUnlocked: { label: "Sbloccato", value: "Cima del Diavolo" },
    imageAlt: "Scheda escursione generata da RandoRank, pronta da condividere",
    date: "12.06.26",
    routeName: "Cresta delle Tre Cime",
    stats: [
      { v: "14,2", u: "km" },
      { v: "+680", u: "m D+" },
      { v: "4h05", u: "durata" },
    ],
  },
  route: {
    eyebrow: "Generi il suo percorso",
    titleLine1: "Indichi la distanza.",
    titleLine2: "A tutto il resto pensa RandoRank.",
    text: "Inserisca la distanza che si sente di percorrere — e il suo obiettivo, se ne ha uno. RandoRank le propone un percorso davvero percorribile, poi ne indica la difficoltà (principiante, amatore o avanzato) in base a distanza e dislivello, così sa cosa aspettarsi.",
    cta: "Prepara il mio itinerario",
    floatingRoute: { label: "Itinerario generato", value: "12 km" },
    floatingElevation: { label: "Dislivello max", value: "+450 m" },
    level: "Livello amatore",
    start: "Partenza",
    end: "Arrivo",
    mapAlt: "Estratto di mappa, zona di Chamonix",
    distance: "Distanza",
    distanceValue: "12 km",
    duration: "Durata stimata",
    durationValue: "3h15",
    startCta: "Iniziare l'uscita",
  },
  ranking: {
    eyebrow: "Classifica",
    titleLine1: "Ogni chilometro",
    titleLine2: "conta.",
    text: "I chilometri realmente percorsi la fanno salire. Segua la sua posizione in classifica, sblocchi badge e batta i suoi obiettivi, o quelli dei suoi amici.",
    floatingPosition: { label: "La sua posizione", value: "#3" },
    floatingNext: { label: "Per superare il #2", value: "6,4 km" },
    month: "Classifica · Settembre 2026",
    tabs: { national: "Nazionale", region: "Regione", friends: "Amici" },
    you: "Lei",
    kms: ["58,1 km", "48,5 km", "42,0 km", "39,7 km"],
  },
  community: {
    eyebrow: "Community in movimento",
    title: "Non sono solo numeri.",
    text: "Sono tutti i chilometri realmente percorsi e validati da tutti gli escursionisti di RandoRank.",
    kmLabel: "Percorsi dalla community",
    elevationLabel: "Di dislivello cumulato",
    chartLabel: "Chilometri cumulati a settimana, intera community",
  },
  howItWorks: {
    eyebrow: "Come funziona",
    title: "Tre passi. Zero complicazioni.",
    steps: [
      { title: "Parta per un'escursione", text: "Scelga la sua uscita o lasci che RandoRank le proponga un anello su misura." },
      { title: "Salga in classifica", text: "Ogni chilometro conta: salga nella classifica della sua regione e del paese, in versione divertente." },
      { title: "Punti più in alto", text: "Generi un percorso su misura per nuove sfide, ottenga badge e condivida le sue imprese." },
    ],
  },
  badges: {
    eyebrow: "Badge",
    title: "Li collezioni tutti.",
    text: "Primi passi, polpacci in forma, re delle cime: ogni traguardo sblocca un badge. Alcuni sono più difficili di altri.",
    locked: "Da sbloccare",
  },
  challenge: {
    eyebrow: "Sfida del mese",
    title: "Un mese. Un obiettivo.",
    text: "Ogni mese nuove sfide: dislivello, numero di uscite, distanza. I suoi progressi si aggiornano a ogni escursione convalidata.",
    example: "esempio",
    progress: "{done} di {goal} m di dislivello",
  },
  about: {
    eyebrow: "RandoRank in poche parole",
    text: "RandoRank la aiuta a preparare itinerari di escursionismo in base al suo livello, a condividere la sua passione e a scoprire nuovi spot. Registri ogni percorso, analizzi le sue uscite e si confronti con i suoi amici e con tutti gli escursionisti del sito — per regione, per dipartimento, fino a livello nazionale.",
  },
  faq: {
    eyebrow: "Tutto chiaro",
    title: "Domande frequenti",
    items: [
      {
        question: "RandoRank è a pagamento?",
        answer:
          "Non per iniziare: il tracciamento delle uscite, le classifiche, i badge e una sfida sono gratuiti, senza account né carta di credito. Premium (mensile o annuale, prova gratuita, disdicibile in qualsiasi momento) sblocca percorsi illimitati, tutte le sfide, foto illimitate e la scheda di condivisione senza filigrana.",
      },
      {
        question: "Come funziona la generazione dell'itinerario?",
        answer:
          "Indica la distanza che desidera percorrere (e, se vuole, un punto di partenza o un dislivello massimo). RandoRank le propone un percorso davvero percorribile, poi ne indica la difficoltà (principiante, amatore o avanzato) in base a distanza e dislivello, così sa cosa aspettarsi. Non viene richiesto alcun dato sanitario.",
      },
      {
        question: "Le mie statistiche sono pubbliche?",
        answer:
          "Le sue statistiche dettagliate restano private e le servono soprattutto per analizzare i suoi progressi. Solo i chilometri validati compaiono nella classifica pubblica, per confrontare i suoi progressi con quelli degli altri escursionisti senza esporre il dettaglio delle sue uscite.",
      },
      {
        question: "Come vengono validati i chilometri?",
        answer:
          "Ogni traccia importata o registrata passa controlli di coerenza: velocità plausibile, continuità nel tempo, dislivello coerente con il rilievo e rilevamento dei «teletrasporti». Obiettivo: una classifica che rifletta uscite vere, non file truccati.",
      },
    ],
    disclaimer:
      "RandoRank le dà dei punti di riferimento, non istruzioni di sicurezza in montagna: controlli sempre il meteo e le sue capacità prima di partire.",
  },
  finalCta: {
    title: "La sua prima sfida la aspetta.",
    text: "Si unisca agli escursionisti che registrano, condividono e migliorano insieme.",
    cta: "Iniziare la salita",
    imageAlt: "Sentiero nel bosco che porta verso le montagne",
  },
  footer: {
    tagline:
      "Il diario di viaggio degli escursionisti: uscite, sfide e classifiche tra appassionati.",
    navTitle: "Navigazione",
    nav: {
      routes: "Itinerari",
      analyses: "Analisi",
      rankings: "Classifiche",
      how: "Come funziona",
      faq: "FAQ",
    },
    legalTitle: "Legale",
    legal: {
      notice: "Note legali (FR)",
      privacy: "Privacy (FR)",
      cookies: "Cookie (FR)",
      terms: "Condizioni (FR)",
    },
    followTitle: "Ci segua",
    rights: "Tutti i diritti riservati.",
  },
};
