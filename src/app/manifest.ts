import type { MetadataRoute } from "next";

import { getSettings } from "@/lib/settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let businessName = "Estudio Nube";
  let tagline = "Reserva corte, color y uñas en segundos. Turnos online, también recurrentes.";

  try {
    const settings = await getSettings();
    businessName = settings.businessName;
    if (settings.tagline) {
      tagline = settings.tagline;
    }
  } catch {
    // Fallback if DB is not reachable during build prerendering
  }

  return {
    name: `${businessName} — Turnos & Reservas`,
    short_name: businessName,
    description: tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "es-CO",
    categories: ["lifestyle", "beauty"],
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
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
