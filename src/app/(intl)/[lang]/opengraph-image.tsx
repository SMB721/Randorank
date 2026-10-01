import { ImageResponse } from "next/og";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getLandingDict } from "@/lib/i18n/landing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same artwork as app/(site)/opengraph-image.tsx, with the tagline in the
// page's language so a shared /en link doesn't preview a French sentence.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { hero } = getLandingDict(isLocale(lang) ? lang : DEFAULT_LOCALE);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0f1a0c 0%, #233e1c 55%, #3a7529 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 108,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          <span>RANDO</span>
          <span style={{ color: "#fd7310" }}>RANK</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 36,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {`${hero.titleLine1} ${hero.titleLine2}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
