import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habitify",
    short_name: "Habitify",
    description: "Track your habits and boost your productivity",
    start_url: "/",
    display: "standalone",
    background_color: "#F9FAFB",
    theme_color: "#1D4ED8",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
