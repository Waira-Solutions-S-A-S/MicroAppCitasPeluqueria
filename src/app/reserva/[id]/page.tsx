import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Phone,
  Repeat,
  Scissors,
  User,
  XCircle,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { formatPrice, STATUS_CLASSES, STATUS_LABELS } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { labelDateLong, labelTime } from "@/lib/time";

import { cancelPublicAppointment } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Confirmación de Turno" };

export default async function ReservaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nueva?: string }>;
}) {
  const { id } = await params;
  const { nueva } = await searchParams;

  const user = await getCurrentUser();

  const [appointment, settings] = await Promise.all([
    prisma.appointment.findUnique({
      where: { id },
      include: { service: true, staff: true },
    }),
    getSettings(),
  ]);

  if (!appointment) notFound();

  const seriesCount = appointment.seriesId
    ? await prisma.appointment.count({ where: { seriesId: appointment.seriesId } })
    : 0;

  const isNew = nueva === "1";
  const canCancel =
    appointment.status === "PENDING" || appointment.status === "CONFIRMED";

  return (
    <div className="mx-auto w-full max-w-xl px-6 pb-20 pt-8 antialiased text-zinc-900">
      <header className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4">
        <Link href="/" className="text-base font-semibold tracking-tight text-zinc-950">
          {settings.businessName}
        </Link>
        <Link
          href={user ? "/admin/reservar" : "/reservar"}
          className="inline-flex min-h-[38px] items-center rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:text-zinc-950"
        >
          Nueva reserva
        </Link>
      </header>

      {isNew && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 shadow-xs">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <p className="leading-relaxed">
            ¡Tu turno fue registrado exitosamente! Te esperamos en el estudio en la fecha y horario
            indicados.
          </p>
        </div>
      )}

      {/* Comprobante Sattis Studio */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              Comprobante de turno
            </p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight text-zinc-900">
              {appointment.service.name}
            </h1>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
              STATUS_CLASSES[appointment.status] ?? "bg-zinc-100 text-zinc-800 ring-zinc-200"
            }`}
          >
            {STATUS_LABELS[appointment.status] ?? appointment.status}
          </span>
        </div>

        <dl className="mt-6 space-y-4 text-xs text-zinc-600">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-zinc-400" />
            <div>
              <dt className="text-zinc-400">Fecha</dt>
              <dd className="font-semibold text-zinc-950 capitalize">
                {labelDateLong(appointment.startAt)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-zinc-400" />
            <div>
              <dt className="text-zinc-400">Horario</dt>
              <dd className="font-semibold text-zinc-950">
                {labelTime(appointment.startAt)} a {labelTime(appointment.endAt)} hs
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="mt-0.5 size-4 shrink-0 text-zinc-400" />
            <div>
              <dt className="text-zinc-400">Profesional a cargo</dt>
              <dd className="font-semibold text-zinc-950">{appointment.staff.name}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Scissors className="mt-0.5 size-4 shrink-0 text-zinc-400" />
            <div>
              <dt className="text-zinc-400">Duración</dt>
              <dd className="font-semibold text-zinc-950">
                {appointment.service.durationMin} minutos
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-zinc-400" />
            <div>
              <dt className="text-zinc-400">Titular del turno</dt>
              <dd className="font-semibold text-zinc-950">
                {appointment.clientName} · {appointment.clientPhone}
              </dd>
            </div>
          </div>

          {seriesCount > 1 && (
            <div className="flex items-start gap-3">
              <Repeat className="mt-0.5 size-4 shrink-0 text-zinc-400" />
              <div>
                <dt className="text-zinc-400">Serie periódica</dt>
                <dd className="font-semibold text-zinc-950">
                  {seriesCount} turnos reservados en total
                </dd>
              </div>
            </div>
          )}

          {appointment.notes && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Notas
              </dt>
              <dd className="mt-1 text-xs text-zinc-700 leading-relaxed">
                {appointment.notes}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5 text-sm">
          <span className="text-xs text-zinc-500">Total a abonar en el estudio</span>
          <span className="text-lg font-black text-zinc-950">
            {formatPrice(appointment.service.priceCents, settings.currency)}
          </span>
        </div>

        {canCancel && (
          <div className="mt-8 border-t border-zinc-100 pt-5">
            <form action={cancelPublicAppointment}>
              <input type="hidden" name="id" value={appointment.id} />
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-xs font-semibold text-red-700 shadow-xs transition hover:bg-red-50 hover:border-red-300 active:scale-98 cursor-pointer"
              >
                <XCircle className="size-4" />
                <span>Cancelar este turno</span>
              </button>
              <p className="mt-2 text-xs text-zinc-600">
                Se liberará el horario de forma inmediata para que otra persona pueda reservarlo.
              </p>
            </form>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500">
        Guarda este enlace para consultar o gestionar tu turno en cualquier momento.
      </p>
    </div>
  );
}
