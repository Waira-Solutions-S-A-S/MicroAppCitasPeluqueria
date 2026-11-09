"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Info,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  Table as TableIcon,
  User,
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
  services?: {
    id: string;
    name: string;
    durationMin: number;
    priceCents: number;
    color: string;
  }[];
  totalDurationMin?: number;
  totalPriceCents?: number;
  serviceNamesLabel?: string;
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
  const [staffFilter, setStaffFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cancellingItem, setCancellingItem] = useState<AppointmentItem | null>(null);
  const [detailItem, setDetailItem] = useState<AppointmentItem | null>(null);

  // Extract distinct staff members
  const staffList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string }>();
    appointments.forEach((a) => {
      if (!map.has(a.staff.id)) {
        map.set(a.staff.id, { id: a.staff.id, name: a.staff.name, color: a.staff.color });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [appointments]);

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

      if (staffFilter !== "ALL" && a.staff.id !== staffFilter) return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const allServiceNames = (
        a.services?.map((s) => s.name) || [a.service.name]
      )
        .join(" ")
        .toLowerCase();

      return (
        a.clientName.toLowerCase().includes(term) ||
        a.clientPhone.toLowerCase().includes(term) ||
        allServiceNames.includes(term) ||
        a.staff.name.toLowerCase().includes(term)
      );
    });
  }, [appointments, filter, staffFilter, search]);

  const filteredRevenue = useMemo(() => {
    return filtered
      .filter((a) => a.status !== "CANCELLED")
      .reduce((sum, a) => sum + (a.totalPriceCents ?? a.service.priceCents), 0);
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, safePage, pageSize]);

  const fromRecord = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const toRecord = Math.min(safePage * pageSize, filtered.length);

  const hasActiveFilters = filter !== "ALL" || staffFilter !== "ALL" || search.trim() !== "";

  const resetFilters = () => {
    setFilter("ALL");
    setStaffFilter("ALL");
    setSearch("");
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = [
      "Horario Inicio",
      "Horario Fin",
      "Cliente",
      "Teléfono",
      "Email",
      "Servicios",
      "Duración (min)",
      "Precio Total",
      "Profesional",
      "Estado",
      "Notas",
    ];

    const rows = filtered.map((a) => {
      const srvLabel =
        a.serviceNamesLabel ||
        (a.services && a.services.length > 0
          ? a.services.map((s) => s.name).join(" + ")
          : a.service.name);

      return [
        formatHour(a.startAt),
        formatHour(a.endAt),
        `"${a.clientName.replace(/"/g, '""')}"`,
        `"${a.clientPhone}"`,
        `"${a.clientEmail ?? ""}"`,
        `"${srvLabel.replace(/"/g, '""')}"`,
        a.totalDurationMin ?? a.service.durationMin,
        formatPrice(a.totalPriceCents ?? a.service.priceCents, currency),
        `"${a.staff.name.replace(/"/g, '""')}"`,
        STATUS_LABELS[a.status] ?? a.status,
        `"${(a.notes ?? "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `turnos-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          {filtered.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200 font-mono">
              Total: {formatPrice(filteredRevenue, currency)}
            </span>
          )}
        </div>

        {/* Toolbar: Export CSV + Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {filtered.length > 0 && (
            <button
              type="button"
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 shadow-xs cursor-pointer"
              title="Descargar listado en formato Excel / CSV"
            >
              <Download className="size-3.5 text-zinc-500" />
              <span>CSV</span>
            </button>
          )}

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
      </div>

      {/* 2. Metis DataTable Toolbar Controls */}
      <div className="flex flex-col gap-2.5 border-b border-zinc-200 bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
          {/* Page size selector */}
          <div className="flex items-center gap-1.5">
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
          </div>

          {/* Professional filter dropdown */}
          {staffList.length > 1 && (
            <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-3">
              <User className="size-3 text-zinc-400" />
              <select
                value={staffFilter}
                onChange={(e) => {
                  setStaffFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 outline-none focus:border-zinc-900"
              >
                <option value="ALL">Todos los profesionales</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset filters button if active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="size-3" />
              <span>Limpiar filtros</span>
            </button>
          )}
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
            No se encontraron citas
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {hasActiveFilters
              ? "Prueba modificando el texto de búsqueda o cambiando el filtro."
              : "No hay turnos registrados para este criterio en este momento."}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
            >
              <RotateCcw className="size-3 text-zinc-500" />
              <span>Restablecer filtros</span>
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/admin/reservar"
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
              >
                <span>+ Cargar cita</span>
              </Link>
              <Link
                href="/admin/agenda"
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50"
              >
                <span>Ver agenda</span>
              </Link>
            </div>
          )}
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
                const srvName =
                  item.serviceNamesLabel ||
                  (item.services && item.services.length > 0
                    ? item.services.map((s) => s.name).join(" + ")
                    : item.service.name);

                const waMessage = buildAdminWhatsAppMessage({
                  clientName: item.clientName,
                  businessName,
                  serviceName: srvName,
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
                        {item.totalDurationMin ?? item.service.durationMin}m
                      </span>
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailItem(item)}
                          className="font-semibold text-zinc-900 hover:text-blue-600 hover:underline text-left cursor-pointer"
                          title="Ver ficha completa de la cita"
                        >
                          {item.clientName}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={`tel:${item.clientPhone}`}
                          className="inline-flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-950 hover:underline"
                          title="Llamar al cliente"
                        >
                          <Phone className="size-2.5 text-zinc-400" />
                          <span>{item.clientPhone}</span>
                        </a>
                      </div>
                      {item.notes && (
                        <span className="mt-1 block max-w-xs truncate text-[11px] text-zinc-500 italic bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">
                          “{item.notes}”
                        </span>
                      )}
                    </td>

                    {/* Servicio */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 leading-tight">
                          {srvName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.services && item.services.length > 1 && (
                            <span className="rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] font-semibold text-zinc-700 border border-zinc-200">
                              {item.services.length} servicios
                            </span>
                          )}
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {formatPrice(item.totalPriceCents ?? item.service.priceCents, currency)}
                          </span>
                        </div>
                      </div>
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
                        <button
                          type="button"
                          onClick={() => setDetailItem(item)}
                          className="inline-flex size-7 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                          title="Ver detalle completo"
                        >
                          <Eye className="size-3.5" />
                        </button>

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
                          <button
                            type="button"
                            onClick={() => setCancellingItem(item)}
                            className="inline-flex size-7 items-center justify-center rounded border border-transparent text-xs font-medium text-zinc-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                            title="Cancelar cita"
                          >
                            <X className="size-3" />
                          </button>
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

      {/* 5. Detail Modal Inspector */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Info className="size-4 text-zinc-700" />
                <h3 className="text-sm font-bold text-zinc-950">Ficha Detallada del Turno</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-md bg-zinc-50 p-3 border border-zinc-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Cliente
                  </span>
                  <p className="font-semibold text-zinc-950 mt-0.5">{detailItem.clientName}</p>
                  <a
                    href={`tel:${detailItem.clientPhone}`}
                    className="inline-flex items-center gap-1 text-zinc-600 hover:underline mt-0.5"
                  >
                    <Phone className="size-3 text-zinc-400" />
                    <span>{detailItem.clientPhone}</span>
                  </a>
                  {detailItem.clientEmail && (
                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{detailItem.clientEmail}</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Horario Programado
                  </span>
                  <p className="font-mono font-bold text-zinc-950 mt-0.5">
                    {formatHour(detailItem.startAt)} - {formatHour(detailItem.endAt)} hs
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Duración total: {detailItem.totalDurationMin ?? detailItem.service.durationMin} minutos
                  </p>
                </div>
              </div>

              <div className="rounded-md bg-zinc-50 p-3 border border-zinc-100">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-200/60 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {detailItem.services && detailItem.services.length > 1
                      ? `Servicios Incluidos (${detailItem.services.length})`
                      : "Servicio Seleccionado"}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-zinc-600">
                    {detailItem.totalDurationMin ?? detailItem.service.durationMin} min totales
                  </span>
                </div>

                {detailItem.services && detailItem.services.length > 1 ? (
                  <div className="space-y-1.5">
                    {detailItem.services.map((s, idx) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between text-xs border-b border-zinc-200/40 pb-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="font-semibold text-zinc-900">
                            {idx + 1}. {s.name}
                          </span>
                        </div>
                        <span className="font-mono text-zinc-600">
                          {s.durationMin}m · {formatPrice(s.priceCents, currency)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-1.5 text-xs font-bold text-zinc-950">
                      <span>Total acumulado:</span>
                      <span className="font-mono">
                        {detailItem.totalDurationMin}m · {formatPrice(detailItem.totalPriceCents ?? detailItem.service.priceCents, currency)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-950">{detailItem.service.name}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {detailItem.service.durationMin} minutos
                      </p>
                    </div>
                    <p className="font-mono text-zinc-950 font-bold text-sm">
                      {formatPrice(detailItem.service.priceCents, currency)}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-md bg-zinc-50 p-3 border border-zinc-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Profesional Asignado
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: detailItem.staff.color }}
                    />
                    <span className="font-semibold text-zinc-900">{detailItem.staff.name}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Estado del Turno
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium border ${
                        STATUS_CLASSES[detailItem.status] ?? "bg-zinc-100 text-zinc-700 border-zinc-200"
                      }`}
                    >
                      <span>{STATUS_LABELS[detailItem.status] ?? detailItem.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              {detailItem.notes && (
                <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Notas o Preferencias del Cliente
                  </span>
                  <p className="mt-1 text-zinc-800 italic leading-relaxed">{detailItem.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
              <a
                href={`https://wa.me/${formatWhatsAppPhone(detailItem.clientPhone)}?text=${encodeURIComponent(
                  buildAdminWhatsAppMessage({
                    clientName: detailItem.clientName,
                    businessName,
                    serviceName: detailItem.serviceNamesLabel ?? detailItem.service.name,
                    staffName: detailItem.staff.name,
                    timeStr: `${formatHour(detailItem.startAt)} a ${formatHour(detailItem.endAt)} hs`,
                    status: detailItem.status,
                  })
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-950 hover:bg-emerald-100"
              >
                <MessageCircle className="size-3.5 text-emerald-600" />
                <span>Contactar por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="inline-flex h-8 items-center rounded border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                Cerrar ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Confirmation Modal Safeguard for Cancellation */}
      {cancellingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-950">¿Confirmar Cancelación?</h3>
                <p className="text-xs text-zinc-500">Esta acción liberará el horario de atención.</p>
              </div>
            </div>

            <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3 text-xs text-zinc-700 space-y-1 my-4">
              <p>
                <strong>Cliente:</strong> {cancellingItem.clientName} ({cancellingItem.clientPhone})
              </p>
              <p>
                <strong>Servicio:</strong> {cancellingItem.service.name}
              </p>
              <p>
                <strong>Profesional:</strong> {cancellingItem.staff.name}
              </p>
              <p>
                <strong>Horario:</strong> {formatHour(cancellingItem.startAt)} a {formatHour(cancellingItem.endAt)} hs
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setCancellingItem(null)}
                className="inline-flex h-8 items-center rounded border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                No, conservar turno
              </button>

              <form action={updateAppointmentStatusAction}>
                <input type="hidden" name="id" value={cancellingItem.id} />
                <input type="hidden" name="status" value="CANCELLED" />
                <button
                  type="submit"
                  className="inline-flex h-8 items-center gap-1 rounded bg-red-600 px-3.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer shadow-xs"
                >
                  <X className="size-3.5" />
                  <span>Sí, cancelar cita</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
