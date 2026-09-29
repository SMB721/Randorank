"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

const MAX_AVATAR_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const AVATAR_DIMENSION = 512;

export async function uploadAvatarAction(
  formData: FormData
): Promise<{ success: true; avatarUrl: string } | { success: false; error: string }> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Sélectionnez une image." };
  }
  if (file.size > MAX_AVATAR_FILE_SIZE_BYTES) {
    return { success: false, error: "Image trop lourde (8 Mo max)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté·e." };
  }

  let resized: Buffer;
  try {
    resized = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: AVATAR_DIMENSION, height: AVATAR_DIMENSION, fit: "cover", position: "attention" })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    return { success: false, error: "Ce fichier ne semble pas être une image valide." };
  }

  const path = `${user.id}/avatar.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, resized, { contentType: "image/jpeg", upsert: true });

  if (uploadError) {
    return { success: false, error: "Échec de l'envoi, réessayez." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);
  // Cache-bust: same path on every re-upload, so append a version marker
  // or clients (and the leaderboard) keep showing the stale cached image.
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: "Échec de l'enregistrement, réessayez." };
  }

  revalidatePath("/dashboard/profil");
  revalidatePath("/dashboard/classement");
  return { success: true, avatarUrl };
}

// Full account deletion (RGPD "droit à l'effacement"). Postgres FK
// cascades (auth.users -> profiles/hikes/photos/routes/user_badges/follows,
// all "on delete cascade") handle the database rows; this only has to
// clean up what cascades can't reach — storage files and the Stripe
// subscription — before deleting the auth user itself.
export async function deleteAccountAction(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté·e." };
  }

  const admin = createAdminClient();

  const { data: photos } = await admin
    .from("photos")
    .select("storage_path")
    .eq("user_id", user.id)
    .returns<{ storage_path: string }[]>();

  if (photos && photos.length > 0) {
    await admin.storage.from("photos").remove(photos.map((p) => p.storage_path));
  }

  await admin.storage.from("avatars").remove([`${user.id}/avatar.jpg`]);

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single<{ stripe_customer_id: string | null }>();

  if (profile?.stripe_customer_id) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
      });
      await Promise.all(
        subscriptions.data.map((s) => stripe.subscriptions.cancel(s.id))
      );
    } catch {
      // Best-effort — a billing hiccup shouldn't block account deletion.
    }
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  return {};
}
