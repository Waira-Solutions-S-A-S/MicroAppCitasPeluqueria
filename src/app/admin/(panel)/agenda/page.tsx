import type { Metadata } from "next";
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

export const metadata: Metadata = { title: "Agenda de citas · Panel" };

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
    <div className="space-y-6 antialiased text-zinc-900">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Agenda del Estudio
          </p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight text-zinc-900 capitalize sm:text-3xl">
            {labelDateLong(day)}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/reservar"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800"
          >
            <Plus className="size-3.5" />
            <span>Cargar reserva</span>
          </Link>
          <Link
            href={`/admin/agenda?fecha=${dateKey(addDays(day, -1))}`}
            className="grid size-11 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-xs transition hover:border-zinc-400 hover:text-zinc-950"
            aria-label="Día anterior"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={`/admin/agenda?fecha=${dateKey(today)}`}
            className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-800 shadow-xs transition hover:border-zinc-400 hover:text-zinc-950"
          >
            Hoy
          </Link>
          <Link
            href={`/admin/agenda?fecha=${dateKey(addDays(day, 1))}`}
            className="grid size-11 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-xs transition hover:border-zinc-400 hover:text-zinc-950"
            aria-label="Día siguiente"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2 text-xs font-medium">
        <span className="rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-zinc-800 shadow-xs">
          {active.length} turnos totales
        </span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-emerald-800 shadow-xs">
          {confirmed} confirmados
        </span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-amber-800 shadow-xs">
          {pending} pendientes
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center text-xs text-zinc-600">
          No hay turnos agendados para este día.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              businessName={settings.businessName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
