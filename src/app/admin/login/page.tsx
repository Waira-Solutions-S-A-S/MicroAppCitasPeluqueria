import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Acceso Equipo · Panel" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : undefined;

  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  if (user) redirect(next ?? "/admin");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12 antialiased text-zinc-900">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition"
        >
          <ChevronLeft className="size-3.5" />
          <span>Volver al sitio</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-xs font-semibold tracking-widest text-white">
          ST
        </div>
        <div>
          <p className="text-sm font-medium tracking-tight text-zinc-950">
            {settings.businessName}
          </p>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Acceso de administración</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8">
        <h1 className="text-xl font-medium tracking-tight text-zinc-900">
          Iniciar sesión
        </h1>
        <p className="mt-1 text-xs text-zinc-600">
          Ingresa con tu cuenta para gestionar turnos, agenda y servicios.
        </p>

        <LoginForm next={next} />
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500">
        Demo local: <span className="font-medium text-zinc-800">admin@estudio.local</span> /{" "}
        <span className="font-medium text-zinc-800">admin123</span>
      </p>
    </div>
  );
}
