import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

import { BookingsTable, type AppointmentItem } from "@/components/admin/bookings-table";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { addDays, labelDateLong, nowWallClock, startOfDay } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard · Panel Administrativo" };

export default async function AdminHomePage() {
  const settings = await getSettings();
  const today = startOfDay(nowWallClock(settings.timezone));
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  const [todayAppointments, pendingCount, weekCount] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        startAt: { gte: today, lt: tomorrow },
        status: { not: "CANCELLED" },
      },
      orderBy: { startAt: "asc" },
      include: { service: true, staff: true },
    }),
    prisma.appointment.count({
      where: { status: "PENDING", startAt: { gte: today } },
    }),
    prisma.appointment.count({
      where: {
        startAt: { gte: today, lt: nextWeek },
        status: { not: "CANCELLED" },
      },
    }),
  ]);

  const revenue = todayAppointments.reduce(
    (total, appointment) => total + appointment.service.priceCents,
    0,
  );

  const serialized: AppointmentItem[] = todayAppointments.map((a) => ({
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
    <div className="space-y-6">
      {/* Metis Page Header & Breadcrumbs Ribbon */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Panel</span> <span className="mx-1">/</span> <span className="text-zinc-900">Dashboard</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
            Resumen General
          </h1>
          <p className="text-xs text-zinc-500 font-medium capitalize">
            {labelDateLong(today)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/reservar"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
          >
            <CalendarPlus className="size-3.5" />
            <span>Cargar cita</span>
          </Link>
        </div>
      </div>

      {/* Metis 4-Column Metric Cards (Accent Left Borders) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Citas Hoy */}
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 border-l-4 border-l-zinc-900 bg-white p-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Citas Hoy
            </span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
              {todayAppointments.length}
            </p>
            <p className="text-[11px] text-zinc-500">Turnos agendados</p>
          </div>
          <div className="grid size-11 place-items-center rounded-lg bg-zinc-100 text-zinc-800">
            <CalendarDays className="size-5" />
          </div>
        </div>

        {/* Card 2: Por Confirmar */}
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Por Confirmar
            </span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
              {pendingCount}
            </p>
            <p className="text-[11px] text-zinc-500">Pendientes de respuesta</p>
          </div>
          <div className="grid size-11 place-items-center rounded-lg bg-amber-50 text-amber-700">
            <Clock className="size-5" />
          </div>
        </div>

        {/* Card 3: Próximos 7 días */}
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 border-l-4 border-l-sky-600 bg-white p-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
              Próximos 7 Días
            </span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
              {weekCount}
            </p>
            <p className="text-[11px] text-zinc-500">Citas en calendario</p>
          </div>
          <div className="grid size-11 place-items-center rounded-lg bg-sky-50 text-sky-700">
            <Users className="size-5" />
          </div>
        </div>

        {/* Card 4: Facturación estimada */}
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 border-l-4 border-l-emerald-600 bg-white p-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Facturación Estimada
            </span>
            <p className="mt-1 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
              {formatPrice(revenue, settings.currency)}
            </p>
            <p className="text-[11px] text-zinc-500">Total jornada de hoy</p>
          </div>
          <div className="grid size-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <TrendingUp className="size-5" />
          </div>
        </div>
      </div>

      {/* Main Flush Table Card */}
      <BookingsTable
        appointments={serialized}
        businessName={settings.businessName}
        currency={settings.currency}
        title="Planilla de Turnos de Hoy"
      />
    </div>
  );
}
