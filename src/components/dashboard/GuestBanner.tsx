import Link from "next/link";
import { getT } from "@/lib/i18n/app/server";

// Shown on every app page while the visitor is an anonymous (guest) user.
export default async function GuestBanner() {
  const { t } = await getT();
  return (
    <div className="sticky top-0 z-30 flex items-center justify-center gap-3 bg-summit-500 px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
      <span>{t("guest.banner")}</span>
      <Link
        href="/auth?mode=signup&next=/dashboard"
        className="shrink-0 rounded-full bg-white px-3 py-1 text-summit-700 transition hover:bg-trail-50"
      >
        {t("guest.cta")}
      </Link>
    </div>
  );
}
