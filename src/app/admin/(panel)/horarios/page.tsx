import { Plus, Save } from "lucide-react";

import {
  createStaffAction,
  saveHoursAction,
  toggleStaffAction,
  updateStaffAction,
} from "@/app/admin/actions";
import { Flash } from "@/components/admin/flash";
import { prisma } from "@/lib/prisma";
import { minutesToLabel, WEEKDAYS } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;

  const [staff, services] = await Promise.all([
    prisma.staffMember.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        workingHours: true,
        services: { select: { id: true, name: true } },
      },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Equipo</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Profesionales y horarios</h1>
        <p className="mt-1 text-sm text-muted">
          La disponibilidad se calcula con estos horarios, la duración del servicio y los
          turnos ya reservados.
        </p>
      </header>

      <Flash ok={params.ok} error={params.error} />

      <section className="space-y-4">
        {staff.map((member) => {
          const byDay = new Map(member.workingHours.map((hours) => [hours.weekday, hours]));

          return (
            <div
              key={member.id}
              className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-10 place-items-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.slice(0, 1)}
                  </span>
                  <div>
                    <p className="font-semibold">
                      {member.name}
                      {!member.isActive && (
                        <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-stone-500">
                          pausado
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {member.services.length > 0
                        ? member.services.map((service) => service.name).join(" · ")
                        : "Sin servicios asignados"}
                    </p>
                  </div>
                </div>
                <form action={toggleStaffAction}>
                  <input type="hidden" name="id" value={member.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
                  >
                    {member.isActive ? "Pausar" : "Activar"}
                  </button>
                </form>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-brand">
                  Editar nombre y color
                </summary>
                <form action={updateStaffAction} className="mt-3 flex flex-wrap items-end gap-3">
                  <input type="hidden" name="id" value={member.id} />
                  <label>
                    <span className="mb-1 block text-xs font-medium text-muted">Nombre</span>
                    <input
                      name="name"
                      defaultValue={member.name}
                      required
                      minLength={2}
                      className="rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-muted">Color</span>
                    <input
                      name="color"
                      type="color"
                      defaultValue={member.color}
                      className="h-10 w-20 cursor-pointer rounded-xl border border-ink/15 bg-white px-1"
                    />
                  </label>
                  <fieldset className="w-full">
                    <legend className="mb-1 block text-xs font-medium text-muted">
                      Servicios que atiende
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {services.map((service) => (
                        <label
                          key={service.id}
                          className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-xs"
                        >
                          <input
                            type="checkbox"
                            name="serviceIds"
                            value={service.id}
                            defaultChecked={member.services.some(
                              (assigned) => assigned.id === service.id,
                            )}
                            className="size-3.5 accent-[var(--color-brand)]"
                          />
                          {service.name}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Save className="size-4" />
                    Guardar
                  </button>
                </form>
              </details>

              <form action={saveHoursAction} className="mt-4 border-t border-ink/10 pt-4">
                <input type="hidden" name="staffId" value={member.id} />
                <div className="space-y-2">
                  {WEEKDAYS.map((label, day) => {
                    const hours = byDay.get(day);
                    const isOpen = hours ? !hours.isClosed : day !== 0;
                    const start = hours?.startMin ?? 9 * 60;
                    const end = hours?.endMin ?? (day === 6 ? 14 * 60 : 19 * 60);

                    return (
                      <div
                        key={label}
                        className="grid grid-cols-[5.5rem_auto_1fr_1fr] items-center gap-2"
                      >
                        <span className="text-sm font-medium">{label}</span>
                        <label className="flex items-center gap-1.5 text-xs text-muted">
                          <input
                            type="checkbox"
                            name={`open-${day}`}
                            defaultChecked={isOpen}
                            className="size-4 accent-[var(--color-brand)]"
                          />
                          Abre
                        </label>
                        <input
                          type="time"
                          name={`start-${day}`}
                          defaultValue={minutesToLabel(start)}
                          className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm outline-none focus:border-brand"
                        />
                        <input
                          type="time"
                          name={`end-${day}`}
                          defaultValue={minutesToLabel(end)}
                          className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm outline-none focus:border-brand"
                        />
                      </div>
                    );
                  })}
                </div>
                <button
                  type="submit"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  <Save className="size-4" />
                  Guardar horarios
                </button>
              </form>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Plus className="size-4 text-brand" />
          Nuevo profesional
        </h2>
        <form action={createStaffAction} className="mt-4 flex flex-wrap items-end gap-3">
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Nombre</span>
            <input
              name="name"
              required
              minLength={2}
              placeholder="Nombre"
              className="rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Color</span>
            <input
              name="color"
              type="color"
              defaultValue="#0ea5e9"
              className="h-10 w-20 cursor-pointer rounded-xl border border-ink/15 bg-white px-1"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            <Plus className="size-4" />
            Agregar
          </button>
        </form>
      </section>
    </div>
  );
}
