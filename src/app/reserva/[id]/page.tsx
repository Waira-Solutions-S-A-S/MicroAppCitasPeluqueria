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

import { formatPrice, STATUS_CLASSES, STATUS_LABELS } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { labelDateLong, labelTime } from "@/lib/time";

import { cancelPublicAppointment } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tu reserva" };

export default async function ReservaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nueva?: string }>;
}) {
  const { id } = await params;
  const { nueva } = await searchParams;

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
    <div className="mx-auto w-full max-w-2xl px-5 pb-20">
      <header className="flex items-center justify-between py-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          {settings.businessName}
        </Link>
        <Link
          href="/reservar"
          className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium transition hover:border-brand/40 hover:text-brand"
        >
          Nueva reserva
        </Link>
      </header>

      {isNew && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <p>
            ¡Listo! Guardamos tu turno. El estudio va a confirmarlo y te contacta por
            teléfono.
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Reserva
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {appointment.service.name}
            </h1>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
              STATUS_CLASSES[appointment.status] ?? "bg-stone-100 text-stone-700 ring-stone-200"
            }`}
          >
            {STATUS_LABELS[appointment.status] ?? appointment.status}
          </span>
        </div>

        <dl className="mt-6 space-y-3.5 text-sm">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand" />
            <div>
              <dt className="text-muted">Fecha</dt>
              <dd className="font-medium capitalize">{labelDateLong(appointment.startAt)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-brand" />
            <div>
              <dt className="text-muted">Horario</dt>
              <dd className="font-medium">
                {labelTime(appointment.startAt)} a {labelTime(appointment.endAt)} hs
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="mt-0.5 size-4 shrink-0 text-brand" />
            <div>
              <dt className="text-muted">Profesional</dt>
              <dd className="font-medium">{appointment.staff.name}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Scissors className="mt-0.5 size-4 shrink-0 text-brand" />
            <div>
              <dt className="text-muted">Duración</dt>
              <dd className="font-medium">{appointment.service.durationMin} minutos</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-brand" />
            <div>
              <dt className="text-muted">Contacto</dt>
              <dd className="font-medium">
                {appointment.clientName} · {appointment.clientPhone}
              </dd>
            </div>
          </div>
          {seriesCount > 1 && (
            <div className="flex items-start gap-3">
              <Repeat className="mt-0.5 size-4 shrink-0 text-brand" />
              <div>
                <dt className="text-muted">Serie recurrente</dt>
                <dd className="font-medium">
                  {seriesCount} turnos reservados en esta serie
                </dd>
              </div>
            </div>
          )}
          {appointment.notes && (
            <div className="rounded-xl bg-cream/70 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                Notas
              </dt>
              <dd className="mt-1 text-ink/80">{appointment.notes}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
          <span className="text-sm text-muted">Precio de referencia</span>
          <span className="text-lg font-semibold">
            {formatPrice(appointment.service.priceCents, settings.currency)}
          </span>
        </div>

        {canCancel && (
          <form action={cancelPublicAppointment} className="mt-6">
            <input type="hidden" name="id" value={appointment.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              <XCircle className="size-4" />
              Cancelar este turno
            </button>
            <p className="mt-2 text-xs text-muted">
              Se libera el horario para otra persona. Si es parte de una serie, cancelá
              cada turno por separado.
            </p>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Guardá este enlace para consultar o cancelar tu turno.
      </p>
    </div>
  );
}
