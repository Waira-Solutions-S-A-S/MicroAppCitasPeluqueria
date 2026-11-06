import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";

export const metadata: Metadata = { title: "Sin conexión · Sattis Studio" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-900 border border-zinc-200">
          <WifiOff className="size-6 text-zinc-700" />
        </div>
        <h1 className="mt-5 text-xl font-medium tracking-tight text-zinc-900">
          Sin conexión a internet
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          La aplicación está disponible en tu dispositivo, pero esta acción requiere conexión. Conectate a una red y volvé a intentar.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
          >
            <RefreshCw className="size-4" />
            Reintentar
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

