"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import sharp from "sharp";
import * as exifr from "exifr";
import { createClient } from "@/lib/supabase/server";
import { isPaidTier } from "@/lib/gating";
import type { SubscriptionTier } from "@/lib/supabase/types";
import { getT } from "@/lib/i18n/app/server";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 85;

export type UploadPhotosResult =
  | { success: true; uploaded: number; skipped: number }
  | { success: false; error: string };

export async function uploadPhotosAction(
  hikeId: string,
  formData: FormData
): Promise<UploadPhotosResult> {
  const { t } = await getT();
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { success: false, error: t("photos.selectOne") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: t("action.notLoggedIn") };
  }

  const { data: hike } = await supabase
    .from("hikes")
    .select("id, user_id")
    .eq("id", hikeId)
    .single<{ id: string; user_id: string }>();

  if (!hike || hike.user_id !== user.id) {
    return { success: false, error: t("photos.hikeNotFound") };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single<{ subscription_tier: SubscriptionTier }>();

  if (!isPaidTier(profile?.subscription_tier ?? "freemium")) {
    return { success: false, error: t("photos.premiumRequired") };
  }

  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      skipped++;
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let lat: number | null = null;
    let lon: number | null = null;
    let takenAt: string | null = null;
    try {
      const gps = await exifr.gps(buffer);
      if (gps) {
        lat = gps.latitude;
        lon = gps.longitude;
      }
      const exifDate = await exifr.parse(buffer, ["DateTimeOriginal"]);
      if (exifDate?.DateTimeOriginal instanceof Date) {
        takenAt = exifDate.DateTimeOriginal.toISOString();
      }
    } catch {
      // No/unreadable EXIF — not fatal, the photo just won't be geotagged.
    }

    let resized: Buffer;
    try {
      resized = await sharp(buffer)
        .rotate() // apply EXIF orientation, then strip metadata below
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toBuffer();
    } catch {
      skipped++;
      continue;
    }

    const path = `${user.id}/${hikeId}/${randomUUID()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, resized, { contentType: "image/jpeg" });

    if (uploadError) {
      skipped++;
      continue;
    }

    const { error: insertError } = await supabase.from("photos").insert({
      hike_id: hikeId,
      user_id: user.id,
      storage_path: path,
      lat,
      lon,
      taken_at: takenAt,
    });

    if (insertError) {
      await supabase.storage.from("photos").remove([path]);
      skipped++;
      continue;
    }

    uploaded++;
  }

  if (uploaded > 0) {
    revalidatePath(`/dashboard/randos/${hikeId}`);
  }

  if (uploaded === 0) {
    return { success: false, error: t("photos.noneImported") };
  }

  return { success: true, uploaded, skipped };
}

export async function deletePhotoAction(photoId: string): Promise<{ success: boolean; error?: string }> {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: t("action.notLoggedIn") };
  }

  const { data: photo } = await supabase
    .from("photos")
    .select("id, hike_id, user_id, storage_path")
    .eq("id", photoId)
    .single<{ id: string; hike_id: string; user_id: string; storage_path: string }>();

  if (!photo || photo.user_id !== user.id) {
    return { success: false, error: t("photos.notFound") };
  }

  await supabase.storage.from("photos").remove([photo.storage_path]);
  await supabase.from("photos").delete().eq("id", photoId);

  revalidatePath(`/dashboard/randos/${photo.hike_id}`);
  return { success: true };
}
