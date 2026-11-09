"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Edit2,
  Plus,
  RotateCcw,
  Scissors,
  Search,
  X,
} from "lucide-react";

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
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PAUSED">("ALL");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"name" | "duration" | "price" | "status">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Escape key cancels active editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSort = (field: "name" | "duration" | "price" | "status") => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const counts = useMemo(() => {
    return {
      all: services.length,
      active: services.filter((s) => s.isActive).length,
      paused: services.filter((s) => !s.isActive).length,
    };
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (filter === "ACTIVE" && !s.isActive) return false;
      if (filter === "PAUSED" && s.isActive) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term))
      );
    });
  }, [services, filter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "duration") {
        comparison = a.durationMin - b.durationMin;
      } else if (sortField === "price") {
        comparison = a.priceCents - b.priceCents;
      } else if (sortField === "status") {
        comparison = Number(b.isActive) - Number(a.isActive);
      }
      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [filtered, sortField, sortDir]);

  if (services.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-zinc-500">
        Todavía no hay servicios creados en el catálogo. Usa el formulario superior para crear el primero.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-2.5 border-b border-zinc-200 bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Pills */}
        <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50/60 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`rounded px-2.5 py-1 transition cursor-pointer ${
              filter === "ALL"
                ? "bg-white text-zinc-950 font-semibold shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Todos ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter("ACTIVE")}
            className={`rounded px-2.5 py-1 transition cursor-pointer ${
              filter === "ACTIVE"
                ? "bg-white text-emerald-800 font-semibold shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Activos ({counts.active})
          </button>
          <button
            type="button"
            onClick={() => setFilter("PAUSED")}
            className={`rounded px-2.5 py-1 transition cursor-pointer ${
              filter === "PAUSED"
                ? "bg-white text-zinc-800 font-semibold shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Pausados ({counts.paused})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en el catálogo…"
            className="h-8 w-full rounded border border-zinc-200 bg-white pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 sm:w-56"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-zinc-500">
          No se encontraron servicios para el filtro o búsqueda seleccionada.
          <button
            type="button"
            onClick={() => {
              setFilter("ALL");
              setSearch("");
            }}
            className="ml-2 underline text-zinc-800 font-semibold cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-[#f8f9fa] text-[11px] font-bold uppercase tracking-wider text-zinc-600 select-none">
                <th className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 cursor-pointer"
                    title="Ordenar por nombre de servicio"
                  >
                    <span>Servicio</span>
                    {sortField !== "name" ? (
                      <ArrowUpDown className="size-3 text-zinc-400 group-hover:text-zinc-700" />
                    ) : sortDir === "asc" ? (
                      <ArrowUp className="size-3 text-zinc-950" />
                    ) : (
                      <ArrowDown className="size-3 text-zinc-950" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("duration")}
                    className="group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 cursor-pointer"
                    title="Ordenar por duración"
                  >
                    <span>Duración</span>
                    {sortField !== "duration" ? (
                      <ArrowUpDown className="size-3 text-zinc-400 group-hover:text-zinc-700" />
                    ) : sortDir === "asc" ? (
                      <ArrowUp className="size-3 text-zinc-950" />
                    ) : (
                      <ArrowDown className="size-3 text-zinc-950" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("price")}
                    className="group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 cursor-pointer"
                    title="Ordenar por tarifa"
                  >
                    <span>Precio</span>
                    {sortField !== "price" ? (
                      <ArrowUpDown className="size-3 text-zinc-400 group-hover:text-zinc-700" />
                    ) : sortDir === "asc" ? (
                      <ArrowUp className="size-3 text-zinc-950" />
                    ) : (
                      <ArrowDown className="size-3 text-zinc-950" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("status")}
                    className="group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 cursor-pointer"
                    title="Ordenar por estado activo/pausado"
                  >
                    <span>Estado</span>
                    {sortField !== "status" ? (
                      <ArrowUpDown className="size-3 text-zinc-400 group-hover:text-zinc-700" />
                    ) : sortDir === "asc" ? (
                      <ArrowUp className="size-3 text-zinc-950" />
                    ) : (
                      <ArrowDown className="size-3 text-zinc-950" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {sorted.map((service, idx) => {
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
                                className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 font-mono"
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
                                className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900 font-mono"
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
      )}
    </div>
  );
}
