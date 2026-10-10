import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import HtmlLang from "@/components/HtmlLang";
import { createClient } from "@/lib/supabase/server";
import { landingPath } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/app/server";
import { PSEUDO_MAX, PSEUDO_MIN, randomPseudo } from "@/lib/pseudo";
import { startAnonymousAction } from "./actions";

const startImage =
  "https://images.unsplash.com/photo-1600807497639-3b5d8e74a232?auto=format&fit=crop&w=1600&q=80";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: { absolute: t("start.meta") } };
}

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { t, locale } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;
  const errorText =
    error === "length"
      ? t("start.err.length", { min: PSEUDO_MIN, max: PSEUDO_MAX })
      : error === "failed"
        ? t("start.err.failed")
        : null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24">
      <HtmlLang locale={locale} />
      <Image src={startImage} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-trail-950" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6">
        <Link href={landingPath(locale)} className="font-display text-2xl tracking-wide text-white">
          RANDO<span className="text-summit-400">RANK</span>
        </Link>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-trail-950/70 p-8 text-white shadow-2xl backdrop-blur-xl">
        <div className="space-y-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-400">
            {t("start.eyebrow")}
          </span>
          <h1 className="font-display text-3xl tracking-wide">{t("start.title")}</h1>
          <p className="text-sm text-white/60">{t("start.subtitle")}</p>
        </div>

        <form action={startAnonymousAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="pseudo" className="text-sm font-medium text-white/80">
              {t("start.pseudo.label")}
            </label>
            <input
              id="pseudo"
              name="pseudo"
              type="text"
              minLength={PSEUDO_MIN}
              maxLength={PSEUDO_MAX}
              autoComplete="nickname"
              placeholder={randomPseudo()}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-400/20"
            />
            <p className="text-xs text-white/40">{t("start.pseudo.hint")}</p>
          </div>

          {errorText && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{errorText}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
          >
            {t("start.submit")}
          </button>
        </form>

        <ul className="space-y-1.5 text-sm text-white/70">
          {(["start.perk.1", "start.perk.2", "start.perk.3"] as const).map((key) => (
            <li key={key} className="flex items-start gap-2">
              <span className="mt-0.5 text-summit-400" aria-hidden="true">
                ✓
              </span>
              {t(key)}
            </li>
          ))}
        </ul>

        <div className="space-y-2 border-t border-white/10 pt-4 text-center text-sm">
          <Link href="/auth?mode=login" className="font-semibold text-white/80 underline hover:text-white">
            {t("start.haveAccount")}
          </Link>
          <p className="text-xs text-white/40">
            {t("start.terms")}{" "}
            <Link href="/mentions-legales#conditions" className="underline hover:text-white/70">
              {t("start.termsLink")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
