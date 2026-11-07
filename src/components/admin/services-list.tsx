"use client";

import { useState } from "react";
import { Check, Edit2, Plus, Scissors, X } from "lucide-react";

import { toggleServiceAction, updateServiceAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";

type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
  color: string;
  isActive: boolean;
};

export function ServicesList({
  services,
  currency,
}: {
  services: ServiceItem[];
  currency: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (services.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-zinc-500">
        Todavía no hay servicios creados en el catálogo. Usa el formulario superior para crear el primero.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-200 bg-[#f8f9fa] text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            <th className="px-4 py-2.5">Servicio</th>
            <th className="px-4 py-2.5">Duración</th>
            <th className="px-4 py-2.5">Precio</th>
            <th className="px-4 py-2.5">Estado</th>
            <th className="px-4 py-2.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {services.map((service, idx) => {
            const isEditing = editingId === service.id;

            if (isEditing) {
              return (
                <tr key={service.id} className="bg-amber-50/40">
                  <td colSpan={5} className="p-4">
                    <form action={updateServiceAction} className="space-y-3">
                      <input type="hidden" name="id" value={service.id} />

                      <div className="flex items-center justify-between pb-1 border-b border-amber-200/60">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                          Editando Servicio: {service.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="inline-flex size-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-200 cursor-pointer"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4">
                        <label className="sm:col-span-2 block">
                          <span className="mb-1 block text-[11px] font-semibold text-zinc-700">
                            Nombre
                          </span>
                          <input
                            name="name"
                            defaultValue={service.name}
                            required
                            className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold text-zinc-700">
                            Duración (min)
                          </span>
                          <input
                            name="durationMin"
                            type="number"
                            min={5}
                            max={480}
                            step={5}
                            defaultValue={service.durationMin}
                            required
                            className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold text-zinc-700">
                            Precio ({currency})
                          </span>
                          <input
                            name="price"
                            type="number"
                            min={0}
                            step={100}
                            defaultValue={service.priceCents / 100}
                            required
                            className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                          />
                        </label>

                        <label className="sm:col-span-3 block">
                          <span className="mb-1 block text-[11px] font-semibold text-zinc-700">
                            Descripción (opcional)
                          </span>
                          <input
                            name="description"
                            defaultValue={service.description ?? ""}
                            className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold text-zinc-700">
                            Color
                          </span>
                          <input
                            name="color"
                            type="color"
                            defaultValue={service.color}
                            className="h-8 w-full cursor-pointer rounded border border-zinc-300 bg-white px-1 py-0.5"
                          />
                        </label>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="inline-flex h-7 items-center rounded border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="inline-flex h-7 items-center gap-1 rounded bg-zinc-900 px-3.5 text-xs font-semibold text-white transition hover:bg-zinc-800 cursor-pointer"
                        >
                          <Check className="size-3.5" />
                          <span>Guardar cambios</span>
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              );
            }

            return (
              <tr
                key={service.id}
                className={`transition-colors hover:bg-zinc-100/70 ${
                  idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                    <div>
                      <span className="block font-semibold text-zinc-900">
                        {service.name}
                      </span>
                      {service.description && (
                        <span className="block max-w-sm text-[11px] text-zinc-500 truncate">
                          {service.description}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-zinc-800 font-medium font-mono">
                  {service.durationMin} min
                </td>

                <td className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-950 font-mono">
                  {formatPrice(service.priceCents, currency)}
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  {service.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      <span>Activo</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                      <span className="size-1.5 rounded-full bg-zinc-400" />
                      <span>Pausado</span>
                    </span>
                  )}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingId(service.id)}
                      className="inline-flex h-7 items-center gap-1 rounded border border-zinc-200 bg-white px-2.5 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 cursor-pointer"
                      title="Editar servicio"
                    >
                      <Edit2 className="size-3 text-zinc-500" />
                      <span>Editar</span>
                    </button>

                    <form action={toggleServiceAction}>
                      <input type="hidden" name="id" value={service.id} />
                      <button
                        type="submit"
                        className="inline-flex h-7 items-center rounded border border-zinc-200 bg-white px-2.5 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 cursor-pointer"
                      >
                        {service.isActive ? "Pausar" : "Reactivar"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
