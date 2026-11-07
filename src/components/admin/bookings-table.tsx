"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Search,
  Table as TableIcon,
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
  title = "Planilla de Turnos",
}: {
  appointments: AppointmentItem[];
  businessName: string;
  currency: string;
  title?: string;
}) {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "COMPLETED">("ALL");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, safePage, pageSize]);

  const fromRecord = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const toRecord = Math.min(safePage * pageSize, filtered.length);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
      {/* 1. Metis .box Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/75 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="size-4 text-zinc-700" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
            {title}
          </h2>
          <span className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-700">
            {filtered.length}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-md border border-zinc-200 bg-white p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setFilter("ALL");
              setCurrentPage(1);
            }}
            className={`rounded px-2.5 py-1 transition cursor-pointer ${
              filter === "ALL"
                ? "bg-zinc-900 text-white font-semibold shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Todos ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("PENDING");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1 rounded px-2.5 py-1 transition cursor-pointer ${
              filter === "PENDING"
                ? "bg-amber-500 text-zinc-950 font-semibold shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            {counts.pending > 0 && <span className="size-1.5 rounded-full bg-amber-600" />}
            <span>Pendientes ({counts.pending})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("CONFIRMED");
              setCurrentPage(1);
            }}
            className={`rounded px-2.5 py-1 transition cursor-pointer ${
              filter === "CONFIRMED"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Confirmados ({counts.confirmed})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("COMPLETED");
              setCurrentPage(1);
            }}
            className={`rounded px-2.5 py-1 transition cursor-pointer ${
              filter === "COMPLETED"
                ? "bg-zinc-700 text-white font-semibold shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Completados ({counts.completed})
          </button>
        </div>
      </div>

      {/* 2. Metis DataTable Toolbar Controls */}
      <div className="flex flex-col gap-2 border-b border-zinc-200 bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Page size selector */}
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span>Mostrar</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 outline-none focus:border-zinc-900"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>registros por página</span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por cliente, tel o servicio…"
            className="h-8 w-full rounded border border-zinc-200 bg-white pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 sm:w-64"
          />
        </div>
      </div>

      {/* 3. Flush Table Body */}
      {paginatedItems.length === 0 ? (
        <div className="p-12 text-center">
          <CalendarDays className="mx-auto size-8 text-zinc-300" />
          <p className="mt-2 text-xs font-semibold text-zinc-800">
            No se encontraron registros
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {search
              ? "Prueba modificando el texto de búsqueda o cambiando el filtro."
              : "No hay citas registradas para este criterio."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-[#f8f9fa] text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                <th className="px-4 py-2.5">Horario</th>
                <th className="px-4 py-2.5">Cliente</th>
                <th className="px-4 py-2.5">Servicio</th>
                <th className="px-4 py-2.5">Profesional</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {paginatedItems.map((item, idx) => {
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
                    className={`transition-colors hover:bg-zinc-100/70 ${
                      idx % 2 === 1 ? "bg-zinc-50/40" : "bg-white"
                    }`}
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
                            className="inline-flex h-7 items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-100 cursor-pointer"
                            title="Abrir chat de WhatsApp con plantilla oficial"
                          >
                            <MessageCircle className="size-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {item.status === "PENDING" && (
                          <form action={updateAppointmentStatusAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="CONFIRMED" />
                            <button
                              type="submit"
                              className="inline-flex h-7 items-center gap-1 rounded bg-zinc-900 px-2.5 text-xs font-medium text-white transition hover:bg-zinc-800 cursor-pointer"
                            >
                              <Check className="size-3" />
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
                              className="inline-flex h-7 items-center gap-1 rounded border border-zinc-300 bg-white px-2.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 cursor-pointer"
                            >
                              <CheckCheck className="size-3" />
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
                              className="inline-flex size-7 items-center justify-center rounded border border-transparent text-xs font-medium text-zinc-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                              title="Cancelar cita"
                            >
                              <X className="size-3" />
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

      {/* 4. Metis DataTable Footer Pagination */}
      <div className="flex flex-col gap-2 border-t border-zinc-200 bg-zinc-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-zinc-600">
        <div>
          <span>
            Mostrando <strong>{fromRecord}</strong> a <strong>{toRecord}</strong> de{" "}
            <strong>{filtered.length}</strong> registros
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex size-7 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Página anterior"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`inline-flex size-7 items-center justify-center rounded text-xs font-semibold transition cursor-pointer ${
                  p === safePage
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex size-7 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Página siguiente"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
