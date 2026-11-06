import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { AppointmentCard } from "@/components/admin/appointment-card";
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

  const appointments = await prisma.appointment.findMany({
    where: { startAt: { gte: day, lt: nextDay } },
    orderBy: { startAt: "asc" },
    include: { service: true, staff: true },
  });

  const active = appointments.filter((appointment) => appointment.status !== "CANCELLED");
  const pending = active.filter((appointment) => appointment.status === "PENDING").length;
  const confirmed = active.filter(
    (appointment) => appointment.status === "CONFIRMED",
  ).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Agenda</p>
          <h1 className="mt-1 text-2xl font-semibold capitalize tracking-tight">
            {labelDateLong(day)}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/reservar"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand/90"
          >
            <Plus className="size-4" />
            Nueva reserva
          </Link>
          <Link
            href={`/admin/agenda?fecha=${dateKey(addDays(day, -1))}`}
            className="grid size-9 place-items-center rounded-full border border-ink/10 bg-white transition hover:border-brand/40 hover:text-brand"
            aria-label="Día anterior"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={`/admin/agenda?fecha=${dateKey(today)}`}
            className="rounded-full border border-ink/10 bg-white px-3 py-2 text-xs font-semibold transition hover:border-brand/40 hover:text-brand"
          >
            Hoy
          </Link>
          <Link
            href={`/admin/agenda?fecha=${dateKey(addDays(day, 1))}`}
            className="grid size-9 place-items-center rounded-full border border-ink/10 bg-white transition hover:border-brand/40 hover:text-brand"
            aria-label="Día siguiente"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 text-xs font-medium">
        <span className="rounded-full bg-white px-3 py-1.5 text-ink ring-1 ring-ink/10">
          {active.length} turnos
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">
          {confirmed} confirmados
        </span>
        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-200">
          {pending} pendientes
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 p-6 text-sm text-muted">
          Este día no tiene turnos.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
}
