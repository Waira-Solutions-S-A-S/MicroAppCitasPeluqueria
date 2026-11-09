import type { Metadata, Viewport } from "next";

import { PwaRegister } from "@/components/pwa-register";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Estudio Nube - Reserva tu turno",
    template: "%s · Estudio Nube",
  },
  description:
    "Reserva corte, color y uñas en segundos desde el celular. Turnos online, también recurrentes.",
  applicationName: "Estudio Nube",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Estudio Nube",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className="scroll-smooth">
      <body className="min-h-dvh bg-white text-zinc-900">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
