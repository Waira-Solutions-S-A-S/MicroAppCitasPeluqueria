import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  Clock3,
} from "lucide-react";

import { AppointmentCard } from "@/components/admin/appointment-card";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { addDays, labelDateLong, nowWallClock, startOfDay } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Resumen del día · Panel" };

export default async function AdminHomePage() {
  const settings = await getSettings();
  const today = startOfDay(nowWallClock(settings.timezone));
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  const [todayAppointments, pending, weekAppointments] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        startAt: { gte: today, lt: tomorrow },
        status: { not: "CANCELLED" },
      },
      orderBy: { startAt: "asc" },
      include: { service: true, staff: true },
    }),
    prisma.appointment.findMany({
      where: { status: "PENDING", startAt: { gte: today } },
      orderBy: { startAt: "asc" },
      take: 5,
      include: { service: true, staff: true },
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

  return (
    <div className="space-y-8 antialiased text-zinc-900">
      <header className="border-b border-zinc-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {labelDateLong(today)}
        </p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl">
          Resumen de Actividad
        </h1>
      </header>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<CalendarDays className="size-4 text-zinc-600" />}
          label="Citas para hoy"
          value={String(todayAppointments.length)}
          subtitle="Agendadas"
        />
        <Stat
          icon={<CalendarClock className="size-4 text-zinc-600" />}
          label="Próximos 7 días"
          value={String(weekAppointments)}
          subtitle="En agenda"
        />
        <Stat
          icon={<CircleDollarSign className="size-4 text-zinc-600" />}
          label="Ingreso estimado hoy"
          value={formatPrice(revenue, settings.currency)}
          subtitle="Total turnos del día"
        />
      </div>

      {/* Today's Appointments */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-medium text-zinc-950">Turnos de hoy</h2>
            <p className="text-xs text-zinc-600">Ordenados cronológicamente</p>
          </div>
          <Link
            href="/admin/agenda"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-900 hover:underline"
          >
            <span>Ver agenda completa</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center text-xs text-zinc-600">
            No hay turnos registrados para hoy. Puedes compartir el enlace de reservas o cargar una
            cita manual.
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>

      {/* Pending Confirmation */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="size-4 text-amber-600" />
          <h2 className="text-base font-medium text-zinc-950">Pendientes de confirmación</h2>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center text-xs text-zinc-600">
            Todo al día. No tienes reservas pendientes de confirmación.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-700">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-medium text-zinc-950 tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
    </div>
  );
}
