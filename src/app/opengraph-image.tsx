import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
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
          Chaque sentier devient un défi.
        </div>
      </div>
    ),
    { ...size }
  );
}