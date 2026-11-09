import type { Metadata } from "next";
import { Plus, Save, Scissors } from "lucide-react";

import {
  createServiceAction,
  toggleServiceAction,
  updateServiceAction,
} from "@/app/admin/actions";
import { Flash } from "@/components/admin/flash";
import { NewServiceForm } from "@/components/admin/new-service-form";
import { ServicesList } from "@/components/admin/services-list";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Servicios · Panel Administrativo" };

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [settings, services] = await Promise.all([
    getSettings(),
    prisma.service.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <div className="space-y-6 antialiased text-zinc-900">
      {/* Page Header Ribbon */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Panel</span> <span className="mx-1">/</span> <span className="text-zinc-900">Servicios</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
            Catálogo de Servicios
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Configura los servicios, tarifas y tiempos de atención que verán tus clientes.
          </p>
        </div>
      </div>

      <Flash ok={params.ok} error={params.error} />

      {/* Metis Card: Formulario nuevo servicio con presets */}
      <NewServiceForm currency={settings.currency} />

      {/* Metis Card: Flush Table of Services */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50/75 px-5 py-3.5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
            <Scissors className="size-4 text-zinc-700" />
            <span>Servicios Registrados ({services.length})</span>
          </h2>
          <span className="text-[11px] text-zinc-500 font-medium">Activos en la carta web</span>
        </div>

        <ServicesList services={services} currency={settings.currency} />
      </div>
    </div>
  );
}
