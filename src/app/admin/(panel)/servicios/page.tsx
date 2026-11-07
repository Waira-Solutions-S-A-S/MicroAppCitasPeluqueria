import type { Metadata } from "next";
import { Plus, Save, Scissors } from "lucide-react";

import {
  createServiceAction,
  toggleServiceAction,
  updateServiceAction,
} from "@/app/admin/actions";
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

      {/* Metis Card: Formulario nuevo servicio */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50/75 px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
            <Plus className="size-4 text-zinc-700" />
            <span>Agregar Nuevo Servicio al Catálogo</span>
          </h2>
        </div>

        <form action={createServiceAction} className="p-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Nombre del servicio</span>
            <input
              name="name"
              required
              minLength={2}
              placeholder="Ej. Corte de autor & styling"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="sm:col-span-2 block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Descripción detallada (opcional)
            </span>
            <input
              name="description"
              placeholder="Incluye diagnóstico capilar, lavado profesional y peinado final."
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Duración estimada (min)</span>
            <input
              name="durationMin"
              type="number"
              min={5}
              max={480}
              step={5}
              defaultValue={45}
              required
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Precio ({settings.currency})
            </span>
            <input
              name="price"
              type="number"
              min={0}
              step={100}
              defaultValue={10000}
              required
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Color distintivo</span>
            <input
              name="color"
              type="color"
              defaultValue="#18181b"
              className="h-9 w-full cursor-pointer rounded-md border border-zinc-200 bg-white px-2 py-1"
            />
          </label>

          <div className="flex items-end pt-2">
            <button
              type="submit"
              className="inline-flex min-h-[36px] items-center gap-2 rounded-md bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Guardar servicio</span>
            </button>
          </div>
        </form>
      </div>

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

function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div
      className={`rounded-md border px-4 py-3 text-xs font-semibold shadow-xs ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ?? ok}
    </div>
  );
}
