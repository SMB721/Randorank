"use client";

import { useEffect } from "react";
import { startInstallListener } from "@/lib/pwa/install";

// Mounted once in the app shell so the install event is captured on first
// load, whichever page the visitor lands on.
export default function InstallPromptListener() {
  useEffect(() => {
    startInstallListener();
  }, []);
  return null;
}
