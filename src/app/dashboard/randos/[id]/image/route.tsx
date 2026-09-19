import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDuration } from "@/lib/format";
import type { Hike } from "@/lib/supabase/types";

export const runtime = "nodejs";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const PHOTO_ZONE_HEIGHT = 700;
const MAX_PHOTOS_IN_COLLAGE = 3;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: hike } = await supabase
    .from("hikes")
    .select(
      "id, user_id, name, distance_km, elevation_gain_m, duration_seconds, avg_speed_kmh, started_at"
    )
    .eq("id", id)
    .single<Hike>();

  if (!hike || hike.user_id !== user.id) {
    return new Response("Not found", { status: 404 });
  }

  // Up to 3 photos, shown side by side as a small album strip — the stats
  // panel below always sits on a plain background, so it stays readable no
  // matter how many (or how busy) the photos are.
  const { data: photoRows } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("hike_id", hike.id)
    .order("created_at", { ascending: true })
    .limit(MAX_PHOTOS_IN_COLLAGE)
    .returns<{ storage_path: string }[]>();

  const photoUrls: string[] = [];
  for (const row of photoRows ?? []) {
    const { data: signed } = await supabase.storage
      .from("photos")
      .createSignedUrl(row.storage_path, 300);
    if (signed?.signedUrl) photoUrls.push(signed.signedUrl);
  }

  const stats = [
    { label: "DISTANCE", value: `${hike.distance_km} km` },
    { label: "DÉNIVELÉ +", value: `${hike.elevation_gain_m} m` },
    { label: "DURÉE", value: formatDuration(hike.duration_seconds) },
    { label: "VITESSE MOY.", value: `${hike.avg_speed_kmh} km/h` },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          background: "#0f1a0c",
        }}
      >
        {/* Photo zone — a strip of up to 3 shots, or a plain brand gradient
            when there are none. No text is ever placed over this zone. */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: PHOTO_ZONE_HEIGHT,
            background:
              photoUrls.length === 0
                ? "linear-gradient(160deg, #233e1c 0%, #3a7529 100%)"
                : "#0f1a0c",
          }}
        >
          {photoUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              style={{
                width: `${CARD_WIDTH / photoUrls.length}px`,
                height: `${PHOTO_ZONE_HEIGHT}px`,
                objectFit: "cover",
                // An explicit `undefined` value here (rather than omitting
                // the key) crashes the image renderer — see the "no photos
                // visible" bug this fixed.
                ...(i > 0 ? { borderLeft: "3px solid #0f1a0c" } : {}),
              }}
            />
          ))}
        </div>

        {/* Stats zone — solid background, always legible. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: CARD_HEIGHT - PHOTO_ZONE_HEIGHT,
            padding: "36px 56px 44px",
            color: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 32, fontWeight: 800 }}>
            <span>RANDO</span>
            <span style={{ color: "#fd7310" }}>RANK</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 20, color: "rgba(255,255,255,0.6)" }}>
              {formatDate(hike.started_at)}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 46,
                fontWeight: 800,
                marginTop: 6,
                lineHeight: 1.05,
              }}
            >
              {hike.name}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  paddingTop: 12,
                }}
              >
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", letterSpacing: 2 }}>
                  {s.label}
                </span>
                <span style={{ fontSize: 32, fontWeight: 700, color: "#fd7310" }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", fontSize: 18, color: "rgba(255,255,255,0.5)" }}>
            Chaque sentier devient un défi.
          </div>
        </div>
      </div>
    ),
    { width: CARD_WIDTH, height: CARD_HEIGHT }
  );
}
