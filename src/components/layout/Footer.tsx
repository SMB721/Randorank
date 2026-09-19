import Link from "next/link";

const navigationLinks = [
  { label: "Itinéraires", href: "/#navigation" },
  { label: "Analyses", href: "/#apropos" },
  { label: "Classements", href: "/#classement" },
  { label: "Offres", href: "/#offres" },
  { label: "FAQ", href: "/#faq" },
];

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/mentions-legales#confidentialite" },
  { label: "Cookies", href: "/mentions-legales#cookies" },
  { label: "Conditions", href: "/mentions-legales#conditions" },
];

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "Facebook", href: "#" },
];

export default function Footer() {
  return (
    <footer id="suivez-nous" className="bg-trail-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <span className="font-display text-2xl tracking-wide">
              RANDO<span className="text-summit-400">RANK</span>
            </span>
            <p className="max-w-xs text-sm text-white/60">
              Le carnet de route des randonneurs : sorties, défis et classements entre
              passionnés.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Légal
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Suivez-nous
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

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} RandoRank. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}