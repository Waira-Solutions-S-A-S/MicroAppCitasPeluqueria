import { Save, ShieldCheck } from "lucide-react";

import { changePasswordAction, updateSettingsAction } from "@/app/admin/actions";
import { Flash } from "@/components/admin/flash";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Configuración</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ajustes del negocio</h1>
      </header>

      <Flash ok={params.ok} error={params.error} />

      <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Datos y reglas de reserva</h2>
        <form action={updateSettingsAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Nombre del negocio</span>
            <input
              name="businessName"
              defaultValue={settings.businessName}
              required
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Frase corta</span>
            <input
              name="tagline"
              defaultValue={settings.tagline}
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Moneda</span>
            <input
              name="currency"
              defaultValue={settings.currency}
              maxLength={3}
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm uppercase outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">
              Zona horaria (IANA)
            </span>
            <input
              name="timezone"
              defaultValue={settings.timezone}
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">
              Paso entre horarios (min)
            </span>
            <input
              name="slotStepMin"
              type="number"
              min={5}
              max={120}
              step={5}
              defaultValue={settings.slotStepMin}
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">
              Buffer entre turnos (min)
            </span>
            <input
              name="bufferMin"
              type="number"
              min={0}
              max={240}
              step={5}
              defaultValue={settings.bufferMin}
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">
              Anticipación mínima (horas)
            </span>
            <input
              name="minLeadHours"
              type="number"
              min={0}
              max={720}
              defaultValue={settings.minLeadHours}
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">
              Reserva máxima a futuro (días)
            </span>
            <input
              name="maxAdvanceDays"
              type="number"
              min={1}
              max={365}
              defaultValue={settings.maxAdvanceDays}
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              <Save className="size-4" />
              Guardar ajustes
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <ShieldCheck className="size-4 text-brand" />
          Seguridad
        </h2>
        <p className="mt-1 text-sm text-muted">
          Sesión de <span className="font-medium text-ink">{user?.email}</span>
        </p>
        <form action={changePasswordAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Contraseña actual</span>
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">
              Nueva contraseña (mín. 8)
            </span>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition hover:border-brand hover:text-brand"
            >
              Cambiar contraseña
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
