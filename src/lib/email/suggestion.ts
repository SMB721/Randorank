import type { SuggestionKind } from "@/lib/suggestions";

// Where new messages from the idea bag are sent. Overridable from the
// environment; defaults to the public contact address of the legal notice.
export const SUGGESTION_NOTIFY_EMAIL =
  process.env.SUGGESTIONS_NOTIFY_EMAIL || "contact@randorank.com";

const KIND_LABEL: Record<SuggestionKind, string> = {
  idea: "💡 Idée",
  problem: "🧗 Souci",
  love: "💚 Coup de cœur",
};

// The message is user-written: it goes into HTML only after escaping.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Internal notification for the team: one email per message, in French. */
export function suggestionNotification(input: {
  kind: SuggestionKind;
  message: string;
  username: string | null;
  locale: string;
}) {
  const label = KIND_LABEL[input.kind];
  const who = input.username || "membre sans surnom";
  const snippet = input.message.replace(/\s+/g, " ").slice(0, 60);

  return {
    subject: `Sac à idées · ${label} · ${snippet}`,
    text: `${label} de ${who} (langue : ${input.locale})\n\n${input.message}\n`,
    html: `<p><strong>${label}</strong> de ${escapeHtml(who)} (langue : ${escapeHtml(input.locale)})</p>
<blockquote style="margin:0;padding:12px 16px;border-left:4px solid #f97316;background:#f5f4f0;white-space:pre-wrap">${escapeHtml(input.message)}</blockquote>`,
  };
}
