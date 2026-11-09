"use client";

import { useState } from "react";
import { Check, Copy, RotateCcw, Save } from "lucide-react";

import { saveHoursAction } from "@/app/admin/actions";
import { minutesToLabel, WEEKDAYS } from "@/lib/time";

type WorkingHourItem = {
  weekday: number;
  startMin: number;
  endMin: number;
  isClosed: boolean;
};

type DaySchedule = {
  name: string;
  weekday: number;
  start: string;
  end: string;
  isOpen: boolean;
};

export function StaffScheduleEditor({
  staffId,
  staffName,
  workingHours,
}: {
  staffId: string;
  staffName: string;
  workingHours: WorkingHourItem[];
}) {
  const byDay = new Map(workingHours.map((h) => [h.weekday, h]));

  const initialDays: DaySchedule[] = WEEKDAYS.map((name, weekday) => {
    const existing = byDay.get(weekday);
    return {
      name,
      weekday,
      start: minutesToLabel(existing ? existing.startMin : 9 * 60),
      end: minutesToLabel(
        existing ? existing.endMin : weekday === 6 ? 14 * 60 : 19 * 60,
      ),
      isOpen: existing ? !existing.isClosed : weekday !== 0,
    };
  });

  const [days, setDays] = useState<DaySchedule[]>(initialDays);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const copyMondayToWeekdays = () => {
    const monday = days[1]; // Lunes es índice 1
    if (!monday) return;

    setDays((prev) =>
      prev.map((day) => {
        // Replicar horario de lunes de martes a viernes (2 a 5)
        if (day.weekday >= 2 && day.weekday <= 5) {
          return {
            ...day,
            start: monday.start,
            end: monday.end,
            isOpen: monday.isOpen,
          };
        }
        return day;
      }),
    );

    setCopiedNotice("Horario de lunes copiado a martes, miércoles, jueves y viernes.");
    setTimeout(() => setCopiedNotice(null), 3000);
  };

  const applyCommercialHours = () => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.weekday === 0) {
          // Domingo cerrado
          return { ...day, start: "09:00", end: "19:00", isOpen: false };
        }
        if (day.weekday === 6) {
          // Sábado media jornada
          return { ...day, start: "09:00", end: "14:00", isOpen: true };
        }
        // Lunes a Viernes jornada estándar
        return { ...day, start: "09:00", end: "19:00", isOpen: true };
      }),
    );
    setCopiedNotice("Plantilla aplicada (Lun-Vie 9-19hs, Sáb 9-14hs, Dom libre).");
    setTimeout(() => setCopiedNotice(null), 3000);
  };

  return (
    <form action={saveHoursAction} className="space-y-3">
      <input type="hidden" name="staffId" value={staffId} />

      {/* Hidden inputs para respaldo y compatibilidad 100% con FormData */}
      {days.map((day) => (
        <div key={day.weekday} className="hidden">
          <input
            type="hidden"
            name={`open_${day.weekday}`}
            value={day.isOpen ? "true" : "false"}
          />
          <input
            type="hidden"
            name={`start_${day.weekday}`}
            value={day.start}
          />
          <input
            type="hidden"
            name={`end_${day.weekday}`}
            value={day.end}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-100">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
            Horario semanal de atención
          </p>
          <p className="text-[11px] text-zinc-500">
            Ajusta los días y horarios en la tabla inferior y haz clic en &ldquo;Guardar horarios&rdquo; para aplicar los cambios.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyMondayToWeekdays}
            className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer shadow-xs"
            title="Copiar horas del lunes al resto de la semana laboral"
          >
            <Copy className="size-3 text-zinc-500" />
            <span>Copiar Lunes a Mar-Vie</span>
          </button>

          <button
            type="button"
            onClick={applyCommercialHours}
            className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer shadow-xs"
            title="Restablecer plantilla comercial habitual"
          >
            <RotateCcw className="size-3 text-zinc-500" />
            <span>Horario habitual</span>
          </button>
        </div>
      </div>

      {copiedNotice && (
        <div className="rounded bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 flex items-center gap-1.5">
          <Check className="size-3.5 text-emerald-600 shrink-0" />
          <span>{copiedNotice}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded border border-zinc-200">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-[11px] font-semibold text-zinc-600 uppercase bg-[#f8f9fa]">
              <th className="py-2.5 px-3">Día</th>
              <th className="py-2.5 px-3">Estado</th>
              <th className="py-2.5 px-3">Hora Inicio</th>
              <th className="py-2.5 px-3">Hora Cierre</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {days.map((day) => (
              <tr
                key={day.weekday}
                className={`transition-colors ${
                  !day.isOpen ? "bg-zinc-50/70 text-zinc-400" : "hover:bg-zinc-50/50"
                }`}
              >
                <td className="py-2 px-3 font-semibold text-zinc-900">
                  {day.name}
                </td>

                <td className="py-2 px-3">
                  <select
                    name={`open-${day.weekday}`}
                    value={day.isOpen ? "true" : "false"}
                    onChange={(e) => {
                      const val = e.target.value === "true";
                      setDays((prev) =>
                        prev.map((d) => (d.weekday === day.weekday ? { ...d, isOpen: val } : d)),
                      );
                    }}
                    className={`h-7 rounded border px-2 text-xs font-semibold outline-none transition cursor-pointer ${
                      day.isOpen
                        ? "border-emerald-300 bg-emerald-50/70 text-emerald-950 focus:border-emerald-600"
                        : "border-zinc-300 bg-zinc-100 text-zinc-600 focus:border-zinc-500"
                    }`}
                  >
                    <option value="true">Abierto (Atiende)</option>
                    <option value="false">Cerrado (Libre)</option>
                  </select>
                </td>

                <td className="py-2 px-3">
                  <input
                    type="time"
                    name={`start-${day.weekday}`}
                    value={day.start}
                    disabled={!day.isOpen}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDays((prev) =>
                        prev.map((d) => (d.weekday === day.weekday ? { ...d, start: val } : d)),
                      );
                    }}
                    className={`h-7 rounded border border-zinc-300 bg-white px-2 font-mono text-xs text-zinc-800 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                      !day.isOpen ? "opacity-30 cursor-not-allowed bg-zinc-100" : ""
                    }`}
                  />
                </td>

                <td className="py-2 px-3">
                  <input
                    type="time"
                    name={`end-${day.weekday}`}
                    value={day.end}
                    disabled={!day.isOpen}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDays((prev) =>
                        prev.map((d) => (d.weekday === day.weekday ? { ...d, end: val } : d)),
                      );
                    }}
                    className={`h-7 rounded border border-zinc-300 bg-white px-2 font-mono text-xs text-zinc-800 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                      !day.isOpen ? "opacity-30 cursor-not-allowed bg-zinc-100" : ""
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <p className="text-[11px] text-zinc-500">
          Haz clic en el botón para persistir la configuración semanal en el sistema.
        </p>

        <button
          type="submit"
          className="inline-flex min-h-[32px] items-center gap-1.5 rounded bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
        >
          <Save className="size-3.5" />
          <span>Guardar horarios de {staffName}</span>
        </button>
      </div>
    </form>
  );
}
