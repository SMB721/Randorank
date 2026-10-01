import type { Metadata, Viewport } from "next";
import { Bebas_Neue } from "next/font/google";
import { notFound } from "next/navigation";
import PwaServiceWorker from "@/components/PwaServiceWorker";
import { isLocale } from "@/lib/i18n/config";
import "../../globals.css";

// Second root layout (the first is app/(site)/layout.tsx): it exists only so
// the <html lang> attribute matches the page's locale. Everything shared
// with the French layout (fonts, PWA, base metadata) is kept in sync by hand.
const displayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { apple: "/icons/icon-192.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RandoRank",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1a0c",
};

export default async function IntlLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang} className={displayFont.variable} data-scroll-behavior="smooth">
      <body>
        <PwaServiceWorker />
        {children}
      </body>
    </html>
  );
}
