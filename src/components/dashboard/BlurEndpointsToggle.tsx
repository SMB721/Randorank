"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BlurEndpointsToggle({
  initialValue,
  profileId,
}: {
  initialValue: boolean;
  profileId: string;
}) {
  const [enabled, setEnabled] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    await supabase.from("profiles").update({ blur_endpoints: next }).eq("id", profileId);
    setSaving(false);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={saving}
      role="switch"
      aria-checked={enabled}
      aria-label="Flouter le départ et l'arrivée de mes randos"
      className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-60 ${
        enabled ? "bg-summit-500" : "bg-trail-200"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
