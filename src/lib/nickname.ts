// Accounts created from this date on must pick a nickname before using the
// app. Older accounts without one are left alone ("Randonneur anonyme"):
// only new sign-ups are held to the rule. Keep in sync with the cutoff in
// supabase/migrations/0026_new_accounts_need_nickname.sql.
export const NICKNAME_REQUIRED_SINCE = "2026-11-11T00:00:00Z";

export function nicknameRequired(createdAt: string | null | undefined): boolean {
  return Boolean(createdAt) && new Date(createdAt as string) >= new Date(NICKNAME_REQUIRED_SINCE);
}
