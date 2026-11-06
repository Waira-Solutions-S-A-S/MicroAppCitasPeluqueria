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
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Catálogo</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Servicios</h1>
        <p className="mt-1 text-sm text-muted">
          Los servicios activos aparecen en la PWA para reservar.
        </p>
      </header>

      <Flash ok={params.ok} error={params.error} />

      <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Plus className="size-4 text-brand" />
          Nuevo servicio
        </h2>
        <form action={createServiceAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-muted">Nombre</span>
            <input
              name="name"
              required
              minLength={2}
              placeholder="Corte de pelo"
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-muted">
              Descripción (opcional)
            </span>
            <input
              name="description"
              placeholder="Incluye lavado y styling"
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Duración (min)</span>
            <input
              name="durationMin"
              type="number"
              min={5}
              max={480}
              step={5}
              defaultValue={45}
              required
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">
              Precio ({settings.currency})
            </span>
            <input
              name="price"
              type="number"
              min={0}
              step={100}
              defaultValue={10000}
              required
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Color</span>
            <input
              name="color"
              type="color"
              defaultValue="#8b5cf6"
              className="h-10 w-full cursor-pointer rounded-xl border border-ink/15 bg-white px-1"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              <Plus className="size-4" />
              Crear servicio
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        {services.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/15 bg-white/60 p-6 text-sm text-muted">
            Todavía no hay servicios.
          </p>
        )}

        {services.map((service) => (
          <details
            key={service.id}
            className="group rounded-2xl border border-ink/10 bg-white p-4 shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: service.color }}
                />
                <div>
                  <p className="font-semibold">
                    {service.name}
                    {!service.isActive && (
                      <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-stone-500">
                        pausado
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {service.durationMin} min ·{" "}
                    {formatPrice(service.priceCents, settings.currency)}
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-muted group-open:hidden">
                Editar
              </span>
            </summary>

            <form action={updateServiceAction} className="mt-4 grid gap-3 border-t border-ink/10 pt-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={service.id} />
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-muted">Nombre</span>
                <input
                  name="name"
                  defaultValue={service.name}
                  required
                  minLength={2}
                  className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-muted">Descripción</span>
                <input
                  name="description"
                  defaultValue={service.description ?? ""}
                  className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-muted">Duración (min)</span>
                <input
                  name="durationMin"
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  defaultValue={service.durationMin}
                  required
                  className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-muted">
                  Precio ({settings.currency})
                </span>
                <input
                  name="price"
                  type="number"
                  min={0}
                  step={100}
                  defaultValue={service.priceCents / 100}
                  required
                  className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-muted">Color</span>
                <input
                  name="color"
                  type="color"
                  defaultValue={service.color}
                  className="h-10 w-full cursor-pointer rounded-xl border border-ink/15 bg-white px-1"
                />
              </label>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  <Save className="size-4" />
                  Guardar
                </button>
              </div>
            </form>

            <form action={toggleServiceAction} className="mt-3">
              <input type="hidden" name="id" value={service.id} />
              <button
                type="submit"
                className="text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
              >
                {service.isActive ? "Pausar servicio" : "Activar servicio"}
              </button>
            </form>
          </details>
        ))}
      </section>
    </div>
  );
}

function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ?? ok}
    </div>
  );
}
