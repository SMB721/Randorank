// Pure helpers for the weekly summary e-mail: computing the week's numbers
// and rendering the message in the 5 site languages. No imports from the
// app, so it can be tested on its own.

export type EmailLocale = "fr" | "en" | "it" | "es" | "de";

export type WeekHike = { distance_km: number; elevation_gain_m: number | null };

export type WeeklySummaryData = {
  firstName: string | null;
  hikes: number;
  distanceKm: number;
  elevationM: number;
  /** National rank (1 = first) or null when the member is not ranked. */
  rank: number | null;
  /** Kilometres still needed to pass the next member, or null. */
  kmToNext: number | null;
};

export function summarizeWeek(
  hikes: WeekHike[],
  ranking: { rank: number | null; ownKm: number; nextKm: number | null },
  firstName: string | null
): WeeklySummaryData {
  const distanceKm = hikes.reduce((sum, h) => sum + Number(h.distance_km || 0), 0);
  const elevationM = hikes.reduce((sum, h) => sum + Number(h.elevation_gain_m || 0), 0);
  const rank = ranking.rank && ranking.rank > 0 ? ranking.rank : null;
  const gap = ranking.nextKm !== null ? ranking.nextKm - ranking.ownKm : null;
  return {
    firstName,
    hikes: hikes.length,
    distanceKm: Math.round(distanceKm * 10) / 10,
    elevationM: Math.round(elevationM),
    rank,
    // Never promise "0 km to go": at least 0.1 km, one decimal.
    kmToNext: rank !== null && rank > 1 && gap !== null && gap >= 0 ? Math.max(0.1, Math.round(gap * 10) / 10) : null,
  };
}

type Copy = {
  confirmSubject: string;
  confirmIntro: string;
  confirmCta: string;
  confirmIgnore: string;
  subjectActive: (km: string) => string;
  subjectQuiet: string;
  hello: (name: string | null) => string;
  activeIntro: string;
  quietIntro: string;
  statHikes: string;
  statKm: string;
  statElevation: string;
  rankLine: (rank: number) => string;
  nextLine: (km: string) => string;
  ctaActive: string;
  ctaQuiet: string;
  footer: string;
  unsubscribe: string;
};

