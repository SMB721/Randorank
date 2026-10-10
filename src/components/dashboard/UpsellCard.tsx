import Link from "next/link";

type Props = {
  icon: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  /** "dark" for pages on the photo background, "light" for the cream pages. */
  tone?: "light" | "dark";
};

// One shared look for every "this is a Premium / account feature" prompt, so
// upsell moments across the app feel like one consistent offer.
export default function UpsellCard({ icon, title, text, cta, href, tone = "light" }: Props) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-2xl border p-5 ${
        dark
          ? "border-summit-400/40 bg-summit-500/15 text-white"
          : "border-summit-200 bg-summit-50 text-trail-900"
      }`}
    >
      <span className="text-3xl" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-xl tracking-wide">{title}</p>
        <p className={`mt-0.5 text-sm ${dark ? "text-white/70" : "text-trail-600"}`}>{text}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-xl bg-summit-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
      >
        {cta}
      </Link>
    </div>
  );
}
