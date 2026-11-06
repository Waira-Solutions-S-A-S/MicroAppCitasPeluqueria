import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Scissors } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Ingresar" };

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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
          <Scissors className="size-5" strokeWidth={2.4} />
        </span>
        <div className="leading-tight">
          <p className="text-base font-semibold tracking-tight">{settings.businessName}</p>
          <p className="text-xs text-muted">Panel del negocio</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Ingresá</h1>
        <p className="mt-1 text-sm text-muted">Gestioná turnos, servicios y horarios.</p>

        <LoginForm next={next} />
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Demo local: <span className="font-medium">admin@estudio.local</span> /{" "}
        <span className="font-medium">admin123</span>
      </p>
      <p className="mt-4 text-center text-sm">
        <Link href="/" className="font-medium text-brand hover:underline">
          Volver al sitio
        </Link>
      </p>
    </div>
  );
}
