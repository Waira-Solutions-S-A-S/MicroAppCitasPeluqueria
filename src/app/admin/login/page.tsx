import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Lock, Shield } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Acceso Administrativo · Panel de Control" };

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

  const initials = settings.businessName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "EN";

  return (
    <div className="min-h-screen bg-[#22252c] flex flex-col justify-center items-center p-4 sm:p-6 antialiased text-zinc-100 font-sans">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded bg-[#1f2228] border border-zinc-700 text-sm font-bold tracking-widest text-white shadow-md font-mono">
            {initials}
          </div>
          <h1 className="mt-3 text-lg font-bold tracking-tight text-white">
            {settings.businessName}
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Panel de Control & Agenda
          </p>
        </div>

        {/* Metis Login Box */}
        <div className="rounded-md border border-zinc-700/80 bg-[#1f2228] shadow-xl overflow-hidden">
          <div className="border-b border-zinc-800 bg-[#191b20] px-5 py-3.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-200">
              <Lock className="size-3.5 text-zinc-400" />
              <span>Iniciar Sesión</span>
            </span>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-400 border border-zinc-700">
              Seguro
            </span>
          </div>

          <div className="p-6">
            <LoginForm next={next} />
          </div>

          {/* Demo Credentials Footer */}
          <div className="border-t border-zinc-800/80 bg-[#181a1f] p-3.5 text-center text-[11px] text-zinc-400">
            <p>
              Demo local: <strong className="text-zinc-200 font-mono">admin@estudio.local</strong>
            </p>
            <p className="mt-0.5">
              Clave: <strong className="text-zinc-200 font-mono">admin123</strong>
            </p>
          </div>
        </div>

        {/* Back to Public Site Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Volver a la portada pública</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
