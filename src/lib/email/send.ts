// Minimal Resend client over fetch (no SDK dependency). Returns instead of
// throwing so one bad address cannot stop a batch.
export type SendResult = { ok: true } | { ok: false; error: string; skipped?: boolean };

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl?: string;
}): Promise<SendResult> {
  if (!emailConfigured()) {
    return { ok: false, error: "Email provider not configured", skipped: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        // One-click unsubscribe (RFC 8058) is what Gmail and Yahoo expect
        // from regular senders.
        ...(input.unsubscribeUrl
          ? {
              headers: {
                "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            }
          : {}),
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "send failed" };
  }
}
