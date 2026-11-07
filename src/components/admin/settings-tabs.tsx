"use client";

import { useState } from "react";
import {
  CalendarClock,
  Check,
  Lock,
  Save,
  Settings,
  ShieldCheck,
  Store,
} from "lucide-react";

import { changePasswordAction, updateSettingsAction } from "@/app/admin/actions";

type SettingsData = {
  businessName: string;
  tagline: string;
  currency: string;
  timezone: string;
  slotStepMin: number;
  bufferMin: number;
  minLeadHours: number;
  maxAdvanceDays: number;
};

export function SettingsTabs({
  settings,
  userEmail,
}: {
  settings: SettingsData;
  userEmail: string;
}) {
  const [activeTab, setActiveTab] = useState<"general" | "rules" | "security">("general");

  return (
    <div className="space-y-4">
      {/* Metis Nav Tabs Ribbon */}
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === "general"
                ? "border-zinc-950 text-zinc-950"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
            }`}
          >
            <Store className="size-4" />
            <span>Datos del Negocio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === "rules"
                ? "border-zinc-950 text-zinc-950"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
            }`}
          >
            <CalendarClock className="size-4" />
            <span>Reglas de Reserva</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === "security"
                ? "border-zinc-950 text-zinc-950"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>Seguridad y Contraseña</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Datos del Negocio */}
      {activeTab === "general" && (
        <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="border-b border-zinc-200 bg-zinc-50/75 px-5 py-3.5 flex items-center gap-2">
            <Store className="size-4 text-zinc-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
              Identidad Comercial y Configuración Regional
            </h2>
          </div>

          <form action={updateSettingsAction} className="p-5 grid gap-4 sm:grid-cols-2">
            {/* Preserve other settings as hidden inputs */}
            <input type="hidden" name="slotStepMin" value={settings.slotStepMin} />
            <input type="hidden" name="bufferMin" value={settings.bufferMin} />
            <input type="hidden" name="minLeadHours" value={settings.minLeadHours} />
            <input type="hidden" name="maxAdvanceDays" value={settings.maxAdvanceDays} />

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-700">
                Nombre comercial del negocio
              </span>
              <input
                name="businessName"
                defaultValue={settings.businessName}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
              <span className="mt-1 block text-[11px] text-zinc-400">
                Aparecerá en el portal web de reservas y en los mensajes automáticos de WhatsApp.
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-700">
                Eslogan / Frase corta
              </span>
              <input
                name="tagline"
                defaultValue={settings.tagline}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
              <span className="mt-1 block text-[11px] text-zinc-400">
                Subtítulo visible en la cabecera de la web pública de clientes.
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-700">
                Moneda local (Código ISO)
              </span>
              <input
                name="currency"
                defaultValue={settings.currency}
                maxLength={3}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs uppercase text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 font-mono"
              />
              <span className="mt-1 block text-[11px] text-zinc-400">
                Ej: COP, USD, EUR, ARS, MXN. Se utilizará para formatear todas las tarifas.
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-700">
                Zona horaria del estudio
              </span>
              <input
                name="timezone"
                defaultValue={settings.timezone}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 font-mono"
              />
              <span className="mt-1 block text-[11px] text-zinc-400">
                Zona horaria IANA (ej: America/Bogota, America/Argentina/Buenos_Aires).
              </span>
            </label>

            <div className="sm:col-span-2 pt-2 border-t border-zinc-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
              >
                <Save className="size-3.5" />
                <span>Guardar datos comerciales</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Reglas de Reserva */}
      {activeTab === "rules" && (
        <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="border-b border-zinc-200 bg-zinc-50/75 px-5 py-3.5 flex items-center gap-2">
            <CalendarClock className="size-4 text-zinc-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
              Intervalos y Reglas de Reserva
            </h2>
          </div>

          <form action={updateSettingsAction} className="p-5 grid gap-4 sm:grid-cols-2">
            {/* Preserve other settings as hidden inputs */}
            <input type="hidden" name="businessName" value={settings.businessName} />
            <input type="hidden" name="tagline" value={settings.tagline} />
            <input type="hidden" name="currency" value={settings.currency} />
            <input type="hidden" name="timezone" value={settings.timezone} />

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-700">
                Intervalo entre turnos (minutos)
              </span>
              <input
                name="slotStepMin"
                type="number"
                min={5}
                max={120}
                step={5}
                defaultValue={settings.slotStepMin}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
              <span className="mt-1 block text-[11px] text-zinc-400">
                Frecuencia de las horas que verán los clientes (ej: cada 15, 30 o 45 minutos).
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-700">
                Buffer de descanso entre citas (minutos)
              </span>
              <input
                name="bufferMin"
                type="number"
                min={0}
                max={240}
                step={5}
                defaultValue={settings.bufferMin}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
              <span className="mt-1 block text-[11px] text-zinc-400">
                Tiempo de limpieza y preparación entre turnos consecutivos del profesional.
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-700">
                Anticipación mínima para reservar (horas)
              </span>
              <input
                name="minLeadHours"
                type="number"
                min={0}
                max={720}
                defaultValue={settings.minLeadHours}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
              <span className="mt-1 block text-[11px] text-zinc-400">
                Horas de antelación que un cliente debe tener para pedir un turno (ej: 2 horas antes).
              </span>
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
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
              <span className="mt-1 block text-[11px] text-zinc-400">
                Máxima cantidad de días a futuro que se habilitan en el calendario web (ej: 30 días).
              </span>
            </label>

            <div className="sm:col-span-2 pt-2 border-t border-zinc-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
              >
                <Save className="size-3.5" />
                <span>Guardar reglas de agenda</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Seguridad y Contraseña */}
      {activeTab === "security" && (
        <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="border-b border-zinc-200 bg-zinc-50/75 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-zinc-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Credenciales de Acceso
              </h2>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              Usuario: {userEmail}
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
                placeholder="Ingresa tu contraseña actual"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-700">
                Nueva contraseña
              </span>
              <input
                name="newPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
            </label>

            <div className="sm:col-span-2 pt-2 border-t border-zinc-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
              >
                <Lock className="size-3.5" />
                <span>Actualizar contraseña</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
