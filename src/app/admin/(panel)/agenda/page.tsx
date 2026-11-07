import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

import { BookingsTable, type AppointmentItem } from "@/components/admin/bookings-table";
import { CopyBookingLink } from "@/components/admin/copy-booking-link";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import {
  addDays,
  dateKey,
  labelDateLong,
  nowWallClock,
  parseDateKey,
  startOfDay,
} from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Agenda del Día · Panel" };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const params = await searchParams;
  const settings = await getSettings();
  const today = startOfDay(nowWallClock(settings.timezone));

  const parsed = params.fecha ? parseDateKey(params.fecha) : null;
  const day = parsed
    ? startOfDay(new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)))
    : today;
  const nextDay = addDays(day, 1);
  const currentKey = dateKey(day);
  const todayKey = dateKey(today);

  const appointments = await prisma.appointment.findMany({
    where: { startAt: { gte: day, lt: nextDay } },
    orderBy: { startAt: "asc" },
    include: { service: true, staff: true },
  });

  const active = appointments.filter((appointment) => appointment.status !== "CANCELLED");
  const pending = active.filter((appointment) => appointment.status === "PENDING").length;
  const confirmed = active.filter((appointment) => appointment.status === "CONFIRMED").length;
  const dayRevenue = active.reduce((sum, app) => sum + app.service.priceCents, 0);

  const serialized: AppointmentItem[] = appointments.map((a) => ({
    id: a.id,
    startAt: a.startAt.toISOString(),
    endAt: a.endAt.toISOString(),
    clientName: a.clientName,
    clientPhone: a.clientPhone,
    clientEmail: a.clientEmail,
    status: a.status,
    notes: a.notes,
    service: {
      id: a.service.id,
      name: a.service.name,
      durationMin: a.service.durationMin,
      priceCents: a.service.priceCents,
      color: a.service.color,
    },
    staff: {
      id: a.staff.id,
      name: a.staff.name,
      color: a.staff.color,
    },
  }));

  return (
    <div className="space-y-6 antialiased text-zinc-900">
      {/* Page Header (Metis style) */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Panel</span> <span className="mx-1">/</span> <span className="text-zinc-900">Agenda</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 capitalize">
            {labelDateLong(day)}
          </h1>
        </div>

        {/* Date Jumps & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <CopyBookingLink />

          <div className="flex items-center rounded-md border border-zinc-200 bg-white p-0.5 shadow-xs">
            <Link
              href={`/admin/agenda?fecha=${dateKey(addDays(day, -1))}`}
              className="grid size-8 place-items-center rounded text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
              aria-label="Día anterior"
            >
              <ChevronLeft className="size-4" />
            </Link>

            <Link
              href={`/admin/agenda?fecha=${todayKey}`}
              className={`inline-flex h-8 items-center rounded px-3 text-xs font-semibold transition ${
                currentKey === todayKey
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              Hoy
            </Link>

            <Link
              href={`/admin/agenda?fecha=${dateKey(addDays(day, 1))}`}
              className="grid size-8 place-items-center rounded text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
              aria-label="Día siguiente"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <Link
            href="/admin/reservar"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
          >
            <CalendarPlus className="size-3.5" />
            <span>Nueva cita</span>
          </Link>
        </div>
      </div>

      {/* Metis Day Metric Ribbon */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 border-l-4 border-l-zinc-900 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Total Turnos
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
            {active.length}
          </p>
          <p className="text-[11px] text-zinc-500">Programados para el día</p>
        </div>

        <div className="rounded-lg border border-zinc-200 border-l-4 border-l-emerald-600 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Confirmados
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
            {confirmed}
          </p>
          <p className="text-[11px] text-zinc-500">Asistencia confirmada</p>
        </div>

        <div className="rounded-lg border border-zinc-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
            Por Confirmar
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
            {pending}
          </p>
          <p className="text-[11px] text-zinc-500">Pendientes de respuesta</p>
        </div>

        <div className="rounded-lg border border-zinc-200 border-l-4 border-l-sky-600 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
            Facturación del Día
          </span>
          <p className="mt-1 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
            {formatPrice(dayRevenue, settings.currency)}
          </p>
          <p className="text-[11px] text-zinc-500">Proyectada de la jornada</p>
        </div>
      </div>

      {/* Main Table Flush Card */}
      <BookingsTable
        appointments={serialized}
        businessName={settings.businessName}
        currency={settings.currency}
        title={`Planilla del ${currentKey}`}
      />
    </div>
  );
}
