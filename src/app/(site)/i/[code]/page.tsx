import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import HtmlLang from "@/components/HtmlLang";
import { createAdminClient } from "@/lib/supabase/admin";
import { getT } from "@/lib/i18n/app/server";
import { isInviteCode } from "@/lib/invite";

// Public page a friend lands on from an invite link. Shows only the inviter's
// public username, which they chose to share by sending the link.
export const metadata: Metadata = { robots: { index: false, follow: false } };

const heroImage =
  "https://images.unsplash.com/photo-1600807497639-3b5d8e74a232?auto=format&fit=crop&w=1600&q=80";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!isInviteCode(code)) redirect("/");

  const { data: inviter } = await createAdminClient()
    .from("profiles")
    .select("username")
    .eq("invite_code", code.toLowerCase())
    .maybeSingle<{ username: string | null }>();
  if (!inviter) redirect("/");

  const { t, locale } = await getT();
  const name = inviter.username?.trim() || t("invite.someone");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <HtmlLang locale={locale} />
      <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-trail-950" />

      <div className="relative z-10 w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-trail-950/70 p-8 text-center text-white shadow-2xl backdrop-blur-xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-400">
          {t("invite.landing.eyebrow")}
        </span>
        <h1 className="font-display text-4xl tracking-wide">
          {t("invite.landing.title", { name })}
        </h1>
        <p className="text-sm text-white/70">{t("invite.landing.text")}</p>
        <Link
          href={`/i/${code}/go`}
          className="block rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
        >
          {t("invite.landing.cta")}
        </Link>
        <p className="text-xs text-white/50">{t("invite.landing.note")}</p>
        <Link
          href={`/i/${code}/go?mode=login`}
          className="block text-sm font-semibold text-white/70 underline hover:text-white"
        >
          {t("invite.landing.member")}
        </Link>
      </div>
    </main>
  );
}