const COPY: Record<EmailLocale, Copy> = {
  fr: {
    confirmSubject: "Confirmez votre résumé hebdomadaire RandoRank",
    confirmIntro: "Vous avez demandé à recevoir un résumé de vos randos chaque semaine. Confirmez votre adresse pour l'activer.",
    confirmCta: "Confirmer mon adresse",
    confirmIgnore: "Si ce n'est pas vous, ignorez simplement ce message : rien ne sera envoyé.",
    subjectActive: (km) => `Votre semaine : ${km} km au compteur`,
    subjectQuiet: "Une rando cette semaine ? Votre classement vous attend",
    hello: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
    activeIntro: "Voici votre semaine sur RandoRank.",
    quietIntro: "Pas de sortie enregistrée ces 7 derniers jours. Une petite boucle ce week-end ?",
    statHikes: "sorties",
    statKm: "km",
    statElevation: "m de D+",
    rankLine: (r) => `Vous êtes n°${r} au classement national.`,
    nextLine: (km) => `Il vous manque ${km} km pour passer devant le suivant.`,
    ctaActive: "Voir mon classement",
    ctaQuiet: "Générer ma prochaine boucle",
    footer: "Vous recevez ce message parce que vous avez activé le résumé hebdomadaire dans votre profil RandoRank.",
    unsubscribe: "Se désabonner",
  },
  en: {
    confirmSubject: "Confirm your RandoRank weekly summary",
    confirmIntro: "You asked to receive a summary of your hikes every week. Confirm your address to turn it on.",
    confirmCta: "Confirm my address",
    confirmIgnore: "If this wasn't you, just ignore this message: nothing will be sent.",
    subjectActive: (km) => `Your week: ${km} km on the clock`,
    subjectQuiet: "A hike this week? Your ranking is waiting",
    hello: (n) => (n ? `Hi ${n},` : "Hi,"),
    activeIntro: "Here is your week on RandoRank.",
    quietIntro: "No hike recorded in the last 7 days. A short loop this weekend?",
    statHikes: "hikes",
    statKm: "km",
    statElevation: "m gain",
    rankLine: (r) => `You are #${r} on the national leaderboard.`,
    nextLine: (km) => `You need ${km} km to pass the next hiker.`,
    ctaActive: "See my ranking",
    ctaQuiet: "Generate my next loop",
    footer: "You get this message because you turned on the weekly summary in your RandoRank profile.",
    unsubscribe: "Unsubscribe",
  },
  de: {
    confirmSubject: "Bestätigen Sie Ihre wöchentliche RandoRank-Zusammenfassung",
    confirmIntro: "Sie möchten jede Woche eine Zusammenfassung Ihrer Wanderungen erhalten. Bestätigen Sie Ihre Adresse, um sie zu aktivieren.",
    confirmCta: "Adresse bestätigen",
    confirmIgnore: "Wenn Sie das nicht waren, ignorieren Sie diese Nachricht einfach: Es wird nichts gesendet.",
    subjectActive: (km) => `Ihre Woche: ${km} km auf dem Zähler`,
    subjectQuiet: "Eine Wanderung diese Woche? Ihr Rang wartet",
    hello: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    activeIntro: "Hier ist Ihre Woche auf RandoRank.",
    quietIntro: "In den letzten 7 Tagen wurde keine Wanderung aufgezeichnet. Eine kleine Runde am Wochenende?",
    statHikes: "Touren",
    statKm: "km",
    statElevation: "Hm",
    rankLine: (r) => `Sie sind Nr. ${r} in der nationalen Rangliste.`,
    nextLine: (km) => `Ihnen fehlen ${km} km, um am Nächsten vorbeizuziehen.`,
    ctaActive: "Meinen Rang ansehen",
    ctaQuiet: "Meine nächste Runde erstellen",
    footer: "Sie erhalten diese Nachricht, weil Sie die wöchentliche Zusammenfassung in Ihrem RandoRank-Profil aktiviert haben.",
    unsubscribe: "Abbestellen",
  },
  es: {
    confirmSubject: "Confirme su resumen semanal de RandoRank",
    confirmIntro: "Ha pedido recibir cada semana un resumen de sus rutas. Confirme su dirección para activarlo.",
    confirmCta: "Confirmar mi dirección",
    confirmIgnore: "Si no ha sido usted, ignore este mensaje: no se enviará nada.",
    subjectActive: (km) => `Su semana: ${km} km en el contador`,
    subjectQuiet: "¿Una ruta esta semana? Su clasificación le espera",
    hello: (n) => (n ? `Hola ${n},` : "Hola,"),
    activeIntro: "Esta es su semana en RandoRank.",
    quietIntro: "No hay ninguna salida registrada en los últimos 7 días. ¿Un circuito corto este fin de semana?",
    statHikes: "salidas",
    statKm: "km",
    statElevation: "m de desnivel",
    rankLine: (r) => `Es el n.º ${r} de la clasificación nacional.`,
    nextLine: (km) => `Le faltan ${km} km para superar al siguiente.`,
    ctaActive: "Ver mi clasificación",
    ctaQuiet: "Generar mi próximo circuito",
    footer: "Recibe este mensaje porque activó el resumen semanal en su perfil de RandoRank.",
    unsubscribe: "Darse de baja",
  },
  it: {
    confirmSubject: "Conferma il tuo riepilogo settimanale RandoRank",
    confirmIntro: "Hai chiesto di ricevere ogni settimana un riepilogo delle tue escursioni. Conferma il tuo indirizzo per attivarlo.",
    confirmCta: "Conferma il mio indirizzo",
    confirmIgnore: "Se non sei stato tu, ignora questo messaggio: non verrà inviato nulla.",
    subjectActive: (km) => `La tua settimana: ${km} km sul contatore`,
    subjectQuiet: "Un'escursione questa settimana? La tua classifica ti aspetta",
    hello: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    activeIntro: "Ecco la tua settimana su RandoRank.",
    quietIntro: "Nessuna uscita registrata negli ultimi 7 giorni. Un piccolo anello questo fine settimana?",
    statHikes: "uscite",
    statKm: "km",
    statElevation: "m di dislivello",
    rankLine: (r) => `Sei il n. ${r} nella classifica nazionale.`,
    nextLine: (km) => `Ti mancano ${km} km per superare il successivo.`,
    ctaActive: "Vedi la mia classifica",
    ctaQuiet: "Genera il mio prossimo anello",
    footer: "Ricevi questo messaggio perché hai attivato il riepilogo settimanale nel tuo profilo RandoRank.",
    unsubscribe: "Annulla l'iscrizione",
  },
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fmt = (locale: EmailLocale, n: number) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n);

