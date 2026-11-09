"use client";

import { useState } from "react";
import { Plus, User, UserCheck, Users, X } from "lucide-react";

import { createStaffAction, updateStaffAction } from "@/app/admin/actions";
import { StaffCardHeader } from "@/components/admin/staff-card-header";
import { StaffScheduleEditor } from "@/components/admin/staff-schedule-editor";

type StaffMemberItem = {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  workingHours: {
    weekday: number;
    startMin: number;
    endMin: number;
    isClosed: boolean;
  }[];
  services: { id: string; name: string }[];
};

type ServiceItem = {
  id: string;
  name: string;
};

export function StaffManager({
  staff,
  services,
}: {
  staff: StaffMemberItem[];
  services: ServiceItem[];
}) {
  const [activeStaffId, setActiveStaffId] = useState<string>(staff[0]?.id ?? "");
  const [isNewOpen, setIsNewOpen] = useState(false);

  const activeMember = staff.find((m) => m.id === activeStaffId) ?? staff[0];

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar with Staff Tabs & Add Member Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-3">
        {/* Horizontal Staff Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {staff.map((member) => {
            const isActive = member.id === activeMember?.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setActiveStaffId(member.id)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap shadow-xs ${
                  isActive
                    ? "border-zinc-950 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
                }`}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: member.color }}
                />
                <span>{member.name}</span>
                {!member.isActive && (
                  <span
                    className={`rounded px-1 py-0.2 text-[9px] uppercase font-bold ${
                      isActive ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    Pausado
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Collapsible New Staff Button */}
        <button
          type="button"
          onClick={() => setIsNewOpen((prev) => !prev)}
          className="inline-flex min-h-[32px] shrink-0 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 transition cursor-pointer"
        >
          {isNewOpen ? (
            <>
              <X className="size-3.5 text-zinc-500" />
              <span>Ocultar registro</span>
            </>
          ) : (
            <>
              <Plus className="size-3.5 text-zinc-500" />
              <span>+ Nuevo Profesional</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Collapsible Form: Registrar Nuevo Profesional */}
      {isNewOpen && (
        <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="border-b border-zinc-200 bg-zinc-50/75 px-5 py-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
              <Plus className="size-4 text-zinc-700" />
              <span>Registrar Nuevo Profesional en el Equipo</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsNewOpen(false)}
              className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="size-4" />
            </button>
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
      )}

      {/* 3. Single Active Member Card (Zero Infinite Scrolling) */}
      {activeMember ? (
        <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
          {/* Member Card Header (Name, Color, Edit, Pause) */}
          <StaffCardHeader member={activeMember} />

          <div className="p-5 space-y-5">
            {/* Weekly Schedule Editor */}
            <StaffScheduleEditor
              staffId={activeMember.id}
              staffName={activeMember.name}
              workingHours={activeMember.workingHours}
            />

            {/* Service Assignment */}
            <div className="border-t border-zinc-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Servicios asignados a {activeMember.name}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Marca los servicios que este profesional está capacitado para brindar.
                  </p>
                </div>
              </div>

              <form action={updateStaffAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={activeMember.id} />
                <input type="hidden" name="name" value={activeMember.name} />
                <input type="hidden" name="color" value={activeMember.color} />

                {services.map((service) => {
                  const assigned = activeMember.services.some((s) => s.id === service.id);
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
                  className="ml-auto inline-flex min-h-[30px] items-center rounded border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100 cursor-pointer shadow-xs"
                >
                  Actualizar servicios asignados
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center text-xs text-zinc-500">
          <Users className="mx-auto size-8 text-zinc-300 mb-2" />
          <p className="font-semibold text-zinc-800">No hay profesionales registrados</p>
          <p className="mt-1">Registra al primer miembro del equipo usando el botón superior.</p>
        </div>
      )}
    </div>
  );
}
