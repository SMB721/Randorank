import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RandoRank",
    short_name: "RandoRank",
    description:
      "Suivez vos randos, débloquez des badges, grimpez au classement et générez votre prochain itinéraire.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f1a0c",
    theme_color: "#0f1a0c",
    lang: "fr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
