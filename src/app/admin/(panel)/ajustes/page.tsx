import type { Metadata } from "next";

import { Flash } from "@/components/admin/flash";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Configuración · Panel" };

export default async function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  return (
    <div className="space-y-6 antialiased text-zinc-900">
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Panel</span> <span className="mx-1">/</span> <span className="text-zinc-900">Configuración</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
            Ajustes del Estudio
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Personaliza el nombre comercial, moneda local y reglas de tiempo para las reservas.
          </p>
        </div>
      </div>

      <Flash ok={params.ok} error={params.error} />

      <SettingsTabs
        settings={settings}
        userEmail={user?.email || "admin@atelier.local"}
      />
    </div>
  );
}
