"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCheck,
  Clock,
  LayoutGrid,
  List,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";

import { updateAppointmentStatusAction } from "@/app/admin/actions";
import {
  BookingsTable,
  buildAdminWhatsAppMessage,
  formatWhatsAppPhone,
  type AppointmentItem,
} from "@/components/admin/bookings-table";
import { formatPrice, STATUS_CLASSES, STATUS_LABELS } from "@/lib/format";

type StaffItem = {
  id: string;
  name: string;
  color: string;
};

function formatHour(iso: string): string {
  const date = new Date(iso);
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function AgendaViewManager({
  appointments,
  staff,
  businessName,
  currency,
  currentKey,
}: {
  appointments: AppointmentItem[];
  staff: StaffItem[];
  businessName: string;
  currency: string;
  currentKey: string;
}) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Group appointments by staff member
  const appointmentsByStaff = staff.map((member) => {
    const memberApps = appointments
      .filter((a) => a.staff.id === member.id && a.status !== "CANCELLED")
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    return {
      member,
      appointments: memberApps,
    };
  });

  return (
    <div className="space-y-4">
      {/* View Switcher Ribbon (Metis style) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Modo de Visualización:
          </span>
          <div className="inline-flex rounded-md border border-zinc-200 bg-white p-0.5 shadow-xs text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1 transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-zinc-900 text-white font-semibold"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <List className="size-3.5" />
              <span>Planilla / Tabla</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1 transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-zinc-900 text-white font-semibold"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span>Columnas por Profesional</span>
            </button>
          </div>
        </div>

        <Link
          href="/admin/reservar"
          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
        >
          <CalendarPlus className="size-3.5" />
          <span>+ Cargar cita</span>
        </Link>
      </div>

      {/* Render Table View */}
      {viewMode === "table" ? (
        <BookingsTable
          appointments={appointments}
          businessName={businessName}
          currency={currency}
          title={`Planilla del ${currentKey}`}
        />
      ) : (
        /* Render Column Grid View */
        <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-zinc-200 bg-zinc-50/75 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-zinc-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Línea de Tiempo por Profesional · {currentKey}
              </h2>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              {appointments.filter((a) => a.status !== "CANCELLED").length} citas activas
            </span>
          </div>

          {staff.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500">
              No hay profesionales registrados en el equipo.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
              {appointmentsByStaff.map(({ member, appointments: memberApps }) => (
                <div key={member.id} className="flex flex-col min-w-[280px]">
                  {/* Column Header */}
                  <div className="border-b border-zinc-200 bg-zinc-50/40 p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex size-7 items-center justify-center rounded font-mono text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{member.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {memberApps.length} {memberApps.length === 1 ? "turno" : "turnos"} hoy
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/admin/reservar"
                      className="rounded border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100"
                      title="Agendar turno"
                    >
                      + Cita
                    </Link>
                  </div>

                  {/* Column Content: Appointments List */}
                  <div className="p-3 space-y-2.5 flex-1 min-h-[300px] bg-zinc-50/20">
                    {memberApps.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                        <Clock className="size-6 text-zinc-300 mb-1" />
                        <p className="text-xs font-semibold text-zinc-600">Sin citas agendadas</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Este profesional no tiene turnos para este día.
                        </p>
                      </div>
                    ) : (
                      memberApps.map((item) => {
                        const start = formatHour(item.startAt);
                        const end = formatHour(item.endAt);
                        const cleanPhone = formatWhatsAppPhone(item.clientPhone);
                        const srvName = item.serviceNamesLabel ?? item.service.name;
                        const timeStr = `${start} a ${end} hs`;
                        const waMessage = buildAdminWhatsAppMessage({
                          clientName: item.clientName,
                          businessName,
                          serviceName: srvName,
                          staffName: member.name,
                          timeStr,
                          status: item.status,
                        });
                        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

                        return (
                          <div
                            key={item.id}
                            className="rounded-md border border-zinc-200 bg-white p-3 shadow-xs hover:border-zinc-400 transition"
                          >
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-2">
                              <span className="font-mono text-xs font-bold text-zinc-900">
                                {start} - {end}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                                  STATUS_CLASSES[item.status] ?? "bg-zinc-100 text-zinc-700 border-zinc-200"
                                }`}
                              >
                                {STATUS_LABELS[item.status] ?? item.status}
                              </span>
                            </div>

                            <p className="font-bold text-xs text-zinc-950 truncate">
                              {item.clientName}
                            </p>
                            <div className="mt-0.5">
                              <p className="text-xs text-zinc-700 font-medium truncate">
                                {srvName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 font-mono">
                                <span>{item.totalDurationMin ?? item.service.durationMin}m</span>
                                <span>·</span>
                                <span className="font-semibold text-zinc-800">
                                  {formatPrice(item.totalPriceCents ?? item.service.priceCents, currency)}
                                </span>
                                {item.services && item.services.length > 1 && (
                                  <span className="rounded bg-zinc-100 px-1 py-0.5 text-[9px] font-sans font-bold text-zinc-600">
                                    {item.services.length} serv.
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2">
                                <a
                                  href={`tel:${item.clientPhone}`}
                                  className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900"
                                  title="Llamar al cliente"
                                >
                                  <Phone className="size-3 text-zinc-400" />
                                  <span>{item.clientPhone}</span>
                                </a>

                                {cleanPhone.length >= 7 && (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                                    title="Enviar mensaje por WhatsApp"
                                  >
                                    <MessageCircle className="size-3 text-emerald-600" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {item.status === "PENDING" && (
                                  <form action={updateAppointmentStatusAction}>
                                    <input type="hidden" name="id" value={item.id} />
                                    <input type="hidden" name="status" value="CONFIRMED" />
                                    <button
                                      type="submit"
                                      className="inline-flex h-6 items-center gap-1 rounded bg-zinc-900 px-2 text-[10px] font-semibold text-white hover:bg-zinc-800 cursor-pointer"
                                      title="Confirmar asistencia"
                                    >
                                      <Check className="size-2.5" />
                                      <span>Confirmar</span>
                                    </button>
                                  </form>
                                )}

                                {item.status === "CONFIRMED" && (
                                  <form action={updateAppointmentStatusAction}>
                                    <input type="hidden" name="id" value={item.id} />
                                    <input type="hidden" name="status" value="COMPLETED" />
                                    <button
                                      type="submit"
                                      className="inline-flex h-6 items-center gap-1 rounded border border-zinc-300 bg-white px-2 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                                      title="Marcar turno como completado"
                                    >
                                      <CheckCheck className="size-2.5" />
                                      <span>Completar</span>
                                    </button>
                                  </form>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
