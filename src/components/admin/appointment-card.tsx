import { Check, CheckCheck, MessageCircle, X } from "lucide-react";

import { updateAppointmentStatusAction } from "@/app/admin/actions";
import { STATUS_CLASSES, STATUS_LABELS } from "@/lib/format";
import { labelDateLong, labelTime } from "@/lib/time";

export type AppointmentRow = {
  id: string;
  startAt: Date;
  endAt: Date;
  clientName: string;
  clientPhone: string;
  status: string;
  notes: string | null;
  service: { name: string; durationMin: number; color: string };
  staff: { name: string; color: string };
};

function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Si tiene 10 dígitos y empieza por 3 (celular habitual en Colombia), antepone código 57
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
  startAt,
  status,
}: {
  clientName: string;
  businessName: string;
  serviceName: string;
  staffName: string;
  startAt: Date;
  status: string;
}) {
  const dateStr = labelDateLong(startAt);
  const timeStr = labelTime(startAt);

  if (status === "PENDING") {
    return `Hola ${clientName}, te escribo de *${businessName}*.\n\nRecibimos tu solicitud de turno:\n- Servicio: *${serviceName}*\n- Profesional: *${staffName}*\n- Fecha: *${dateStr}*\n- Horario: *${timeStr} hs*\n\n¿Nos confirmas tu asistencia para agendarlo formalmente? ¡Muchas gracias!`;
  }

  if (status === "CONFIRMED") {
    return `Hola ${clientName}, te escribo de *${businessName}* para recordarte tu turno:\n- Servicio: *${serviceName}*\n- Profesional: *${staffName}*\n- Fecha: *${dateStr}*\n- Horario: *${timeStr} hs*\n\n¡Te esperamos en el estudio!`;
  }

  if (status === "COMPLETED") {
    return `Hola ${clientName}, muchas gracias por tu visita a *${businessName}*. Esperamos que hayas tenido una excelente experiencia con *${staffName}*. ¡Hasta la próxima!`;
  }

  return `Hola ${clientName}, te escribo de *${businessName}* con relación a tu turno de *${serviceName}* para el día *${dateStr}* a las *${timeStr} hs*.`;
}

export function AppointmentCard({
  appointment,
  businessName = "Sattis Studio",
}: {
  appointment: AppointmentRow;
  businessName?: string;
}) {
  const cleanPhone = formatWhatsAppPhone(appointment.clientPhone);
  const waMessage = buildAdminWhatsAppMessage({
    clientName: appointment.clientName,
    businessName,
    serviceName: appointment.service.name,
    staffName: appointment.staff.name,
    startAt: appointment.startAt,
    status: appointment.status,
  });
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-14 shrink-0">
            <p className="text-base font-semibold leading-tight text-zinc-950">
              {labelTime(appointment.startAt)}
            </p>
            <p className="text-xs text-zinc-500">{labelTime(appointment.endAt)} hs</p>
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-zinc-950">{appointment.service.name}</p>
            <p className="truncate text-xs text-zinc-600">
              {appointment.clientName} · {appointment.clientPhone}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <span
                className="inline-block size-2 rounded-full ring-1 ring-zinc-300"
                style={{ backgroundColor: appointment.staff.color }}
              />
              {appointment.staff.name}
            </p>
            {appointment.notes && (
              <p className="mt-2 line-clamp-2 rounded-lg bg-zinc-50 p-2 text-xs text-zinc-600">
                {appointment.notes}
              </p>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
            STATUS_CLASSES[appointment.status] ?? "bg-zinc-100 text-zinc-700 ring-zinc-200"
          }`}
        >
          {STATUS_LABELS[appointment.status] ?? appointment.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
        {cleanPhone.length >= 7 && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-1.5 text-xs font-semibold text-emerald-950 shadow-xs transition hover:bg-emerald-100 hover:border-emerald-300 active:scale-98"
            title="Abrir chat en WhatsApp con mensaje listo para enviar"
          >
            <MessageCircle className="size-3.5 text-emerald-600" />
            <span>WhatsApp (mensaje listo)</span>
          </a>
        )}

        {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
          <>
            {appointment.status === "PENDING" && (
              <StatusButton id={appointment.id} status="CONFIRMED" tone="confirm">
                <Check className="size-3.5" />
                Confirmar
              </StatusButton>
            )}
            {appointment.status === "CONFIRMED" && (
              <StatusButton id={appointment.id} status="COMPLETED" tone="complete">
                <CheckCheck className="size-3.5" />
                Completar
              </StatusButton>
            )}
            <StatusButton id={appointment.id} status="CANCELLED" tone="cancel">
              <X className="size-3.5" />
              Cancelar
            </StatusButton>
          </>
        )}
      </div>
    </article>
  );
}

function StatusButton({
  id,
  status,
  tone,
  children,
}: {
  id: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
  tone: "confirm" | "complete" | "cancel";
  children: React.ReactNode;
}) {
  const classes =
    tone === "cancel"
      ? "border-zinc-200 text-zinc-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
      : tone === "complete"
        ? "border-zinc-200 text-zinc-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
        : "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800";

  return (
    <form action={updateAppointmentStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${classes}`}
      >
        {children}
      </button>
    </form>
  );
}
