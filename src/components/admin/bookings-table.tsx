"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCheck,
  MessageCircle,
  Search,
  X,
} from "lucide-react";

import { updateAppointmentStatusAction } from "@/app/admin/actions";
import { formatPrice, STATUS_CLASSES, STATUS_LABELS } from "@/lib/format";

export type AppointmentItem = {
  id: string;
  startAt: string; // ISO
  endAt: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  status: string;
  notes: string | null;
  service: {
    id: string;
    name: string;
    durationMin: number;
    priceCents: number;
    color: string;
  };
  staff: {
    id: string;
    name: string;
    color: string;
  };
};

function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("3")) {
    return `57${digits}`;
  }
  return digits;
}

function buildAdminWhatsAppMessage({
  clientName,
  businessName,
  serviceName,
  staffName,
  timeStr,
  status,
}: {
  clientName: string;
  businessName: string;
  serviceName: string;
  staffName: string;
  timeStr: string;
  status: string;
}) {
  if (status === "PENDING") {
    return `Hola ${clientName}, te escribo de *${businessName}*.\n\nRecibimos tu solicitud de turno:\n- Servicio: *${serviceName}*\n- Profesional: *${staffName}*\n- Horario: *${timeStr}*\n\n¿Nos confirmas tu asistencia para agendarlo formalmente? ¡Muchas gracias!`;
  }
  if (status === "CONFIRMED") {
    return `Hola ${clientName}, te escribo de *${businessName}* para recordarte tu turno:\n- Servicio: *${serviceName}*\n- Profesional: *${staffName}*\n- Horario: *${timeStr}*\n\n¡Te esperamos en el estudio!`;
  }
  if (status === "COMPLETED") {
    return `Hola ${clientName}, muchas gracias por tu visita a *${businessName}*. Esperamos que hayas tenido una excelente experiencia con *${staffName}*. ¡Hasta la próxima!`;
  }
  return `Hola ${clientName}, te escribo de *${businessName}* con relación a tu turno de *${serviceName}* (${timeStr}).`;
}

