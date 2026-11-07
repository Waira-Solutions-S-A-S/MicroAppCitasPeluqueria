import type { Metadata } from "next";
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

export const metadata: Metadata = { title: "Equipo y Horarios · Panel" };

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
    <div className="space-y-8 antialiased text-zinc-900">
      <header className="border-b border-zinc-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Staff</p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl">
          Equipo y Horarios
        </h1>
        <p className="mt-1 text-xs text-zinc-600">
          La disponibilidad se calcula con estos horarios de atención, la duración de cada servicio y
          las citas reservadas.
        </p>
      </header>

      <Flash ok={params.ok} error={params.error} />

      {/* Agregar nuevo profesional */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="flex items-center gap-2 text-base font-medium text-zinc-950">
          <Plus className="size-4 text-zinc-950" />
          Registrar nuevo profesional
        </h2>

        <form action={createStaffAction} className="mt-6 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Nombre</span>
            <input
              name="name"
              required
              minLength={2}
              placeholder="Ej. Lucas García"
              className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Color distintivo</span>
            <input
              name="color"
              type="color"
              defaultValue="#18181b"
              className="h-10 w-20 cursor-pointer rounded-xl border border-zinc-200 bg-white px-2 py-1"
            />
          </label>

          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Agregar miembro</span>
          </button>
        </form>
      </section>

      {/* Lista de profesionales */}
      <section className="space-y-6">
        {staff.map((member) => {
          const byDay = new Map(member.workingHours.map((hours) => [hours.weekday, hours]));

          return (
            <div
              key={member.id}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <span
                    className="grid size-11 place-items-center rounded-2xl text-sm font-bold text-white shadow-xs"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-base font-bold text-zinc-950">
                      {member.name}
                      {!member.isActive && (
                        <span className="ml-2 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          pausado
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {member.services.length > 0
                        ? member.services.map((service) => service.name).join(" · ")
                        : "Sin servicios vinculados"}
                    </p>
                  </div>
                </div>

                <form action={toggleStaffAction}>
                  <input type="hidden" name="id" value={member.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 underline transition"
                  >
                    {member.isActive ? "Pausar profesional" : "Reactivar profesional"}
                  </button>
                </form>
              </div>

              {/* Editar nombre y asignaciones */}
              <details className="mt-4">
                <summary className="cursor-pointer text-xs font-bold text-zinc-900 hover:underline">
                  Editar datos y servicios de {member.name}
                </summary>
                <form action={updateStaffAction} className="mt-4 grid gap-4 border-t border-zinc-100 pt-4 sm:grid-cols-2">
                  <input type="hidden" name="id" value={member.id} />
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-zinc-700">Nombre</span>
                    <input
                      name="name"
                      defaultValue={member.name}
                      required
                      minLength={2}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-zinc-700">Color</span>
                    <input
                      name="color"
                      type="color"
                      defaultValue={member.color}
                      className="h-10 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-2 py-1"
                    />
                  </label>

                  <fieldset className="sm:col-span-2">
                    <legend className="mb-2 block text-xs font-semibold text-zinc-700">
                      Servicios que realiza
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {services.map((service) => (
                        <label
                          key={service.id}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-xs text-zinc-800 transition hover:bg-zinc-100"
                        >
                          <input
                            type="checkbox"
                            name="serviceIds"
                            value={service.id}
                            defaultChecked={member.services.some(
                              (assigned) => assigned.id === service.id,
                            )}
                            className="size-3.5 accent-zinc-950"
                          />
                          <span>{service.name}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-zinc-800"
                    >
                      <Save className="size-3.5" />
                      <span>Guardar cambios</span>
                    </button>
                  </div>
                </form>
              </details>

              {/* Horarios semanales */}
              <form action={saveHoursAction} className="mt-6 border-t border-zinc-100 pt-5">
                <input type="hidden" name="staffId" value={member.id} />
                <p className="text-xs font-bold text-zinc-950 uppercase tracking-wide mb-3">
                  Horarios laborales semanales
                </p>

                <div className="space-y-2.5">
                  {WEEKDAYS.map((label, day) => {
                    const hours = byDay.get(day);
                    const isOpen = hours ? !hours.isClosed : day !== 0;
                    const start = hours?.startMin ?? 9 * 60;
                    const end = hours?.endMin ?? (day === 6 ? 14 * 60 : 19 * 60);

                    return (
                      <div
                        key={label}
                        className="grid grid-cols-[6rem_auto_1fr_1fr] items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-2 text-xs"
                      >
                        <span className="font-bold text-zinc-900">{label}</span>
                        <label className="flex cursor-pointer items-center gap-1.5 text-zinc-600">
                          <input
                            type="checkbox"
                            name={`open-${day}`}
                            defaultChecked={isOpen}
                            className="size-3.5 accent-zinc-950"
                          />
                          <span>Atiende</span>
                        </label>
                        <input
                          type="time"
                          name={`start-${day}`}
                          defaultValue={minutesToLabel(start)}
                          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 outline-none focus:border-zinc-950"
                        />
                        <input
                          type="time"
                          name={`end-${day}`}
                          defaultValue={minutesToLabel(end)}
                          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 outline-none focus:border-zinc-950"
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-zinc-800"
                >
                  <Save className="size-3.5" />
                  <span>Guardar horarios de {member.name}</span>
                </button>
              </form>
            </div>
          );
        })}
      </section>
    </div>
  );
}
