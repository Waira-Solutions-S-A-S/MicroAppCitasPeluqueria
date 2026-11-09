"use client";

import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";

import { createServiceAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

export function NewServiceForm({ currency }: { currency: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(45);
  const [price, setPrice] = useState(15000);
  const [color, setColor] = useState("#18181b");
  const [description, setDescription] = useState("");

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
      <div className="border-b border-zinc-200 bg-zinc-50/75 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
            <Plus className="size-4 text-zinc-700" />
            <span>Agregar Nuevo Servicio al Catálogo</span>
          </h2>
          {/* Live Preview Badge if typing */}
          {isOpen && name.trim() && (
            <div className="hidden sm:flex items-center gap-2 rounded bg-zinc-100 px-2.5 py-1 text-xs">
              <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-semibold text-zinc-900">{name}</span>
              <span className="text-zinc-500 font-mono">({duration}m · {formatPrice(price * 100, currency)})</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 transition cursor-pointer"
        >
          {isOpen ? (
            <>
              <X className="size-3.5 text-zinc-500" />
              <span>Ocultar formulario</span>
            </>
          ) : (
            <>
              <Plus className="size-3.5 text-zinc-500" />
              <span>+ Nuevo Servicio</span>
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <form action={createServiceAction} className="p-5 grid gap-4 sm:grid-cols-2 animate-in fade-in duration-150">
        <label className="sm:col-span-2 block">
          <span className="mb-1 block text-xs font-semibold text-zinc-700">
            Nombre del servicio
          </span>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            placeholder="Ej. Corte de autor, Lavado & Styling, Barba Clásica…"
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
          />
        </label>

        <label className="sm:col-span-2 block">
          <span className="mb-1 block text-xs font-semibold text-zinc-700">
            Descripción detallada (opcional)
          </span>
          <input
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Incluye diagnóstico capilar, lavado premium, masaje y peinado final."
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
          />
        </label>

        <div>
          <span className="mb-1 block text-xs font-semibold text-zinc-700">
            Duración estimada (minutos)
          </span>
          <div className="flex items-center gap-2">
            <input
              name="durationMin"
              type="number"
              min={5}
              max={480}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              required
              className="w-24 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 font-mono"
            />
            {/* Quick preset buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDuration(preset)}
                  className={`rounded border px-2 py-1 text-[11px] font-mono transition cursor-pointer ${
                    duration === preset
                      ? "border-zinc-950 bg-zinc-950 text-white font-bold"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {preset}m
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Precio ({currency})
            </span>
            <input
              name="price"
              type="number"
              min={0}
              step={100}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 font-mono"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Color distintivo
            </span>
            <div className="flex items-center gap-2">
              <input
                name="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-md border border-zinc-200 bg-white px-1 py-0.5"
              />
            </div>
          </label>
        </div>

        <div className="sm:col-span-2 pt-2 border-t border-zinc-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex min-h-[36px] items-center gap-2 rounded-md bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Guardar servicio en catálogo</span>
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
