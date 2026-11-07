import { Check, CheckCheck, MessageCircle, X } from "lucide-react";

import { updateAppointmentStatusAction } from "@/app/admin/actions";
import { STATUS_CLASSES, STATUS_LABELS } from "@/lib/format";
import { labelTime } from "@/lib/time";

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

export function AppointmentCard({ appointment }: { appointment: AppointmentRow }) {
  const cleanPhone = appointment.clientPhone.replace(/\D/g, "");

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
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
          >
            <MessageCircle className="size-3.5 text-emerald-600" />
            <span>Contactar WhatsApp</span>
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
