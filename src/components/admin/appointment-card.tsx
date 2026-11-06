import { Check, CheckCheck, X } from "lucide-react";

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
  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-14 shrink-0">
            <p className="text-base font-semibold leading-tight">
              {labelTime(appointment.startAt)}
            </p>
            <p className="text-[11px] text-muted">{labelTime(appointment.endAt)} hs</p>
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{appointment.service.name}</p>
            <p className="truncate text-sm text-muted">
              {appointment.clientName} · {appointment.clientPhone}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: appointment.staff.color }}
              />
              {appointment.staff.name}
            </p>
            {appointment.notes && (
              <p className="mt-1.5 line-clamp-2 text-xs text-ink/60">{appointment.notes}</p>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
            STATUS_CLASSES[appointment.status] ?? "bg-stone-100 text-stone-700 ring-stone-200"
          }`}
        >
          {STATUS_LABELS[appointment.status] ?? appointment.status}
        </span>
      </div>

      {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
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
        </div>
      )}
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
      ? "border-red-200 text-red-700 hover:bg-red-50"
      : tone === "complete"
        ? "border-sky-200 text-sky-700 hover:bg-sky-50"
        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50";

  return (
    <form action={updateAppointmentStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${classes}`}
      >
        {children}
      </button>
    </form>
  );
}
