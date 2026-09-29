"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { deletePhotoAction } from "@/app/dashboard/(premium)/randos/[id]/photo-actions";

export type GalleryPhoto = {
  id: string;
  url: string;
  hasGps: boolean;
};

export default function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await deletePhotoAction(id);
      setPendingId(null);
    });
  }

  if (photos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-trail-300 bg-white p-6 text-center text-sm text-trail-500">
        Aucune photo pour cette rando pour l&apos;instant.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative aspect-square overflow-hidden rounded-xl bg-trail-100"
        >
          <Image
            src={photo.url}
            alt="Photo de la rando"
            fill
            sizes="(min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
          {photo.hasGps && (
            <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
              📍 géolocalisée
            </span>
          )}
          <button
            type="button"
            onClick={() => handleDelete(photo.id)}
            disabled={isPending && pendingId === photo.id}
            aria-label="Supprimer la photo"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100 disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
