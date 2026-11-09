import type { Metadata } from "next";
import { Plus, Save, UserCheck, Users } from "lucide-react";

import {
  createStaffAction,
  saveHoursAction,
  toggleStaffAction,
  updateStaffAction,
} from "@/app/admin/actions";
import { Flash } from "@/components/admin/flash";
import { StaffCardHeader } from "@/components/admin/staff-card-header";
import { StaffScheduleEditor } from "@/components/admin/staff-schedule-editor";
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
    <div className="space-y-6 antialiased text-zinc-900">
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Panel</span> <span className="mx-1">/</span> <span className="text-zinc-900">Equipo</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
            Equipo y Horarios de Atención
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Define la disponibilidad, turnos semanales y servicios que atiende cada miembro del equipo.
          </p>
        </div>
      </div>

      <Flash ok={params.ok} error={params.error} />

      {/* Metis Card: Registrar nuevo profesional */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50/75 px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
            <Plus className="size-4 text-zinc-700" />
            <span>Registrar Nuevo Profesional</span>
          </h2>
        </div>

        <form action={createStaffAction} className="p-5 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Nombre completo</span>
            <input
              name="name"
              required
              minLength={2}
              placeholder="Ej. Lucas García"
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-700">Color distintivo</span>
            <input
              name="color"
              type="color"
              defaultValue="#18181b"
              className="h-8 w-20 cursor-pointer rounded-md border border-zinc-200 bg-white px-2 py-1"
            />
          </label>

          <button
            type="submit"
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Agregar miembro</span>
          </button>
        </form>
      </div>

      {/* Lista de profesionales (Cards Metis) */}
      <div className="space-y-4">
        {staff.map((member) => {
          const byDay = new Map(member.workingHours.map((hours) => [hours.weekday, hours]));

          return (
            <div
              key={member.id}
              className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden"
            >
              {/* Member Card Header */}
              <StaffCardHeader member={member} />

              {/* Horarios semanales del miembro */}
              <div className="p-5">
                <StaffScheduleEditor
                  staffId={member.id}
                  staffName={member.name}
                  workingHours={member.workingHours}
                />

                {/* Asignación de servicios */}
                <div className="mt-5 border-t border-zinc-100 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Servicios asignados a {member.name}
                  </p>
                  <form action={updateStaffAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={member.id} />
                    <input type="hidden" name="name" value={member.name} />
                    <input type="hidden" name="color" value={member.color} />

                    {services.map((service) => {
                      const assigned = member.services.some((s) => s.id === service.id);
                      return (
                        <label
                          key={service.id}
                          className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-2.5 py-1 text-xs cursor-pointer transition select-none hover:bg-zinc-50 text-zinc-700 has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-900 has-[:checked]:text-white has-[:checked]:font-medium"
                        >
                          <input
                            type="checkbox"
                            name="serviceIds"
                            value={service.id}
                            defaultChecked={assigned}
                            className="hidden"
                          />
                          <span>{service.name}</span>
                        </label>
                      );
                    })}

                    <button
                      type="submit"
                      className="ml-auto inline-flex min-h-[28px] items-center rounded border border-zinc-300 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-800 transition hover:bg-zinc-100"
                    >
                      Actualizar servicios
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
