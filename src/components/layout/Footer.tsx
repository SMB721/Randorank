import Link from "next/link";
import { LOCALES, LOCALE_LABELS, landingPath, type Locale } from "@/lib/i18n/config";
import type { LandingDict } from "@/lib/i18n/landing";

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "Facebook", href: "#" },
];

export default function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: LandingDict["footer"];
}) {
  const navigationLinks = [
    { label: dict.nav.routes, href: landingPath(locale, "navigation") },
    { label: dict.nav.analyses, href: landingPath(locale, "apropos") },
    { label: dict.nav.rankings, href: landingPath(locale, "classement") },
    { label: dict.nav.offers, href: landingPath(locale, "offres") },
    { label: dict.nav.faq, href: landingPath(locale, "faq") },
  ];

  // The legal documents exist in French only: other locales link to them
  // with a "(FR)" suffix (see dictionaries) rather than pretending they are
  // translated.
  const legalLinks = [
    { label: dict.legal.notice, href: "/mentions-legales" },
    { label: dict.legal.privacy, href: "/mentions-legales#confidentialite" },
    { label: dict.legal.cookies, href: "/mentions-legales#cookies" },
    { label: dict.legal.terms, href: "/mentions-legales#conditions" },
  ];

  return (
    <footer id="suivez-nous" className="bg-trail-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <span className="font-display text-2xl tracking-wide">
              RANDO<span className="text-summit-400">RANK</span>
            </span>
            <p className="max-w-xs text-sm text-white/60">{dict.tagline}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
              {dict.navTitle}
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
              {dict.legalTitle}
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
              {dict.followTitle}
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} RandoRank. {dict.rights}
          </span>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {LOCALES.map((l) => (
              <li key={l}>
                <Link
                  href={landingPath(l)}
                  hrefLang={l}
                  lang={l}
                  aria-current={l === locale ? "true" : undefined}
                  className={`transition hover:text-white ${l === locale ? "text-white" : ""}`}
                >
                  {LOCALE_LABELS[l]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
