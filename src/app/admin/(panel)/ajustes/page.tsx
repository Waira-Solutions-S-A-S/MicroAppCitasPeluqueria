import type { Metadata } from "next";
import { Save, ShieldCheck } from "lucide-react";

import { changePasswordAction, updateSettingsAction } from "@/app/admin/actions";
import { Flash } from "@/components/admin/flash";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Ajustes del local · Panel" };

export default async function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  return (
    <div className="space-y-8 antialiased text-zinc-900">
      <header className="border-b border-zinc-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Configuración
        </p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl">
          Ajustes del Estudio
        </h1>
      </header>

      <Flash ok={params.ok} error={params.error} />

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8">
        <div>
          <h2 className="text-base font-medium text-zinc-950">Datos y reglas de reserva</h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Configurá el nombre, la moneda y los tiempos límite para agendar turnos.
          </p>
        </div>

        <form action={updateSettingsAction} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Nombre del negocio</span>
            <input
              name="businessName"
              defaultValue={settings.businessName}
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Frase corta / Tagline</span>
            <input
              name="tagline"
              defaultValue={settings.tagline}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Código de Moneda</span>
            <input
              name="currency"
              defaultValue={settings.currency}
              maxLength={3}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm uppercase text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">
              Zona horaria (IANA)
            </span>
            <input
              name="timezone"
              defaultValue={settings.timezone}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
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
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
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
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
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
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
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
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
            >
              <Save className="size-3.5" />
              <span>Guardar ajustes</span>
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="flex items-center gap-2 text-base font-medium text-zinc-950">
          <ShieldCheck className="size-4 text-zinc-950" />
          Seguridad y acceso
        </h2>
        <p className="mt-1 text-xs text-zinc-600">
          Sesión activa de <span className="font-medium text-zinc-900">{user?.email}</span>
        </p>

        <form action={changePasswordAction} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Contraseña actual</span>
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
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
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-xs font-medium text-zinc-800 shadow-xs transition hover:border-zinc-400 hover:text-zinc-950 cursor-pointer"
            >
              Cambiar contraseña
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
