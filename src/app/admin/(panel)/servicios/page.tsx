import type { Metadata } from "next";
import { Plus, Save } from "lucide-react";

import {
  createServiceAction,
  toggleServiceAction,
  updateServiceAction,
} from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Gestión de Servicios · Panel" };

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
    <div className="space-y-8 antialiased text-zinc-900">
      <header className="border-b border-zinc-200 pb-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Catálogo</p>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-zinc-950 sm:text-3xl">
          Servicios del Estudio
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Los servicios activos se muestran de inmediato en la carta y en el asistente de reservas.
        </p>
      </header>

      <Flash ok={params.ok} error={params.error} />

      {/* Formulario nuevo servicio */}
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="flex items-center gap-2 text-base font-bold text-zinc-950">
          <Plus className="size-4 text-zinc-950" />
          Crear nuevo servicio
        </h2>

        <form action={createServiceAction} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Nombre del servicio</span>
            <input
              name="name"
              required
              minLength={2}
              placeholder="Ej. Corte de autor & styling"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="sm:col-span-2 block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Descripción detallada (opcional)
            </span>
            <input
              name="description"
              placeholder="Incluye diagnóstico capilar, lavado profesional y peinado final."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
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
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
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
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Color distintivo</span>
            <input
              name="color"
              type="color"
              defaultValue="#18181b"
              className="h-10 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-2 py-1"
            />
          </label>

          <div className="flex items-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-zinc-800"
            >
              <Plus className="size-3.5" />
              <span>Añadir al catálogo</span>
            </button>
          </div>
        </form>
      </section>

      {/* Lista de servicios existentes */}
      <section className="space-y-4">
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center text-xs text-zinc-500">
            Todavía no hay servicios creados.
          </div>
        ) : (
          services.map((service) => (
            <details
              key={service.id}
              className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs transition hover:border-zinc-300"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <span
                    className="size-3 rounded-full ring-2 ring-zinc-100"
                    style={{ backgroundColor: service.color }}
                  />
                  <div>
                    <p className="text-base font-bold text-zinc-950">
                      {service.name}
                      {!service.isActive && (
                        <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          pausado
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {service.durationMin} min ·{" "}
                      {formatPrice(service.priceCents, settings.currency)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-500 group-open:hidden transition hover:text-zinc-950">
                  Editar
                </span>
              </summary>

              <form
                action={updateServiceAction}
                className="mt-6 grid gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-2"
              >
                <input type="hidden" name="id" value={service.id} />
                <label className="sm:col-span-2 block">
                  <span className="mb-1 block text-xs font-semibold text-zinc-700">Nombre</span>
                  <input
                    name="name"
                    defaultValue={service.name}
                    required
                    minLength={2}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  />
                </label>

                <label className="sm:col-span-2 block">
                  <span className="mb-1 block text-xs font-semibold text-zinc-700">Descripción</span>
                  <input
                    name="description"
                    defaultValue={service.description ?? ""}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-zinc-700">Duración (min)</span>
                  <input
                    name="durationMin"
                    type="number"
                    min={5}
                    max={480}
                    step={5}
                    defaultValue={service.durationMin}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
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
                    defaultValue={service.priceCents / 100}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-zinc-700">Color distintivo</span>
                  <input
                    name="color"
                    type="color"
                    defaultValue={service.color}
                    className="h-10 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-2 py-1"
                  />
                </label>

                <div className="flex items-end gap-2 pt-2 sm:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-zinc-800"
                  >
                    <Save className="size-3.5" />
                    <span>Guardar cambios</span>
                  </button>
                </div>
              </form>

              <form action={toggleServiceAction} className="mt-4 pt-3 border-t border-zinc-100">
                <input type="hidden" name="id" value={service.id} />
                <button
                  type="submit"
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 underline transition"
                >
                  {service.isActive ? "Pausar servicio temporalmente" : "Reactivar servicio"}
                </button>
              </form>
            </details>
          ))
        )}
      </section>
    </div>
  );
}

function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-xs font-semibold shadow-xs ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ?? ok}
    </div>
  );
}
