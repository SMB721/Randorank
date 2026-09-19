"use client";

import { useEffect, useState } from "react";

// Mirrors the visitor's light/dark system preference (day/night, in
// practice) so the map basemap can switch with it.
export function useColorScheme(): "light" | "dark" {
  const [scheme, setScheme] = useState<"light" | "dark">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setScheme(e.matches ? "dark" : "light");
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return scheme;
}
