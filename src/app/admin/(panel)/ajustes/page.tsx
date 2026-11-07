import type { Metadata } from "next";
import { Lock, Save, Settings, ShieldCheck } from "lucide-react";

import { changePasswordAction, updateSettingsAction } from "@/app/admin/actions";
import { Flash } from "@/components/admin/flash";
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

      {/* Metis Card: Datos y reglas de reserva */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50/75 px-5 py-3.5 flex items-center gap-2">
          <Settings className="size-4 text-zinc-700" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
            Datos Principales y Reglas de Agenda
          </h2>
        </div>

        <form action={updateSettingsAction} className="p-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Nombre del negocio</span>
            <input
              name="businessName"
              defaultValue={settings.businessName}
              required
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Frase corta / Tagline</span>
            <input
              name="tagline"
              defaultValue={settings.tagline}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Código de Moneda</span>
            <input
              name="currency"
              defaultValue={settings.currency}
              maxLength={3}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs uppercase text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Zona horaria (IANA)
            </span>
            <input
              name="timezone"
              defaultValue={settings.timezone}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Paso entre horarios (minutos)
            </span>
            <input
              name="slotStepMin"
              type="number"
              min={5}
              max={120}
              step={5}
              defaultValue={settings.slotStepMin}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Buffer de descanso entre turnos (minutos)
            </span>
            <input
              name="bufferMin"
              type="number"
              min={0}
              max={240}
              step={5}
              defaultValue={settings.bufferMin}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Anticipación mínima de reserva (horas)
            </span>
            <input
              name="minLeadHours"
              type="number"
              min={0}
              max={720}
              defaultValue={settings.minLeadHours}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Anticipación máxima permitida (días)
            </span>
            <input
              name="maxAdvanceDays"
              type="number"
              min={1}
              max={365}
              defaultValue={settings.maxAdvanceDays}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="inline-flex min-h-[36px] items-center gap-2 rounded-md bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
            >
              <Save className="size-3.5" />
              <span>Guardar cambios</span>
            </button>
          </div>
        </form>
      </div>

      {/* Metis Card: Seguridad de la cuenta */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50/75 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-zinc-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
              Seguridad y Clave de Acceso
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            Sesión activa: {user?.email}
          </span>
        </div>

        <form action={changePasswordAction} className="p-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Contraseña actual</span>
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Nueva contraseña (mínimo 8 caracteres)
            </span>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="inline-flex min-h-[36px] items-center gap-2 rounded-md bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
            >
              <Lock className="size-3.5" />
              <span>Actualizar clave de acceso</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
