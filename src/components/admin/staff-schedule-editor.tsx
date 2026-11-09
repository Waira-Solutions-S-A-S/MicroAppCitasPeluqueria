"use client";

import { useState } from "react";
import { Save } from "lucide-react";

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

      <div className="pb-2 border-b border-zinc-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
          Horario semanal de atención
        </p>
        <p className="text-[11px] text-zinc-500">
          Configura cada día de la semana y pulsa &ldquo;Guardar horarios de {staffName}&rdquo; para aplicar los cambios.
        </p>
      </div>

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
