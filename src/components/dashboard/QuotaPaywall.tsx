import Link from "next/link";

export default function QuotaPaywall({ limit }: { limit: number }) {
  return (
    <div className="rounded-2xl border border-summit-200 bg-summit-50 p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-summit-600">
        Limite Freemium atteinte
      </p>
      <p className="mt-2 font-display text-2xl tracking-wide text-trail-900">
        {limit} rando{limit > 1 ? "s" : ""} par semaine, c&apos;est fait pour cette semaine
      </p>
      <p className="mt-2 text-sm text-trail-600">
        Passe Le MUL ou Le Thru-Hiker pour enregistrer et importer sans limite.
      </p>
      <Link
        href="/#offres"
        className="mt-4 inline-block rounded-xl bg-summit-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
      >
        Voir les offres
      </Link>
    </div>
  );
}