function shell(locale: EmailLocale, body: string, footerHtml: string) {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f3f1ea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c2a1a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#0f1a0c;padding:20px 24px;font-size:22px;letter-spacing:3px;color:#ffffff;">RANDO<span style="color:#fd7310;">RANK</span></td></tr>
<tr><td style="padding:24px;">${body}</td></tr>
<tr><td style="padding:0 24px 24px;font-size:12px;line-height:1.5;color:#6b7567;">${footerHtml}</td></tr>
</table></td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0 0;"><a href="${esc(href)}" style="display:inline-block;background:#fd7310;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:12px;">${esc(label)}</a></p>`;

export type RenderedEmail = { subject: string; html: string; text: string };

export function renderConfirmationEmail(locale: EmailLocale, confirmUrl: string): RenderedEmail {
  const c = COPY[locale];
  const html = shell(
    locale,
    `<p style="margin:0 0 12px;font-size:16px;line-height:1.5;">${esc(c.confirmIntro)}</p>${button(confirmUrl, c.confirmCta)}`,
    esc(c.confirmIgnore)
  );
  return {
    subject: c.confirmSubject,
    html,
    text: `${c.confirmIntro}\n\n${c.confirmCta}: ${confirmUrl}\n\n${c.confirmIgnore}`,
  };
}

export function renderWeeklySummaryEmail(
  locale: EmailLocale,
  data: WeeklySummaryData,
  urls: { app: string; generate: string; unsubscribe: string }
): RenderedEmail {
  const c = COPY[locale];
  const active = data.hikes > 0;
  const stat = (value: string, label: string) =>
    `<td align="center" style="padding:12px 6px;background:#f3f1ea;border-radius:12px;"><div style="font-size:26px;font-weight:600;color:#fd7310;">${esc(value)}</div><div style="font-size:12px;color:#6b7567;">${esc(label)}</div></td>`;

  const lines: string[] = [];
  if (active && data.rank !== null) lines.push(c.rankLine(data.rank));
  if (active && data.kmToNext !== null) lines.push(c.nextLine(fmt(locale, data.kmToNext)));

  const body =
    `<p style="margin:0 0 8px;font-size:16px;">${esc(c.hello(data.firstName))}</p>` +
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${esc(active ? c.activeIntro : c.quietIntro)}</p>` +
    (active
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="6"><tr>${stat(String(data.hikes), c.statHikes)}${stat(fmt(locale, data.distanceKm), c.statKm)}${stat(fmt(locale, data.elevationM), c.statElevation)}</tr></table>` +
        lines.map((l) => `<p style="margin:12px 0 0;font-size:15px;line-height:1.5;">${esc(l)}</p>`).join("")
      : "") +
    button(active ? urls.app : urls.generate, active ? c.ctaActive : c.ctaQuiet);

  const footerHtml = `${esc(c.footer)} <a href="${esc(urls.unsubscribe)}" style="color:#6b7567;">${esc(c.unsubscribe)}</a>`;

  const text = [
    c.hello(data.firstName),
    active ? c.activeIntro : c.quietIntro,
    active ? `${data.hikes} ${c.statHikes} · ${fmt(locale, data.distanceKm)} ${c.statKm} · ${fmt(locale, data.elevationM)} ${c.statElevation}` : "",
    ...lines,
    `${active ? c.ctaActive : c.ctaQuiet}: ${active ? urls.app : urls.generate}`,
    "",
    `${c.footer}\n${c.unsubscribe}: ${urls.unsubscribe}`,
  ]
    .filter((l) => l !== "")
    .join("\n\n");

  return {
    subject: active ? c.subjectActive(fmt(locale, data.distanceKm)) : c.subjectQuiet,
    html: shell(locale, body, footerHtml),
    text,
  };
}
