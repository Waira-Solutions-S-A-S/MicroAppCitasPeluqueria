import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  Scissors,
  Settings,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import { BookingsTable, type AppointmentItem } from "@/components/admin/bookings-table";
import { formatPrice } from "@/lib/format";
import { resolveAppointmentServices } from "@/lib/multi-service";
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

  const [todayAppointments, pendingCount, weekCount, activeStaff, allServices] = await Promise.all([
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
    prisma.staffMember.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        appointments: {
          where: {
            startAt: { gte: today, lt: tomorrow },
            status: { not: "CANCELLED" },
          },
          orderBy: { startAt: "asc" },
          select: { id: true, startAt: true },
        },
      },
    }),
    prisma.service.findMany({
      select: {
        id: true,
        name: true,
        durationMin: true,
        priceCents: true,
        color: true,
      },
    }),
  ]);

  const servicesMap = new Map(allServices.map((s) => [s.id, s]));

  const serialized: AppointmentItem[] = todayAppointments.map((a) => {
    const resolved = resolveAppointmentServices(a.service, a.notes, servicesMap);
    return {
      id: a.id,
      startAt: a.startAt.toISOString(),
      endAt: a.endAt.toISOString(),
      clientName: a.clientName,
      clientPhone: a.clientPhone,
      clientEmail: a.clientEmail,
      status: a.status,
      notes: resolved.cleanNotes,
      service: {
        id: a.service.id,
        name: a.service.name,
        durationMin: a.service.durationMin,
        priceCents: a.service.priceCents,
        color: a.service.color,
      },
      services: resolved.services,
      totalDurationMin: resolved.totalDurationMin,
      totalPriceCents: resolved.totalPriceCents,
      serviceNamesLabel: resolved.serviceNamesLabel,
      staff: {
        id: a.staff.id,
        name: a.staff.name,
        color: a.staff.color,
      },
    };
  });

  const revenue = serialized.reduce(
    (total, item) => total + (item.totalPriceCents ?? item.service.priceCents),
    0,
  );

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
            href="/admin/agenda"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs transition hover:bg-zinc-50 hover:text-zinc-950"
          >
            <CalendarDays className="size-3.5 text-zinc-500" />
            <span>Ver agenda de hoy</span>
          </Link>
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
        <Link
          href="/admin/agenda"
          className="group flex items-center justify-between rounded-lg border border-zinc-200 border-l-4 border-l-zinc-900 bg-white p-4 shadow-xs transition hover:border-zinc-300 hover:shadow-sm"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Citas Hoy
            </span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 font-mono">
              {todayAppointments.length}
            </p>
            <p className="text-[11px] text-zinc-500 group-hover:text-zinc-700">Turnos agendados &rarr;</p>
          </div>
          <div className="grid size-11 place-items-center rounded-lg bg-zinc-100 text-zinc-800 transition group-hover:bg-zinc-900 group-hover:text-white">
            <CalendarDays className="size-5" />
          </div>
        </Link>

        {/* Card 2: Por Confirmar */}
        <Link
          href="/admin/agenda"
          className="group flex items-center justify-between rounded-lg border border-zinc-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-xs transition hover:border-amber-300 hover:shadow-sm"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Por Confirmar
            </span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 font-mono">
              {pendingCount}
            </p>
            <p className="text-[11px] text-zinc-500 group-hover:text-amber-700">Pendientes de respuesta &rarr;</p>
          </div>
          <div className="grid size-11 place-items-center rounded-lg bg-amber-50 text-amber-700 transition group-hover:bg-amber-500 group-hover:text-white">
            <Clock className="size-5" />
          </div>
        </Link>

        {/* Card 3: Próximos 7 días */}
        <Link
          href="/admin/agenda"
          className="group flex items-center justify-between rounded-lg border border-zinc-200 border-l-4 border-l-sky-600 bg-white p-4 shadow-xs transition hover:border-sky-300 hover:shadow-sm"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
              Próximos 7 Días
            </span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 font-mono">
              {weekCount}
            </p>
            <p className="text-[11px] text-zinc-500 group-hover:text-sky-700">Citas en calendario &rarr;</p>
          </div>
          <div className="grid size-11 place-items-center rounded-lg bg-sky-50 text-sky-700 transition group-hover:bg-sky-600 group-hover:text-white">
            <Users className="size-5" />
          </div>
        </Link>

        {/* Card 4: Facturación estimada */}
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 border-l-4 border-l-emerald-600 bg-white p-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Facturación Estimada
            </span>
            <p className="mt-1 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl font-mono">
              {formatPrice(revenue, settings.currency)}
            </p>
            <p className="text-[11px] text-zinc-500">Total jornada de hoy</p>
          </div>
          <div className="grid size-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <TrendingUp className="size-5" />
          </div>
        </div>
      </div>

      {/* Quick Team Status Strip (Metis Box) */}
      {activeStaff.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-zinc-200 bg-zinc-50/75 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="size-4 text-zinc-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Disponibilidad del Equipo Hoy
              </h2>
            </div>
            <Link
              href="/admin/horarios"
              className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-950 underline"
            >
              Configurar horarios
            </Link>
          </div>

          <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {activeStaff.map((member) => {
              const count = member.appointments.length;
              return (
                <Link
                  key={member.id}
                  href="/admin/agenda"
                  className="flex items-center gap-3 rounded-md border border-zinc-200/80 bg-zinc-50/60 p-3 transition hover:border-zinc-400 hover:bg-zinc-100/80 cursor-pointer shadow-xs"
                  title={`Ver agenda de ${member.name}`}
                >
                  <div
                    className="flex size-9 items-center justify-center rounded font-mono text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-zinc-900">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {count} {count === 1 ? "turno hoy" : "turnos hoy"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
