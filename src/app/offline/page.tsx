import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Sin conexión · Sistema de Citas" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#f4f6f9] px-4 py-12 antialiased text-zinc-900 font-sans">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 sm:p-8 text-center shadow-xs">
        <div className="mx-auto grid size-12 place-items-center rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
          <WifiOff className="size-5" />
        </div>
        <h1 className="mt-4 text-lg font-bold tracking-tight text-zinc-950">
          Sin Conexión a Internet
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          La aplicación está instalada en tu dispositivo, pero esta acción requiere conexión de red. Conéctate y vuelve a intentar.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
          >
            <RefreshCw className="size-3.5" />
            <span>Reintentar conexión</span>
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[36px] items-center justify-center rounded border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
