import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// RGPD export: every piece of personal data tied to this account, as a
// single JSON file — profile, hikes (with track geometry), photos (with a
// short-lived download link each), generated routes, badges, follows.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté·e." }, { status: 401 });
  }

  const [
    { data: profile },
    { data: hikes },
    { data: photos },
    { data: routes },
    { data: badges },
    { data: following },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("hikes_geojson").select("*").eq("user_id", user.id),
    supabase.from("photos").select("*").eq("user_id", user.id),
    supabase.from("routes_geojson").select("*").eq("created_by", user.id),
    supabase.from("user_badges").select("earned_at, badges(code, name, description)").eq("user_id", user.id),
    supabase.from("follows").select("followed_id, created_at").eq("follower_id", user.id),
  ]);

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (p) => {
      const { data: signed } = await supabase.storage
        .from("photos")
        .createSignedUrl(p.storage_path, 3600);
      return { ...p, download_url: signed?.signedUrl ?? null };
    })
  );

  const exportPayload = {
    exported_at: new Date().toISOString(),
    account_email: user.email,
    profile,
    hikes,
    photos: photosWithUrls,
    generated_routes: routes,
    badges_earned: badges,
    following,
    note: "Les liens de téléchargement des photos expirent 1h après cet export.",
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="randorank-export-${user.id}.json"`,
    },
  });
}
