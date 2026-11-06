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
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          {labelDateLong(today)}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Resumen del día</h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          icon={<CalendarDays className="size-4" />}
          label="Turnos hoy"
          value={String(todayAppointments.length)}
        />
        <Stat
          icon={<CalendarClock className="size-4" />}
          label="Próximos 7 días"
          value={String(weekAppointments)}
        />
        <Stat
          icon={<CircleDollarSign className="size-4" />}
          label="Estimado hoy"
          value={formatPrice(revenue, settings.currency)}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Turnos de hoy</h2>
          <Link
            href="/admin/agenda"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            Ver agenda
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 p-6 text-sm text-muted">
            No hay turnos para hoy. Podés compartir el link de reservas para llenar la
            agenda.
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Clock3 className="size-4 text-amber-600" />
          <h2 className="text-lg font-semibold tracking-tight">Pendientes de confirmar</h2>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 p-6 text-sm text-muted">
            Todo confirmado. Sin pendientes por ahora.
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
