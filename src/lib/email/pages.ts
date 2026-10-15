import type { EmailLocale } from "./weekly-summary";

// Tiny standalone confirmation pages for the links in e-mails: the reader
// may not be signed in, so these cannot depend on a session.
const TEXT: Record<EmailLocale, Record<"confirmed" | "unsubscribed" | "invalid" | "home", string>> = {
  fr: { confirmed: "C'est confirmé : votre résumé hebdomadaire est activé.", unsubscribed: "C'est fait : vous ne recevrez plus le résumé hebdomadaire.", invalid: "Ce lien n'est plus valide.", home: "Retour à RandoRank" },
  en: { confirmed: "Confirmed: your weekly summary is on.", unsubscribed: "Done: you will no longer receive the weekly summary.", invalid: "This link is no longer valid.", home: "Back to RandoRank" },
  de: { confirmed: "Bestätigt: Ihre wöchentliche Zusammenfassung ist aktiv.", unsubscribed: "Erledigt: Sie erhalten die wöchentliche Zusammenfassung nicht mehr.", invalid: "Dieser Link ist nicht mehr gültig.", home: "Zurück zu RandoRank" },
  es: { confirmed: "Confirmado: su resumen semanal está activado.", unsubscribed: "Hecho: ya no recibirá el resumen semanal.", invalid: "Este enlace ya no es válido.", home: "Volver a RandoRank" },
  it: { confirmed: "Confermato: il riepilogo settimanale è attivo.", unsubscribed: "Fatto: non riceverai più il riepilogo settimanale.", invalid: "Questo link non è più valido.", home: "Torna a RandoRank" },
};

export function messagePage(locale: EmailLocale, kind: "confirmed" | "unsubscribed" | "invalid", siteUrl: string) {
  const t = TEXT[locale];
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>RandoRank</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f1a0c;color:#fff;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;text-align:center;padding:24px;">
<div style="max-width:360px;"><div style="font-size:26px;letter-spacing:3px;margin-bottom:16px;">RANDO<span style="color:#fd7310;">RANK</span></div>
<p style="font-size:17px;line-height:1.5;">${t[kind]}</p>
<p><a href="${siteUrl}" style="display:inline-block;background:#fd7310;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:12px;">${t.home}</a></p></div></body></html>`;
  return new Response(html, {
    status: kind === "invalid" ? 400 : 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export const isToken = (value: string | null): value is string =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
