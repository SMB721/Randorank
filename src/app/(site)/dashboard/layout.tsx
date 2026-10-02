import BottomTabBar from "@/components/dashboard/BottomTabBar";
import HtmlLang from "@/components/HtmlLang";
import { I18nProvider } from "@/lib/i18n/app/client";
import { getT } from "@/lib/i18n/app/server";
import { getLandingDict } from "@/lib/i18n/landing";

// Default tab title/description in the user's language (pages can override).
export async function generateMetadata() {
  const { locale } = await getT();
  const { meta } = getLandingDict(locale);
  return { title: { absolute: meta.title }, description: meta.description };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The whole dashboard follows the user's language (cookie, else browser).
  const { locale, dict } = await getT();

  return (
    <I18nProvider locale={locale} dict={dict}>
      <HtmlLang locale={locale} />
      <div className="pb-20">{children}</div>
      <BottomTabBar />
    </I18nProvider>
  );
}
