import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-brand-soft text-brand">
        <WifiOff className="size-7" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">Estás sin conexión</h1>
      <p className="text-sm leading-relaxed text-muted">
        La app quedó guardada en tu dispositivo, pero esta pantalla necesita internet.
        Reconectate y volvé a intentar.
      </p>
      <Link
        href="/"
        className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
      >
        Reintentar
      </Link>
    </div>
  );
}
