import type { Metadata, Viewport } from "next";
import { Bebas_Neue } from "next/font/google";
import PwaServiceWorker from "@/components/PwaServiceWorker";
import "../globals.css";

const displayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "RandoRank — Chaque sentier devient un défi";
const description =
  "L'app de rando fun et communautaire : défis, classements et badges pour marcheurs et randonneurs.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — RandoRank",
  },
  description,
  keywords: [
    "randonnée",
    "application rando",
    "classement rando",
    "défis rando",
    "génération d'itinéraire",
    "GPX",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "RandoRank",
    title,
    description,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RandoRank",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1a0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={displayFont.variable} data-scroll-behavior="smooth">
      <body>
        <PwaServiceWorker />
        {children}
      </body>
    </html>
  );
}