function formatHour(iso: string): string {
  const date = new Date(iso);
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function BookingsTable({
  appointments,
  businessName,
  currency,
  title = "Planilla de Citas",
}: {
  appointments: AppointmentItem[];
  businessName: string;
  currency: string;
  title?: string;
}) {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "COMPLETED">("ALL");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter((a) => a.status === "PENDING").length,
      confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
    };
  }, [appointments]);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (filter === "PENDING" && a.status !== "PENDING") return false;
      if (filter === "CONFIRMED" && a.status !== "CONFIRMED") return false;
      if (filter === "COMPLETED" && a.status !== "COMPLETED") return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        a.clientName.toLowerCase().includes(term) ||
        a.clientPhone.toLowerCase().includes(term) ||
        a.service.name.toLowerCase().includes(term) ||
        a.staff.name.toLowerCase().includes(term)
      );
    });
  }, [appointments, filter, search]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
      {/* Card Header (Bootstrap/Metis style) */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-950">
            {title}
          </h2>
          <p className="text-[11px] text-zinc-500 font-medium">
            {filtered.length} {filtered.length === 1 ? "registro listado" : "registros listados"}
          </p>
        </div>

        {/* Toolbar: Filter Tabs + Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pill tabs */}
          <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`rounded px-2.5 py-1 transition cursor-pointer ${
                filter === "ALL"
                  ? "bg-white text-zinc-950 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Todos ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setFilter("PENDING")}
              className={`inline-flex items-center gap-1 rounded px-2.5 py-1 transition cursor-pointer ${
                filter === "PENDING"
                  ? "bg-white text-zinc-950 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              {counts.pending > 0 && <span className="size-1.5 rounded-full bg-amber-500" />}
              <span>Pendientes ({counts.pending})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("CONFIRMED")}
              className={`rounded px-2.5 py-1 transition cursor-pointer ${
                filter === "CONFIRMED"
                  ? "bg-white text-zinc-950 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Confirmados ({counts.confirmed})
            </button>
            <button
              type="button"
              onClick={() => setFilter("COMPLETED")}
              className={`rounded px-2.5 py-1 transition cursor-pointer ${
                filter === "COMPLETED"
                  ? "bg-white text-zinc-950 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Completados ({counts.completed})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar citas…"
              className="h-8 w-44 rounded-md border border-zinc-200 bg-white pl-7 pr-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Flush Data Table (Clean, flat, border-driven) */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center">
          <CalendarDays className="mx-auto size-7 text-zinc-300" />
          <p className="mt-2 text-xs font-semibold text-zinc-800">
            No hay citas para mostrar
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {search
              ? "No se encontraron coincidencias para la búsqueda."
              : "No se registran turnos en este estado."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2.5">Horario</th>
                <th className="px-4 py-2.5">Cliente</th>
                <th className="px-4 py-2.5">Servicio</th>
                <th className="px-4 py-2.5">Profesional</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.map((item) => {
                const startTime = formatHour(item.startAt);
                const endTime = formatHour(item.endAt);
                const timeStr = `${startTime} a ${endTime} hs`;
                const cleanPhone = formatWhatsAppPhone(item.clientPhone);
                const waMessage = buildAdminWhatsAppMessage({
                  clientName: item.clientName,
                  businessName,
                  serviceName: item.service.name,
                  staffName: item.staff.name,
                  timeStr,
                  status: item.status,
                });
                const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-zinc-50/75"
                  >
                    {/* Horario */}
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-zinc-900">
                      <span>{startTime}</span>
                      <span className="text-zinc-500"> - {endTime}</span>
                      <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-normal text-zinc-600 font-sans">
                        {item.service.durationMin}m
                      </span>
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-zinc-900">
                        {item.clientName}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {item.clientPhone}
                      </span>
                      {item.notes && (
                        <span className="mt-0.5 block max-w-xs truncate text-[11px] text-zinc-500 italic">
                          “{item.notes}”
                        </span>
                      )}
                    </td>

                    {/* Servicio */}
                    <td className="px-4 py-3">
                      <span className="block font-medium text-zinc-900">
                        {item.service.name}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {formatPrice(item.service.priceCents, currency)}
                      </span>
                    </td>

                    {/* Profesional */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-800">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: item.staff.color }}
                        />
                        <span>{item.staff.name}</span>
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium border ${
                          STATUS_CLASSES[item.status] ?? "bg-zinc-100 text-zinc-700 border-zinc-200"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            item.status === "PENDING"
                              ? "bg-amber-500 animate-pulse"
                              : item.status === "CONFIRMED"
                                ? "bg-emerald-500"
                                : item.status === "COMPLETED"
                                  ? "bg-zinc-400"
                                  : "bg-red-500"
                          }`}
                        />
                        <span>{STATUS_LABELS[item.status] ?? item.status}</span>
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {cleanPhone.length >= 7 && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-100 hover:border-emerald-300"
                            title="Abrir chat en WhatsApp con mensaje listo"
                          >
                            <MessageCircle className="size-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {item.status === "PENDING" && (
                          <form action={updateAppointmentStatusAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="CONFIRMED" />
                            <button
                              type="submit"
                              className="inline-flex h-8 items-center gap-1 rounded bg-zinc-900 px-2.5 text-xs font-medium text-white transition hover:bg-zinc-800 cursor-pointer"
                            >
                              <Check className="size-3.5" />
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
                              className="inline-flex h-8 items-center gap-1 rounded border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 cursor-pointer"
                            >
                              <CheckCheck className="size-3.5" />
                              <span>Completar</span>
                            </button>
                          </form>
                        )}

                        {(item.status === "PENDING" || item.status === "CONFIRMED") && (
                          <form action={updateAppointmentStatusAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="CANCELLED" />
                            <button
                              type="submit"
                              className="inline-flex h-8 items-center justify-center rounded border border-transparent px-2 text-xs font-medium text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                              title="Cancelar cita"
                            >
                              <X className="size-3.5" />
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
